"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/authContext";
import { useScripts } from "@/lib/scriptsContext";
import { useLanguage } from "@/lib/languageContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Gift, Tag, Download, Package, ShoppingBag, Calendar, Check, User, Pencil, X, Save, Lock, Mail, MapPin, Phone, Loader2 } from "lucide-react";

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

  // Profile editing
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", country: "", city: "", phone: "" });
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password change
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ newPassword: "", confirmPassword: "" });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const isHe = lang === "he";
  const isGoogleUser = user?.app_metadata?.provider === "google";

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.user_metadata?.full_name || "",
        country: user.user_metadata?.country || "",
        city: user.user_metadata?.city || "",
        phone: user.user_metadata?.phone || "",
      });
    }
  }, [user]);

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

  const handleProfileSave = async () => {
    setSaving(true);
    setProfileMsg(null);

    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: profileForm.name,
        country: profileForm.country,
        city: profileForm.city,
        phone: profileForm.phone,
      },
    });

    if (error) {
      setProfileMsg({ type: "error", text: error.message });
    } else {
      setProfileMsg({ type: "success", text: isHe ? "הפרטים עודכנו בהצלחה" : "Profile updated successfully" });
      setEditing(false);
      setTimeout(() => setProfileMsg(null), 3000);
    }
    setSaving(false);
  };

  const handlePasswordChange = async () => {
    setPasswordSaving(true);
    setPasswordMsg(null);

    if (passwordForm.newPassword.length < 6) {
      setPasswordMsg({ type: "error", text: isHe ? "הסיסמה חייבת להכיל לפחות 6 תווים" : "Password must be at least 6 characters" });
      setPasswordSaving(false);
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg({ type: "error", text: isHe ? "הסיסמאות לא תואמות" : "Passwords don't match" });
      setPasswordSaving(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: passwordForm.newPassword,
    });

    if (error) {
      setPasswordMsg({ type: "error", text: error.message });
    } else {
      setPasswordMsg({ type: "success", text: isHe ? "הסיסמה שונתה בהצלחה" : "Password changed successfully" });
      setPasswordForm({ newPassword: "", confirmPassword: "" });
      setChangingPassword(false);
      setTimeout(() => setPasswordMsg(null), 3000);
    }
    setPasswordSaving(false);
  };

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center text-t-dim text-sm">{isHe ? "טוען..." : "Loading..."}</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Profile Header */}
      <div className="bg-s-base border border-b-subtle rounded-xl p-5 sm:p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#d4920a]/20 flex items-center justify-center flex-shrink-0">
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
            </div>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 text-xs text-t-faint hover:text-[#e5a312] transition-colors cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" strokeWidth={1.5} />
              {isHe ? "עריכה" : "Edit"}
            </button>
          )}
        </div>

        {/* Profile messages */}
        {profileMsg && (
          <div className={`text-xs px-3 py-2 rounded-lg mb-4 ${profileMsg.type === "success" ? "bg-green-400/10 text-green-400" : "bg-red-400/10 text-red-400"}`}>
            {profileMsg.text}
          </div>
        )}
        {passwordMsg && (
          <div className={`text-xs px-3 py-2 rounded-lg mb-4 ${passwordMsg.type === "success" ? "bg-green-400/10 text-green-400" : "bg-red-400/10 text-red-400"}`}>
            {passwordMsg.text}
          </div>
        )}

        {editing ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-t-faint mb-1">{isHe ? "שם מלא" : "Full Name"}</label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-t-ghost" strokeWidth={1.5} />
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full bg-s-input border border-b-medium rounded-lg pr-9 pl-4 py-2.5 text-sm text-t-primary focus:outline-none focus:border-[#d4920a]/30 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-t-faint mb-1">{isHe ? "טלפון" : "Phone"}</label>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-t-ghost" strokeWidth={1.5} />
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full bg-s-input border border-b-medium rounded-lg pr-9 pl-4 py-2.5 text-sm text-t-primary focus:outline-none focus:border-[#d4920a]/30 transition-colors"
                    dir="ltr"
                    placeholder="054-000-0000"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-t-faint mb-1">{isHe ? "מדינה" : "Country"}</label>
                <div className="relative">
                  <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-t-ghost" strokeWidth={1.5} />
                  <input
                    type="text"
                    value={profileForm.country}
                    onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
                    className="w-full bg-s-input border border-b-medium rounded-lg pr-9 pl-4 py-2.5 text-sm text-t-primary focus:outline-none focus:border-[#d4920a]/30 transition-colors"
                    placeholder={isHe ? "ישראל" : "Israel"}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-t-faint mb-1">{isHe ? "עיר" : "City"}</label>
                <div className="relative">
                  <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-t-ghost" strokeWidth={1.5} />
                  <input
                    type="text"
                    value={profileForm.city}
                    onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                    className="w-full bg-s-input border border-b-medium rounded-lg pr-9 pl-4 py-2.5 text-sm text-t-primary focus:outline-none focus:border-[#d4920a]/30 transition-colors"
                    placeholder={isHe ? "תל אביב" : "Tel Aviv"}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleProfileSave}
                disabled={saving}
                className="flex items-center gap-1.5 bg-[#d4920a] hover:bg-[#e5a312] disabled:opacity-50 text-white px-4 py-2 rounded-lg text-xs font-medium transition-all duration-300 cursor-pointer"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" strokeWidth={1.5} />}
                {isHe ? "שמור" : "Save"}
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setProfileForm({
                    name: user.user_metadata?.full_name || "",
                    country: user.user_metadata?.country || "",
                    city: user.user_metadata?.city || "",
                    phone: user.user_metadata?.phone || "",
                  });
                }}
                className="flex items-center gap-1.5 border border-b-medium text-t-dim hover:text-t-secondary px-4 py-2 rounded-lg text-xs transition-all duration-300 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                {isHe ? "ביטול" : "Cancel"}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: User, label: isHe ? "שם" : "Name", value: user.user_metadata?.full_name || "-" },
              { icon: Phone, label: isHe ? "טלפון" : "Phone", value: user.user_metadata?.phone || "-" },
              { icon: MapPin, label: isHe ? "מדינה" : "Country", value: user.user_metadata?.country || "-" },
              { icon: MapPin, label: isHe ? "עיר" : "City", value: user.user_metadata?.city || "-" },
            ].map((item) => (
              <div key={item.label} className="bg-s-hover/50 rounded-lg px-3 py-2.5">
                <div className="text-[10px] text-t-faint uppercase tracking-wider flex items-center gap-1">
                  <item.icon className="w-3 h-3" strokeWidth={1.5} />
                  {item.label}
                </div>
                <div className="text-sm text-t-secondary mt-0.5 truncate">{item.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Password change */}
        {!isGoogleUser && (
          <div className="mt-4 pt-4 border-t border-b-subtle">
            {changingPassword ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-t-faint mb-1">{isHe ? "סיסמה חדשה" : "New Password"}</label>
                    <div className="relative">
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-t-ghost" strokeWidth={1.5} />
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="w-full bg-s-input border border-b-medium rounded-lg pr-9 pl-4 py-2.5 text-sm text-t-primary focus:outline-none focus:border-[#d4920a]/30 transition-colors"
                        dir="ltr"
                        placeholder="••••••"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-t-faint mb-1">{isHe ? "אימות סיסמה" : "Confirm Password"}</label>
                    <div className="relative">
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-t-ghost" strokeWidth={1.5} />
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className="w-full bg-s-input border border-b-medium rounded-lg pr-9 pl-4 py-2.5 text-sm text-t-primary focus:outline-none focus:border-[#d4920a]/30 transition-colors"
                        dir="ltr"
                        placeholder="••••••"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handlePasswordChange}
                    disabled={passwordSaving}
                    className="flex items-center gap-1.5 bg-[#d4920a] hover:bg-[#e5a312] disabled:opacity-50 text-white px-4 py-2 rounded-lg text-xs font-medium transition-all duration-300 cursor-pointer"
                  >
                    {passwordSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" strokeWidth={1.5} />}
                    {isHe ? "שנה סיסמה" : "Change Password"}
                  </button>
                  <button
                    onClick={() => { setChangingPassword(false); setPasswordForm({ newPassword: "", confirmPassword: "" }); }}
                    className="flex items-center gap-1.5 border border-b-medium text-t-dim hover:text-t-secondary px-4 py-2 rounded-lg text-xs transition-all duration-300 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                    {isHe ? "ביטול" : "Cancel"}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setChangingPassword(true)}
                className="flex items-center gap-1.5 text-xs text-t-faint hover:text-[#e5a312] transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" strokeWidth={1.5} />
                {isHe ? "שינוי סיסמה" : "Change Password"}
              </button>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-sm text-t-dim">{isHe ? "טוען..." : "Loading..."}</div>
      ) : (
        <>
          {/* Benefits Section */}
          {benefits.length > 0 && (
            <section className="mb-6">
              <h2 className="text-sm font-semibold text-t-secondary mb-4 flex items-center gap-2">
                <Gift className="w-4 h-4 text-[#e5a312]" strokeWidth={1.5} />
                {isHe ? "הטבות זמינות" : "Available Benefits"}
              </h2>
              <div className="space-y-3">
                {benefits.map((b) => (
                  <div key={b.id} className="bg-s-base border border-[#d4920a]/20 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {b.benefit_type === "free_script" ? (
                        <div className="w-9 h-9 rounded-lg bg-[#d4920a]/10 flex items-center justify-center flex-shrink-0">
                          <Download className="w-4 h-4 text-[#e5a312]" strokeWidth={1.5} />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-[#d4920a]/10 flex items-center justify-center flex-shrink-0">
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
                        className="flex items-center gap-1.5 bg-[#d4920a] hover:bg-[#e5a312] text-white px-4 py-2 rounded-lg text-xs font-medium transition-all duration-300 self-start sm:self-center"
                      >
                        <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
                        {isHe ? "הורדה" : "Download"}
                      </Link>
                    )}
                    {b.benefit_type === "coupon" && (
                      <div className="bg-[#d4920a]/10 text-[#e5a312] px-3 py-1.5 rounded-lg text-xs font-mono font-medium self-start sm:self-center" dir="ltr">
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
                    <div className="px-4 sm:px-5 py-4 flex items-center justify-between border-b border-b-subtle">
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
                    <div className="px-4 sm:px-5 py-3">
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
                      <div className="px-4 sm:px-5 py-3 border-t border-b-subtle bg-s-hover/30">
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
