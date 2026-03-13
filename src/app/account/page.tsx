"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/authContext";
import { useScripts } from "@/lib/scriptsContext";
import { useLanguage } from "@/lib/languageContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Gift, Tag, Download, Package, ShoppingBag, Calendar, Check, ExternalLink, User } from "lucide-react";

interface Order {
  id: string;
  items: { id: string; name: string; price: number }[];
  total_amount: number;
  discount_amount: number;
  coupon_code: string | null;
  payment_method: string;
  payment_status: string;
  download_token: string | null;
  created_at: string;
}

interface UserBenefit {
  id: string;
  benefit_type: "coupon" | "free_script";
  coupon_code: string | null;
  script_id: string | null;
  used: boolean;
  notes: string | null;
  created_at: string;
}

export default function AccountPage() {
  const { user, loading: authLoading } = useAuth();
  const { scripts } = useScripts();
  const { lang } = useLanguage();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [benefits, setBenefits] = useState<UserBenefit[]>([]);
  const [loading, setLoading] = useState(true);

  const isHe = lang === "he";

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const [ordersRes, benefitsRes] = await Promise.all([
        supabase
          .from("orders")
          .select("*")
          .eq("user_email", user.email)
          .order("created_at", { ascending: false }),
        supabase
          .from("user_benefits")
          .select("*")
          .eq("user_email", user.email?.toLowerCase())
          .eq("used", false)
          .order("created_at", { ascending: false }),
      ]);

      setOrders(ordersRes.data || []);
      setBenefits(benefitsRes.data || []);
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const getScriptName = (id: string) => {
    const s = scripts.find((s) => s.id === id);
    return s?.displayName || id;
  };

  const formatPrice = (price: number) => `₪${price}`;

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center text-t-dim text-sm">{isHe ? "טוען..." : "Loading..."}</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-6 lg:px-8 py-16">
      {/* Profile Header */}
      <div className="flex items-center gap-4 mb-10">
        <div className="w-14 h-14 rounded-full bg-[#d4920a]/20 flex items-center justify-center">
          {user.user_metadata?.avatar_url ? (
            <img src={user.user_metadata.avatar_url} alt="" className="w-14 h-14 rounded-full" referrerPolicy="no-referrer" />
          ) : (
            <span className="text-xl font-semibold text-[#e5a312]">
              {(user.user_metadata?.full_name || user.email || "U").charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div>
          <h1 className="text-xl font-bold text-t-primary tracking-tight">
            {isHe ? "שלום" : "Hello"}, {user.user_metadata?.full_name || user.email?.split("@")[0]}
          </h1>
          <p className="text-sm text-t-ghost" dir="ltr">{user.email}</p>
          {(user.user_metadata?.country || user.user_metadata?.city) && (
            <p className="text-xs text-t-ghost mt-0.5">
              {[user.user_metadata?.city, user.user_metadata?.country].filter(Boolean).join(", ")}
            </p>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-sm text-t-dim">{isHe ? "טוען..." : "Loading..."}</div>
      ) : (
        <>
          {/* Benefits Section */}
          {benefits.length > 0 && (
            <section className="mb-10">
              <h2 className="text-sm font-semibold text-t-secondary mb-4 flex items-center gap-2">
                <Gift className="w-4 h-4 text-[#e5a312]" strokeWidth={1.5} />
                {isHe ? "הטבות זמינות" : "Available Benefits"}
              </h2>
              <div className="space-y-3">
                {benefits.map((b) => (
                  <div key={b.id} className="bg-s-base border border-[#d4920a]/20 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {b.benefit_type === "free_script" ? (
                        <div className="w-9 h-9 rounded-lg bg-[#d4920a]/10 flex items-center justify-center">
                          <Download className="w-4 h-4 text-[#e5a312]" strokeWidth={1.5} />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-[#d4920a]/10 flex items-center justify-center">
                          <Tag className="w-4 h-4 text-[#e5a312]" strokeWidth={1.5} />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-t-primary">
                          {b.benefit_type === "free_script"
                            ? `${isHe ? "סקריפט חינם" : "Free Script"}: ${b.script_id ? getScriptName(b.script_id) : ""}`
                            : `${isHe ? "קוד קופון" : "Coupon"}: ${b.coupon_code}`}
                        </div>
                        {b.notes && <div className="text-xs text-t-ghost mt-0.5">{b.notes}</div>}
                      </div>
                    </div>
                    {b.benefit_type === "free_script" && b.script_id && (
                      <Link
                        href={`/api/download-free?id=${b.script_id}`}
                        className="flex items-center gap-1.5 bg-[#d4920a] hover:bg-[#e5a312] text-white px-4 py-2 rounded-lg text-xs font-medium transition-all duration-300"
                      >
                        <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
                        {isHe ? "הורדה" : "Download"}
                      </Link>
                    )}
                    {b.benefit_type === "coupon" && (
                      <div className="bg-[#d4920a]/10 text-[#e5a312] px-3 py-1.5 rounded-lg text-xs font-mono font-medium" dir="ltr">
                        {b.coupon_code}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Orders Section */}
          <section>
            <h2 className="text-sm font-semibold text-t-secondary mb-4 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#e5a312]" strokeWidth={1.5} />
              {isHe ? "ההזמנות שלי" : "My Orders"}
            </h2>

            {orders.length === 0 ? (
              <div className="text-center py-12 bg-s-base border border-b-subtle rounded-xl">
                <Package className="w-8 h-8 text-t-ghost mx-auto mb-3" strokeWidth={1.5} />
                <p className="text-sm text-t-dim">{isHe ? "אין הזמנות עדיין" : "No orders yet"}</p>
                <Link
                  href="/catalog"
                  className="inline-block mt-4 text-sm text-[#e5a312] hover:text-[#d4920a] transition-colors"
                >
                  {isHe ? "לקטלוג הסקריפטים" : "Browse Scripts"} →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-s-base border border-b-subtle rounded-xl overflow-hidden">
                    {/* Order header */}
                    <div className="px-5 py-4 flex items-center justify-between border-b border-b-subtle">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-t-ghost" strokeWidth={1.5} />
                          <span className="text-xs text-t-ghost">
                            {new Date(order.created_at).toLocaleDateString(isHe ? "he-IL" : "en-US")}
                          </span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          order.payment_status === "completed"
                            ? "bg-green-400/10 text-green-400"
                            : "bg-yellow-400/10 text-yellow-400"
                        }`}>
                          {order.payment_status === "completed"
                            ? (isHe ? "הושלם" : "Completed")
                            : (isHe ? "ממתין" : "Pending")}
                        </span>
                      </div>
                      <div className="text-sm font-semibold text-[#e5a312]">
                        {formatPrice(order.total_amount)}
                      </div>
                    </div>

                    {/* Order items */}
                    <div className="px-5 py-3">
                      <div className="space-y-2">
                        {(typeof order.items === "string" ? JSON.parse(order.items) : order.items).map((item: { id: string; name: string; price: number }) => (
                          <div key={item.id} className="flex items-center justify-between">
                            <span className="text-sm text-t-muted">{item.name}</span>
                            <span className="text-xs text-t-ghost">{formatPrice(item.price)}</span>
                          </div>
                        ))}
                      </div>

                      {order.discount_amount > 0 && (
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-b-subtle">
                          <span className="text-xs text-green-400 flex items-center gap-1">
                            <Tag className="w-3 h-3" strokeWidth={1.5} />
                            {isHe ? "הנחה" : "Discount"} {order.coupon_code && `(${order.coupon_code})`}
                          </span>
                          <span className="text-xs text-green-400">-{formatPrice(order.discount_amount)}</span>
                        </div>
                      )}
                    </div>

                    {/* Download link */}
                    {order.payment_status === "completed" && order.download_token && (
                      <div className="px-5 py-3 border-t border-b-subtle bg-s-hover/30">
                        <Link
                          href={`/download/${order.download_token}`}
                          className="flex items-center justify-center gap-2 w-full bg-[#d4920a] hover:bg-[#e5a312] text-white py-2.5 rounded-lg text-sm font-medium transition-all duration-300"
                        >
                          <Download className="w-4 h-4" strokeWidth={1.5} />
                          {isHe ? "עמוד הורדות" : "Downloads Page"}
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
