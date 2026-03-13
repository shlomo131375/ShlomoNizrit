import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { sanitizeInput, isValidEmail } from "@/lib/sanitize";
import { rateLimit } from "@/lib/rateLimit";

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || "";
const PAYPAL_API = "https://api-m.paypal.com";

interface OrderItem {
  script_id: string;
  script_name: string;
  price: number;
}

async function verifyPayPalPayment(orderId: string): Promise<{ verified: boolean; amount?: string }> {
  if (!PAYPAL_CLIENT_SECRET) {
    // If no secret configured, skip verification (for development)
    return { verified: true };
  }

  try {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");
    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}`, {
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) return { verified: false };

    const data = await response.json();
    if (data.status === "COMPLETED") {
      const amount = data.purchase_units?.[0]?.amount?.value;
      return { verified: true, amount };
    }
    return { verified: false };
  } catch {
    return { verified: false };
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - max 5 orders per minute per IP
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const { allowed } = rateLimit(ip, { maxRequests: 5, windowMs: 60_000 });
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const body = await request.json();
    const {
      paypal_order_id,
      payment_method,
      user_email,
      user_name,
      user_phone,
      user_country,
      user_city,
      receipt_name,
      accept_updates,
      user_id,
      items,
      total_amount,
      discount_amount,
      coupon_code,
    } = body as {
      paypal_order_id?: string;
      payment_method: "paypal" | "contact";
      user_email: string;
      user_name: string;
      user_phone: string;
      user_country?: string;
      user_city?: string;
      receipt_name?: string | null;
      accept_updates?: boolean;
      user_id: string;
      items: OrderItem[];
      total_amount: number;
      discount_amount: number;
      coupon_code?: string;
    };

    // Validate and sanitize inputs
    if (!user_email || !items || items.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!isValidEmail(user_email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    // Sanitize text inputs
    const cleanName = sanitizeInput(user_name || "");
    const cleanPhone = sanitizeInput(user_phone || "");
    const cleanCoupon = coupon_code ? sanitizeInput(coupon_code) : null;

    // Check for duplicate orders — same user, same script
    if (user_id && user_id !== "anonymous") {
      const { data: existingOrders } = await supabaseServer
        .from("orders")
        .select("id, items")
        .eq("user_id", user_id);

      if (existingOrders && existingOrders.length > 0) {
        const orderedScriptIds = new Set<string>();
        for (const order of existingOrders) {
          const orderItems: OrderItem[] = typeof order.items === "string" ? JSON.parse(order.items) : order.items;
          for (const item of orderItems) {
            orderedScriptIds.add(item.script_id);
          }
        }

        const duplicates = items.filter((i: OrderItem) => orderedScriptIds.has(i.script_id));
        if (duplicates.length > 0) {
          const names = duplicates.map((d: OrderItem) => d.script_name).join(", ");
          return NextResponse.json(
            { error: `כבר קיימת הזמנה עבור: ${names}`, duplicate: true },
            { status: 409 }
          );
        }
      }
    }

    // For PayPal orders, verify the payment
    let paymentStatus = "pending";
    if (payment_method === "paypal" && paypal_order_id) {
      const { verified } = await verifyPayPalPayment(paypal_order_id);
      if (!verified) {
        return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
      }
      paymentStatus = "completed";
    }

    // Create the order
    const { data: order, error } = await supabaseServer
      .from("orders")
      .insert({
        user_id,
        user_email: user_email.trim(),
        user_name: cleanName,
        user_phone: cleanPhone,
        paypal_order_id: paypal_order_id || null,
        payment_method,
        payment_status: paymentStatus,
        items: JSON.stringify(items),
        total_amount,
        discount_amount: discount_amount || 0,
        coupon_code: cleanCoupon,
      })
      .select("id, download_token")
      .single();

    if (error) {
      console.error("Order creation error:", error);
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }

    // Send notification email to admin (fire and forget)
    sendAdminNotification({
      customerName: cleanName,
      customerEmail: user_email.trim(),
      customerPhone: cleanPhone,
      customerCountry: user_country || "",
      customerCity: user_city || "",
      receiptName: receipt_name ? sanitizeInput(receipt_name) : null,
      acceptUpdates: accept_updates || false,
      items,
      totalAmount: total_amount,
      discountAmount: discount_amount || 0,
      couponCode: cleanCoupon,
      paymentMethod: payment_method,
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      order_id: order.id,
      download_token: paymentStatus === "completed" ? order.download_token : null,
      payment_status: paymentStatus,
    });
  } catch (err) {
    console.error("Order API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

interface NotificationData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCountry: string;
  customerCity: string;
  receiptName: string | null;
  acceptUpdates: boolean;
  items: OrderItem[];
  totalAmount: number;
  discountAmount: number;
  couponCode: string | null;
  paymentMethod: string;
}

async function sendAdminNotification(data: NotificationData) {
  console.log(`
=== NEW ORDER ===
Customer: ${data.customerName} (${data.customerEmail})
Phone: ${data.customerPhone}
Location: ${data.customerCity}, ${data.customerCountry}
Receipt Name: ${data.receiptName || data.customerName}
Payment: ${data.paymentMethod}
Items: ${data.items.map((i) => i.script_name).join(", ")}
Total: ₪${data.totalAmount}
=================
  `);

  const webhookUrl = process.env.NOTIFICATION_WEBHOOK_URL;
  if (webhookUrl) {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "new_order",
        customer: {
          name: data.customerName,
          email: data.customerEmail,
          phone: data.customerPhone,
          country: data.customerCountry,
          city: data.customerCity,
          accept_updates: data.acceptUpdates,
        },
        order: {
          payment_method: data.paymentMethod,
          total: data.totalAmount,
          discount: data.discountAmount,
          coupon_code: data.couponCode,
          currency: "ILS",
          receipt_name: data.receiptName || data.customerName,
          items: data.items.map((i) => ({
            name: i.script_name,
            price: i.price,
          })),
        },
        timestamp: new Date().toISOString(),
      }),
    }).catch(console.error);
  }
}
