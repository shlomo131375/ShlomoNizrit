import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || "";
const PAYPAL_API = "https://api-m.paypal.com";
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "";

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
    const body = await request.json();
    const {
      paypal_order_id,
      payment_method,
      user_email,
      user_name,
      user_phone,
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
      user_id: string;
      items: OrderItem[];
      total_amount: number;
      discount_amount: number;
      coupon_code?: string;
    };

    // Validate required fields
    if (!user_email || !items || items.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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
        user_email,
        user_name,
        user_phone,
        paypal_order_id: paypal_order_id || null,
        payment_method,
        payment_status: paymentStatus,
        items: JSON.stringify(items),
        total_amount,
        discount_amount: discount_amount || 0,
        coupon_code: coupon_code || null,
      })
      .select("id, download_token")
      .single();

    if (error) {
      console.error("Order creation error:", error);
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }

    // Send notification email to admin (fire and forget)
    sendAdminNotification(user_name, user_email, items, total_amount, payment_method).catch(console.error);

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

async function sendAdminNotification(
  customerName: string,
  customerEmail: string,
  items: OrderItem[],
  totalAmount: number,
  paymentMethod: string,
) {
  // Send WhatsApp-style notification via webhook (optional)
  // For now, we log it - admin can check the orders table in the admin panel
  console.log(`
=== NEW ORDER ===
Customer: ${customerName} (${customerEmail})
Payment: ${paymentMethod}
Items: ${items.map((i) => i.script_name).join(", ")}
Total: ₪${totalAmount}
=================
  `);

  // If admin email webhook is configured, send notification
  const webhookUrl = process.env.NOTIFICATION_WEBHOOK_URL;
  if (webhookUrl) {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `🛒 הזמנה חדשה!\nלקוח: ${customerName} (${customerEmail})\nתשלום: ${paymentMethod}\nפריטים: ${items.map((i) => i.script_name).join(", ")}\nסה"כ: ₪${totalAmount}`,
      }),
    }).catch(console.error);
  }
}
