"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Check, User } from "lucide-react";
import { useCart } from "@/lib/cartContext";
import { useAuth } from "@/lib/authContext";
import { formatPrice } from "@/data/scripts";
import { useLanguage } from "@/lib/languageContext";

export default function CheckoutPage() {
  const { items, totalPrice, discountAmount, finalPrice, coupon, clearCart } = useCart();
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const { t, lang } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [acceptUpdates, setAcceptUpdates] = useState(false);
  const BackArrow = lang === "he" ? ArrowRight : ArrowLeft;

  // Auto-fill form when user is logged in
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        name: prev.name || user.user_metadata?.full_name || "",
        email: prev.email || user.email || "",
        phone: prev.phone || user.user_metadata?.phone || "",
      }));
    }
  }, [user]);

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

  // Show login requirement if not authenticated
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearCart();
    setSubmitted(true);
  };

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

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-[11px] font-medium text-t-dim uppercase tracking-wider mb-3">{t("checkout.personalInfo")}</h2>
              {[
                { label: t("checkout.fullName"), key: "name" as const, type: "text", placeholder: t("checkout.fullName"), dir: lang === "he" ? "rtl" : "ltr" },
                { label: t("checkout.email"), key: "email" as const, type: "email", placeholder: "email@example.com", dir: "ltr" },
                { label: t("checkout.phone"), key: "phone" as const, type: "tel", placeholder: "054-000-0000", dir: "ltr" },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-xs text-t-faint mb-1.5">{field.label}</label>
                  <input
                    type={field.type}
                    required
                    dir={field.dir}
                    value={form[field.key]}
                    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                    className="w-full bg-s-input border border-b-medium rounded-xl px-4 py-3 text-sm text-t-primary placeholder-t-ghost focus:outline-none focus:border-[#d4920a]/30 transition-colors duration-300"
                    placeholder={field.placeholder}
                  />
                </div>
              ))}
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

            <div>
              <h2 className="text-[11px] font-medium text-t-dim uppercase tracking-wider mb-3">{t("checkout.payment")}</h2>
              <div className="bg-[#d4920a]/[0.04] border border-[#d4920a]/10 rounded-xl p-4 text-center">
                <p className="text-[13px] text-[#e5a312]/60 whitespace-pre-line">
                  {t("checkout.paymentNote")}
                </p>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#d4920a] hover:bg-[#e5a312] text-white py-3.5 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer"
            >
              {t("checkout.submit")} — {"\u20AA"}{finalPrice}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2">
          <div className="sticky top-24 bg-s-base border border-b-subtle rounded-2xl p-6">
            <h2 className="text-[11px] font-medium text-t-dim uppercase tracking-wider mb-4">{t("checkout.summary")}</h2>
            <div className="space-y-3 mb-6">
              {items.map((item) => (
                <div key={item.script.id} className="flex items-center justify-between text-sm">
                  <span className="text-t-muted">{item.script.displayName}</span>
                  <span className="text-t-secondary font-medium">{formatPrice(item.script.price)}</span>
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
            <div className={`${discountAmount > 0 ? "mt-3" : ""} border-t border-b-subtle pt-4 flex items-center justify-between`}>
              <span className="text-t-primary font-semibold">{t("cart.total")}</span>
              <span className="text-t-primary font-semibold">{"\u20AA"}{finalPrice}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
