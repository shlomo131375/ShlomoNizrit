"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Check, User, Mail, MessageCircle, Loader2, Gift, Tag } from "lucide-react";
import { useCart } from "@/lib/cartContext";
import { useAuth } from "@/lib/authContext";
import { useScripts } from "@/lib/scriptsContext";
import { useLanguage } from "@/lib/languageContext";
import { supabase } from "@/lib/supabase";
import { isValidEmail, isValidPhone } from "@/lib/sanitize";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";

interface UserBenefit {
  id: string;
  benefit_type: "coupon" | "free_script";
  coupon_code: string | null;
  script_id: string | null;
  used: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, discountAmount, finalPrice, coupon, clearCart, applyCoupon } = useCart();
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const { formatPrice } = useScripts();
  const { t, lang } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", country: "", city: "" });
  const [acceptUpdates, setAcceptUpdates] = useState(false);
  const [receiptOtherName, setReceiptOtherName] = useState(false);
  const [receiptName, setReceiptName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"paypal" | "contact">(PAYPAL_CLIENT_ID ? "paypal" : "contact");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [benefits, setBenefits] = useState<UserBenefit[]>([]);
  const [freeScriptIds, setFreeScriptIds] = useState<Set<string>>(new Set());
  const BackArrow = lang === "he" ? ArrowRight : ArrowLeft;

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        name: prev.name || user.user_metadata?.full_name || "",
        email: prev.email || user.email || "",
        phone: prev.phone || user.user_metadata?.phone || "",
        country: prev.country || user.user_metadata?.country || "",
        city: prev.city || user.user_metadata?.city || "",
      }));

      // Fetch user benefits
      supabase
        .from("user_benefits")
        .select("*")
        .eq("user_email", user.email?.toLowerCase())
        .eq("used", false)
        .then(({ data }) => {
          if (data) {
            setBenefits(data);
            // Auto-detect free scripts in cart
            const freeIds = new Set<string>();
            data.forEach((b) => {
              if (b.benefit_type === "free_script" && b.script_id && items.some((i) => i.script.id === b.script_id)) {
                freeIds.add(b.script_id);
              }
            });
            setFreeScriptIds(freeIds);
          }
        });
    }
  }, [user, items]);

  // Calculate adjusted prices with free scripts
  const freeScriptsDiscount = items.reduce((sum, i) => {
    if (freeScriptIds.has(i.script.id) && i.script.price !== "free") {
      return sum + (i.script.price as number);
    }
    return sum;
  }, 0);

  const adjustedFinalPrice = Math.max(0, finalPrice - freeScriptsDiscount);
  const availableCoupons = benefits.filter((b) => b.benefit_type === "coupon" && b.coupon_code);

  if (items.length === 0 && !submitted) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">
        <h1 className="text-xl font-medium text-t-primary mb-4">{t("checkout.emptyCart")}</h1>
        <Link href="/catalog" className="text-sm text-[#e5a312] hover:text-[#fdc43f] transition-colors">
          {t("product.backToScripts")}
        </Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-6 py-24 text-center">
        <div className="bg-s-base border border-b-subtle rounded-2xl p-10">
          <div className="w-12 h-12 border border-[#d4920a]/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-5 h-5 text-[#e5a312]" strokeWidth={1.5} />
          </div>
          <h1 className="text-xl font-semibold text-t-primary mb-3 tracking-tight">{t("checkout.orderReceived")}</h1>
          <p className="text-sm text-t-dim mb-1">
            {t("checkout.confirmSent")}<span className="text-t-muted">{form.email}</span>
          </p>
          <p className="text-sm text-t-dim mb-8">{t("checkout.willContact")}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 border border-b-medium text-t-muted hover:text-t-primary px-6 py-3 rounded-full text-sm transition-colors duration-300"
          >
            {t("checkout.backToSite")}
          </Link>
        </div>
      </div>
    );
  }

  if (!authLoading && !user) {
    return (
      <div className="max-w-md mx-auto px-6 py-24">
        <Link
          href="/cart"
          className="inline-flex items-center gap-1.5 text-[13px] text-t-faint hover:text-t-muted transition-colors duration-300 mb-8"
        >
          <BackArrow className="w-3.5 h-3.5" strokeWidth={1.5} />
          {t("checkout.backToCart")}
        </Link>

        <div className="bg-s-base border border-b-subtle rounded-2xl p-8 text-center">
          <div className="w-12 h-12 border border-b-medium rounded-full flex items-center justify-center mx-auto mb-5">
            <User className="w-5 h-5 text-t-dim" strokeWidth={1.5} />
          </div>
          <h1 className="text-xl font-semibold text-t-primary mb-3 tracking-tight">
            {lang === "he" ? "יש להתחבר כדי לבצע רכישה" : "Sign in to complete your purchase"}
          </h1>
          <p className="text-sm text-t-dim mb-8">
            {lang === "he"
              ? "התחבר לחשבון שלך או צור חשבון חדש כדי להמשיך לתשלום"
              : "Sign in to your account or create a new one to proceed to checkout"}
          </p>

          <div className="space-y-3">
            <button
              onClick={signInWithGoogle}
              className="w-full flex items-center justify-center gap-3 bg-s-hover border border-b-medium hover:border-t-dim rounded-xl px-4 py-3 text-sm text-t-secondary font-medium transition-all duration-300 cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {lang === "he" ? "המשך עם Google" : "Continue with Google"}
            </button>

            <Link
              href="/login"
              className="w-full flex items-center justify-center gap-2 bg-[#d4920a] hover:bg-[#e5a312] text-white py-3 rounded-xl text-sm font-medium transition-all duration-300"
            >
              {lang === "he" ? "התחברות / הרשמה" : "Sign In / Register"}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const createOrder = async (paypalOrderId?: string, method: "paypal" | "contact" = "contact") => {
    setProcessing(true);
    try {
      const orderItems = items.map((i) => ({
        script_id: i.script.id,
        script_name: i.script.displayName,
        price: freeScriptIds.has(i.script.id) ? 0 : (i.script.price === "free" ? 0 : i.script.price),
      }));

      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paypal_order_id: paypalOrderId || null,
          payment_method: method,
          user_email: form.email,
          user_name: form.name,
          user_phone: form.phone,
          user_country: form.country,
          user_city: form.city,
          receipt_name: receiptOtherName ? receiptName : null,
          accept_updates: acceptUpdates,
          user_id: user?.id || "anonymous",
          items: orderItems,
          total_amount: adjustedFinalPrice,
          discount_amount: discountAmount + freeScriptsDiscount,
          coupon_code: coupon?.code || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Error creating order");
        setProcessing(false);
        return;
      }

      // Mark used benefits
      const usedBenefitIds = benefits
        .filter((b) =>
          (b.benefit_type === "free_script" && b.script_id && freeScriptIds.has(b.script_id)) ||
          (b.benefit_type === "coupon" && b.coupon_code && coupon?.code === b.coupon_code)
        )
        .map((b) => b.id);

      if (usedBenefitIds.length > 0) {
        await supabase.from("user_benefits").update({ used: true }).in("id", usedBenefitIds);
      }

      clearCart();

      // If payment completed (PayPal), redirect to download page
      if (data.download_token) {
        router.push(`/download/${data.download_token}`);
      } else {
        // Contact method - show thank you
        setSubmitted(true);
      }
    } catch {
      alert(lang === "he" ? "שגיאה ביצירת ההזמנה" : "Error creating order");
      setProcessing(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!isValidEmail(form.email)) {
      errors.email = lang === "he" ? "כתובת אימייל לא תקינה" : "Invalid email address";
    }
    if (!isValidPhone(form.phone)) {
      errors.phone = lang === "he" ? "מספר טלפון לא תקין" : "Invalid phone number";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    createOrder(undefined, "contact");
  };

  const orderDescription = items.map((i) => i.script.displayName).join(", ");

  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-8 py-16">
      <Link
        href="/cart"
        className="inline-flex items-center gap-1.5 text-[13px] text-t-faint hover:text-t-muted transition-colors duration-300 mb-8"
      >
        <BackArrow className="w-3.5 h-3.5" strokeWidth={1.5} />
        {t("checkout.backToCart")}
      </Link>

      <h1 className="text-2xl font-bold text-t-primary mb-10 tracking-tight">{t("checkout.title")}</h1>

      {/* Benefits Banner */}
      {(freeScriptIds.size > 0 || availableCoupons.length > 0) && (
        <div className="bg-[#d4920a]/[0.06] border border-[#d4920a]/20 rounded-xl p-4 mb-8 space-y-2">
          {freeScriptIds.size > 0 && (
            <div className="flex items-center gap-2 text-sm text-[#e5a312]">
              <Gift className="w-4 h-4" strokeWidth={1.5} />
              <span>
                {lang === "he"
                  ? `יש לך ${freeScriptIds.size} סקריפט${freeScriptIds.size > 1 ? "ים" : ""} חינם בעגלה!`
                  : `You have ${freeScriptIds.size} free script${freeScriptIds.size > 1 ? "s" : ""} in your cart!`}
              </span>
            </div>
          )}
          {availableCoupons.map((c) => (
            <div key={c.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-[#e5a312]">
                <Tag className="w-4 h-4" strokeWidth={1.5} />
                <span>
                  {lang === "he" ? "יש לך קופון זמין:" : "You have a coupon:"}{" "}
                  <span className="font-mono font-medium">{c.coupon_code}</span>
                </span>
              </div>
              {!coupon && (
                <button
                  onClick={() => c.coupon_code && applyCoupon(c.coupon_code)}
                  className="text-xs bg-[#d4920a] hover:bg-[#e5a312] text-white px-3 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  {lang === "he" ? "הפעל" : "Apply"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <form onSubmit={handleContactSubmit} className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-[11px] font-medium text-t-dim uppercase tracking-wider mb-3">{t("checkout.personalInfo")}</h2>
              {[
                { label: t("checkout.fullName"), key: "name" as const, type: "text", placeholder: t("checkout.fullName"), dir: lang === "he" ? "rtl" : "ltr", required: true },
                { label: t("checkout.email"), key: "email" as const, type: "email", placeholder: "email@example.com", dir: "ltr", required: true },
                { label: t("checkout.phone"), key: "phone" as const, type: "tel", placeholder: "054-000-0000", dir: "ltr", required: true },
                { label: lang === "he" ? "מדינה" : "Country", key: "country" as const, type: "text", placeholder: lang === "he" ? "ישראל" : "Israel", dir: lang === "he" ? "rtl" : "ltr", required: false },
                { label: lang === "he" ? "עיר" : "City", key: "city" as const, type: "text", placeholder: lang === "he" ? "תל אביב" : "Tel Aviv", dir: lang === "he" ? "rtl" : "ltr", required: false },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-xs text-t-faint mb-1.5">{field.label}</label>
                  <input
                    type={field.type}
                    required={field.required}
                    dir={field.dir}
                    value={form[field.key]}
                    onChange={(e) => {
                      setForm({ ...form, [field.key]: e.target.value });
                      if (formErrors[field.key]) setFormErrors((prev) => { const next = { ...prev }; delete next[field.key]; return next; });
                    }}
                    className={`w-full bg-s-input border rounded-xl px-4 py-3 text-sm text-t-primary placeholder-t-ghost focus:outline-none transition-colors duration-300 ${
                      formErrors[field.key] ? "border-red-400/50 focus:border-red-400/70" : "border-b-medium focus:border-[#d4920a]/30"
                    }`}
                    placeholder={field.placeholder}
                  />
                  {formErrors[field.key] && (
                    <p className="text-[11px] text-red-400 mt-1">{formErrors[field.key]}</p>
                  )}
                </div>
              ))}

              {/* Receipt other name checkbox */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative mt-0.5">
                  <input
                    type="checkbox"
                    checked={receiptOtherName}
                    onChange={(e) => { setReceiptOtherName(e.target.checked); if (!e.target.checked) setReceiptName(""); }}
                    className="peer sr-only"
                  />
                  <div className="w-[18px] h-[18px] rounded border border-b-medium bg-s-input peer-checked:bg-[#d4920a] peer-checked:border-[#d4920a] transition-all duration-200 flex items-center justify-center">
                    {receiptOtherName && (
                      <Check className="w-3 h-3 text-white" strokeWidth={2.5} />
                    )}
                  </div>
                </div>
                <span className="text-xs text-t-dim group-hover:text-t-muted transition-colors leading-relaxed">
                  {lang === "he" ? "שם הקבלה ע\"ש אחר" : "Receipt under a different name"}
                </span>
              </label>

              {receiptOtherName && (
                <div>
                  <label className="block text-xs text-t-faint mb-1.5">
                    {lang === "he" ? "שם לקבלה" : "Receipt Name"}
                  </label>
                  <input
                    type="text"
                    required
                    dir={lang === "he" ? "rtl" : "ltr"}
                    value={receiptName}
                    onChange={(e) => setReceiptName(e.target.value)}
                    className="w-full bg-s-input border border-b-medium rounded-xl px-4 py-3 text-sm text-t-primary placeholder-t-ghost focus:outline-none focus:border-[#d4920a]/30 transition-colors duration-300"
                    placeholder={lang === "he" ? "שם מלא לקבלה" : "Full name for receipt"}
                  />
                </div>
              )}
            </div>

            {/* Email updates opt-in */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative mt-0.5">
                <input
                  type="checkbox"
                  checked={acceptUpdates}
                  onChange={(e) => setAcceptUpdates(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="w-[18px] h-[18px] rounded border border-b-medium bg-s-input peer-checked:bg-[#d4920a] peer-checked:border-[#d4920a] transition-all duration-200 flex items-center justify-center">
                  {acceptUpdates && (
                    <Check className="w-3 h-3 text-white" strokeWidth={2.5} />
                  )}
                </div>
              </div>
              <span className="text-xs text-t-dim group-hover:text-t-muted transition-colors leading-relaxed">
                {lang === "he"
                  ? "אני מעוניין/ת לקבל עדכונים על סקריפטים חדשים, מבצעים והנחות למייל"
                  : "I'd like to receive updates about new scripts, deals and discounts via email"}
              </span>
            </label>

            {/* Payment Method */}
            <div>
              <h2 className="text-[11px] font-medium text-t-dim uppercase tracking-wider mb-3">{t("checkout.payment")}</h2>
              <div className="space-y-2">
                {/* PayPal Option */}
                {PAYPAL_CLIENT_ID && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("paypal")}
                    className={`w-full flex items-center gap-3 rounded-xl px-4 py-3.5 border transition-all duration-300 cursor-pointer ${
                      paymentMethod === "paypal"
                        ? "border-[#d4920a]/30 bg-[#d4920a]/[0.06]"
                        : "border-b-medium bg-s-input hover:border-t-ghost"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      paymentMethod === "paypal" ? "border-[#d4920a]" : "border-t-ghost"
                    }`}>
                      {paymentMethod === "paypal" && <div className="w-2.5 h-2.5 rounded-full bg-[#d4920a]" />}
                    </div>
                    <svg className="h-5" viewBox="0 0 101 32" fill="none">
                      <path d="M12.237 4.1H6.198a.87.87 0 00-.86.735L3.035 19.46a.522.522 0 00.516.604h2.886a.87.87 0 00.86-.735l.625-3.963a.87.87 0 01.859-.735h1.981c4.13 0 6.511-1.999 7.132-5.963.28-1.735.011-3.098-.796-4.05-.887-1.047-2.457-1.518-4.861-1.518z" fill="#253B80"/>
                      <path d="M13.116 10.257c-.343 2.252-2.06 2.252-3.722 2.252h-.946l.663-4.199a.522.522 0 01.516-.44h.434c1.132 0 2.2 0 2.75.644.329.385.429.955.305 1.743z" fill="#253B80"/>
                      <path d="M27.902 10.183h-2.896a.522.522 0 00-.516.44l-.128.81-.203-.294c-.629-.913-2.03-1.218-3.428-1.218-3.207 0-5.948 2.43-6.482 5.838-.277 1.7.117 3.325 1.08 4.46.885 1.042 2.148 1.476 3.653 1.476 2.583 0 4.015-1.66 4.015-1.66l-.13.805a.522.522 0 00.516.604h2.607a.87.87 0 00.86-.735l1.567-9.921a.522.522 0 00-.515-.605zm-4.045 5.65c-.28 1.658-1.596 2.77-3.274 2.77-.842 0-1.515-.27-1.947-.783-.43-.51-.59-1.236-.455-2.042.261-1.643 1.618-2.79 3.27-2.79.824 0 1.494.274 1.934.79.443.522.616 1.253.472 2.055z" fill="#253B80"/>
                      <path d="M46.058 10.183h-2.91a.87.87 0 00-.72.381l-4.155 6.12-1.76-5.882a.87.87 0 00-.834-.619h-2.86a.522.522 0 00-.495.695l3.32 9.743-3.123 4.406a.522.522 0 00.427.824h2.906a.87.87 0 00.717-.375l10.02-14.47a.522.522 0 00-.433-.823z" fill="#253B80"/>
                      <path d="M55.607 4.1h-6.04a.87.87 0 00-.859.735l-2.303 14.625a.522.522 0 00.516.604h3.065a.609.609 0 00.601-.515l.654-4.143a.87.87 0 01.859-.735h1.981c4.13 0 6.511-1.999 7.131-5.963.28-1.735.012-3.098-.795-4.05-.887-1.047-2.458-1.518-4.862-1.518z" fill="#179BD7"/>
                      <path d="M56.485 10.257c-.342 2.252-2.06 2.252-3.721 2.252h-.946l.663-4.199a.522.522 0 01.516-.44h.434c1.131 0 2.2 0 2.75.644.328.385.428.955.304 1.743z" fill="#179BD7"/>
                      <path d="M71.271 10.183h-2.896a.522.522 0 00-.515.44l-.128.81-.203-.294c-.63-.913-2.031-1.218-3.43-1.218-3.206 0-5.947 2.43-6.481 5.838-.277 1.7.117 3.325 1.08 4.46.884 1.042 2.148 1.476 3.652 1.476 2.583 0 4.016-1.66 4.016-1.66l-.13.805a.522.522 0 00.515.604h2.607a.87.87 0 00.86-.735l1.567-9.921a.522.522 0 00-.514-.605zm-4.046 5.65c-.28 1.658-1.596 2.77-3.273 2.77-.842 0-1.516-.27-1.948-.783-.429-.51-.59-1.236-.454-2.042.26-1.643 1.617-2.79 3.27-2.79.823 0 1.493.274 1.934.79.443.522.615 1.253.471 2.055z" fill="#179BD7"/>
                      <path d="M74.262 4.476l-2.338 14.864a.522.522 0 00.516.604h2.494a.87.87 0 00.86-.735L78.098 4.58a.522.522 0 00-.516-.604h-2.804a.522.522 0 00-.516.5z" fill="#179BD7"/>
                    </svg>
                    <span className="text-sm text-t-secondary">PayPal</span>
                  </button>
                )}

                {/* Contact Option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("contact")}
                  className={`w-full flex items-center gap-3 rounded-xl px-4 py-3.5 border transition-all duration-300 cursor-pointer ${
                    paymentMethod === "contact"
                      ? "border-[#d4920a]/30 bg-[#d4920a]/[0.06]"
                      : "border-b-medium bg-s-input hover:border-t-ghost"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    paymentMethod === "contact" ? "border-[#d4920a]" : "border-t-ghost"
                  }`}>
                    {paymentMethod === "contact" && <div className="w-2.5 h-2.5 rounded-full bg-[#d4920a]" />}
                  </div>
                  <MessageCircle className="w-4.5 h-4.5 text-t-muted" strokeWidth={1.5} />
                  <span className="text-sm text-t-secondary">
                    {lang === "he" ? "תשלום דרך יצירת קשר" : "Pay via Contact"}
                  </span>
                </button>
              </div>
            </div>

            {/* PayPal Buttons */}
            {paymentMethod === "paypal" && PAYPAL_CLIENT_ID && (
              <div className="bg-s-base border border-b-subtle rounded-xl p-5">
                <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: "ILS" }}>
                  <PayPalButtons
                    style={{ layout: "vertical", color: "gold", shape: "rect", label: "pay", height: 45 }}
                    createOrder={(_data, actions) => {
                      if (!validateForm()) return Promise.reject("Validation failed");
                      return actions.order.create({
                        intent: "CAPTURE",
                        purchase_units: [{
                          amount: { value: String(adjustedFinalPrice), currency_code: "ILS" },
                          description: orderDescription,
                        }],
                      });
                    }}
                    onApprove={async (data, actions) => {
                      const details = await actions.order?.capture();
                      if (details?.status === "COMPLETED") {
                        await createOrder(data.orderID, "paypal");
                      }
                    }}
                  />
                </PayPalScriptProvider>
              </div>
            )}

            {/* Contact Payment */}
            {paymentMethod === "contact" && (
              <div className="bg-s-base border border-b-subtle rounded-xl p-5 space-y-4">
                <p className="text-sm text-t-dim text-center">
                  {lang === "he"
                    ? "צור קשר ישירות לתיאום תשלום:"
                    : "Contact us directly to arrange payment:"}
                </p>

                <div className="flex gap-3">
                  <a
                    href={`https://wa.me/9720504669926?text=${encodeURIComponent(
                      `שלום, אני מעוניין לרכוש:\n${items.map((i) => `- ${i.script.displayName}`).join("\n")}\nסה"כ: ₪${finalPrice}\n\nשם: ${form.name}\nאימייל: ${form.email}\nטלפון: ${form.phone}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-[#25D366]/10 border border-[#25D366]/20 hover:bg-[#25D366]/20 text-[#25D366] py-3 rounded-xl text-sm font-medium transition-all duration-300"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    WhatsApp
                  </a>
                  <a
                    href={`https://mail.google.com/mail/?view=cm&to=shlomo1313753@gmail.com&su=${encodeURIComponent(
                      `הזמנה - ${items.map((i) => i.script.displayName).join(", ")}`
                    )}&body=${encodeURIComponent(
                      `שלום,\n\nאני מעוניין לרכוש:\n${items.map((i) => `- ${i.script.displayName} (${formatPrice(i.script.price)})`).join("\n")}\n\nסה"כ: ₪${finalPrice}\n\nשם: ${form.name}\nאימייל: ${form.email}\nטלפון: ${form.phone}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-s-hover border border-b-medium hover:border-t-ghost text-t-secondary py-3 rounded-xl text-sm font-medium transition-all duration-300"
                  >
                    <Mail className="w-4 h-4" strokeWidth={1.5} />
                    {lang === "he" ? "אימייל" : "Email"}
                  </a>
                </div>
              </div>
            )}
          </form>
        </div>

        <div className="lg:col-span-2">
          <div className="sticky top-24 bg-s-base border border-b-subtle rounded-2xl p-6">
            <h2 className="text-[11px] font-medium text-t-dim uppercase tracking-wider mb-4">{t("checkout.summary")}</h2>
            <div className="space-y-3 mb-6">
              {items.map((item) => (
                <div key={item.script.id} className="flex items-center justify-between text-sm">
                  <span className="text-t-muted flex items-center gap-1.5">
                    {freeScriptIds.has(item.script.id) && <Gift className="w-3 h-3 text-[#e5a312]" strokeWidth={1.5} />}
                    {item.script.displayName}
                  </span>
                  {freeScriptIds.has(item.script.id) ? (
                    <span className="text-[#e5a312] font-medium text-xs">{lang === "he" ? "חינם" : "FREE"}</span>
                  ) : (
                    <span className="text-t-secondary font-medium">{formatPrice(item.script.price)}</span>
                  )}
                </div>
              ))}
            </div>
            {discountAmount > 0 && (
              <>
                <div className="border-t border-b-subtle pt-4 flex items-center justify-between text-sm text-t-dim">
                  <span>{lang === "he" ? "סכום ביניים" : "Subtotal"}</span>
                  <span>{"\u20AA"}{totalPrice}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-[#e5a312] mt-2">
                  <span>{lang === "he" ? "הנחה" : "Discount"} ({coupon?.code})</span>
                  <span>-{"\u20AA"}{discountAmount}</span>
                </div>
              </>
            )}
            {freeScriptsDiscount > 0 && (
              <div className="flex items-center justify-between text-sm text-[#e5a312] mt-2">
                <span className="flex items-center gap-1"><Gift className="w-3 h-3" strokeWidth={1.5} />{lang === "he" ? "הטבת סקריפטים חינם" : "Free scripts benefit"}</span>
                <span>-{"\u20AA"}{freeScriptsDiscount}</span>
              </div>
            )}
            <div className={`${discountAmount > 0 || freeScriptsDiscount > 0 ? "mt-3" : ""} border-t border-b-subtle pt-4 flex items-center justify-between`}>
              <span className="text-t-primary font-semibold">{t("cart.total")}</span>
              <span className="text-t-primary font-semibold">{"\u20AA"}{adjustedFinalPrice}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
