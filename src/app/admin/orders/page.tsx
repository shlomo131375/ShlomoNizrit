"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, ArrowRight, Eye, Check, Clock, X, Search, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface OrderItem {
  script_id: string;
  script_name: string;
  price: number;
}

interface Order {
  id: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  items: string;
  total_amount: number;
  discount_amount: number;
  coupon_code: string | null;
  payment_method: "paypal" | "contact";
  payment_status: string;
  paypal_order_id: string | null;
  download_token: string | null;
  created_at: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const parseItems = (items: string): OrderItem[] => {
    try {
      const parsed = typeof items === "string" ? JSON.parse(items) : items;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.user_name?.toLowerCase().includes(q) ||
      o.user_email?.toLowerCase().includes(q)
    );
  });

  const totalOrders = orders.length;
  const completedOrders = orders.filter((o) => o.payment_status === "completed").length;
  const pendingOrders = orders.filter((o) => o.payment_status === "pending").length;
  const totalRevenue = orders
    .filter((o) => o.payment_status === "completed")
    .reduce((sum, o) => sum + (o.total_amount || 0), 0);

  const markAsCompleted = async (orderId: string) => {
    setUpdatingId(orderId);
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const updatePayload: Record<string, unknown> = {
      payment_status: "completed",
    };

    // Generate download_token if missing
    if (!order.download_token) {
      const token = crypto.randomUUID();
      updatePayload.download_token = token;
    }

    await supabase.from("orders").update(updatePayload).eq("id", orderId);
    await fetchOrders();
    setUpdatingId(null);
  };

  const copyDownloadLink = async (token: string) => {
    const url = `${window.location.origin}/download/${token}`;
    await navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const deleteOrder = async (orderId: string) => {
    setDeletingId(orderId);
    await supabase.from("orders").delete().eq("id", orderId);
    setConfirmDeleteId(null);
    await fetchOrders();
    setDeletingId(null);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("he-IL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <Link href="/admin" className="text-xs text-t-ghost hover:text-t-dim transition-colors mb-2 inline-flex items-center gap-1">
            <ArrowRight className="w-3 h-3" strokeWidth={1.5} />
            ניהול
          </Link>
          <h1 className="text-2xl font-bold text-t-primary tracking-tight">הזמנות</h1>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="bg-s-base border border-b-subtle rounded-xl p-4">
          <div className="text-[11px] text-t-ghost mb-1">סה״כ הזמנות</div>
          <div className="text-xl font-bold text-t-primary">{totalOrders}</div>
        </div>
        <div className="bg-s-base border border-b-subtle rounded-xl p-4">
          <div className="text-[11px] text-t-ghost mb-1">הושלמו</div>
          <div className="text-xl font-bold text-green-400">{completedOrders}</div>
        </div>
        <div className="bg-s-base border border-b-subtle rounded-xl p-4">
          <div className="text-[11px] text-t-ghost mb-1">ממתינות</div>
          <div className="text-xl font-bold text-yellow-400">{pendingOrders}</div>
        </div>
        <div className="bg-s-base border border-b-subtle rounded-xl p-4">
          <div className="text-[11px] text-t-ghost mb-1">הכנסות</div>
          <div className="text-xl font-bold text-[#e5a312]">₪{totalRevenue}</div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-t-ghost" strokeWidth={1.5} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="חיפוש לפי שם או אימייל..."
          className="w-full bg-s-base border border-b-subtle rounded-xl pr-10 pl-4 py-3 text-sm text-t-primary placeholder-t-ghost focus:outline-none focus:border-[#d4920a]/30 transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-t-ghost hover:text-t-dim transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="text-center py-12 text-sm text-t-dim">טוען...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag className="w-8 h-8 text-t-ghost mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-sm text-t-dim">
            {searchQuery ? "לא נמצאו הזמנות תואמות" : "אין הזמנות עדיין"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const items = parseItems(order.items);
            const isCompleted = order.payment_status === "completed";
            const isPending = order.payment_status === "pending";

            return (
              <div
                key={order.id}
                className="bg-s-base border border-b-subtle rounded-xl p-5 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0">
                    <ShoppingBag className="w-4 h-4 text-[#e5a312] mt-0.5 shrink-0" strokeWidth={1.5} />
                    <div className="min-w-0">
                      {/* Customer info */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-t-secondary">{order.user_name || "—"}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full ${
                            isCompleted
                              ? "bg-green-400/10 text-green-400"
                              : "bg-yellow-400/10 text-yellow-400"
                          }`}
                        >
                          {isCompleted ? "הושלם" : "ממתין"}
                        </span>
                        <span className="text-[10px] bg-[#d4920a]/10 text-[#e5a312]/80 px-2 py-0.5 rounded-full">
                          {order.payment_method === "paypal" ? "PayPal" : "יצירת קשר"}
                        </span>
                      </div>

                      {/* Email */}
                      <div className="text-xs text-t-faint mt-0.5" dir="ltr">
                        {order.user_email}
                      </div>

                      {/* Items */}
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {items.map((item, i) => (
                          <span key={i} className="text-[11px] text-t-dim bg-s-hover px-2 py-0.5 rounded-md">
                            {item.script_name}
                          </span>
                        ))}
                      </div>

                      {/* Meta row */}
                      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-t-ghost">
                        <span className="font-medium text-[#e5a312]">₪{order.total_amount}</span>
                        {order.discount_amount > 0 && (
                          <span>הנחה: ₪{order.discount_amount}</span>
                        )}
                        {order.coupon_code && (
                          <span dir="ltr">קופון: {order.coupon_code}</span>
                        )}
                        <span>{formatDate(order.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isCompleted && order.download_token && (
                      <button
                        onClick={() => copyDownloadLink(order.download_token!)}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer bg-[#d4920a]/10 text-[#e5a312] hover:bg-[#d4920a]/20"
                        title="העתק קישור הורדה"
                      >
                        {copiedToken === order.download_token ? (
                          <>
                            <Check className="w-3 h-3" strokeWidth={2} />
                            הועתק
                          </>
                        ) : (
                          <>
                            <Eye className="w-3 h-3" strokeWidth={1.5} />
                            קישור
                          </>
                        )}
                      </button>
                    )}
                    {isPending && (
                      <button
                        onClick={() => markAsCompleted(order.id)}
                        disabled={updatingId === order.id}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer bg-green-400/10 text-green-400 hover:bg-green-400/20 disabled:opacity-50"
                        title="סמן כהושלם"
                      >
                        {updatingId === order.id ? (
                          <>
                            <Clock className="w-3 h-3 animate-spin" strokeWidth={1.5} />
                            מעדכן...
                          </>
                        ) : (
                          <>
                            <Check className="w-3 h-3" strokeWidth={2} />
                            אשר תשלום
                          </>
                        )}
                      </button>
                    )}
                    {confirmDeleteId === order.id ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => deleteOrder(order.id)}
                          disabled={deletingId === order.id}
                          className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-red-400/10 text-red-400 hover:bg-red-400/20 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {deletingId === order.id ? "מוחק..." : "אישור"}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="flex items-center text-xs px-2 py-1.5 rounded-lg text-t-ghost hover:text-t-dim transition-colors cursor-pointer"
                        >
                          <X className="w-3 h-3" strokeWidth={1.5} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(order.id)}
                        className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer text-t-ghost hover:bg-red-400/10 hover:text-red-400"
                        title="מחק הזמנה"
                      >
                        <Trash2 className="w-3 h-3" strokeWidth={1.5} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
