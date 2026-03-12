"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2, ArrowRight, ArrowLeft, Tag, X } from "lucide-react";
import { useCart } from "@/lib/cartContext";
import { formatPrice } from "@/data/scripts";
import { useLanguage } from "@/lib/languageContext";

export default function CartPage() {
  const { items, removeFromCart, clearCart, totalPrice, discountAmount, finalPrice, coupon, couponLoading, couponError, applyCoupon, removeCoupon } = useCart();
  const { t, lang } = useLanguage();
  const [couponCode, setCouponCode] = useState("");
  const Arrow = lang === "he" ? ArrowLeft : ArrowRight;
  const BackArrow = lang === "he" ? ArrowRight : ArrowLeft;

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">
        <h1 className="text-xl font-medium text-t-primary mb-3">{t("cart.empty")}</h1>
        <p className="text-sm text-t-dim mb-6">{t("cart.emptyDesc")}</p>
        <Link
          href="/catalog"
          className="inline-flex items-center gap-2 bg-[#d4920a] hover:bg-[#e5a312] text-white px-6 py-3 rounded-full text-sm font-medium transition-all duration-300"
        >
          {t("nav.scripts")}
          <Arrow className="w-4 h-4" strokeWidth={1.5} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 lg:px-8 py-16">
      <h1 className="text-2xl font-bold text-t-primary mb-10 tracking-tight">{t("cart.title")}</h1>

      <div className="space-y-3 mb-8">
        {items.map((item) => (
          <div
            key={item.script.id}
            className="bg-s-base border border-b-subtle rounded-xl p-5 flex items-center justify-between"
          >
            <div>
              <Link
                href={`/product/${item.script.id}`}
                className="text-[15px] text-t-secondary font-medium hover:text-[#e5a312] transition-colors duration-300"
              >
                {item.script.displayName}
              </Link>
              <div className="text-[11px] text-t-faint uppercase tracking-wider mt-0.5">
                {t(`cat.${item.script.category}`)}
              </div>
            </div>

            <div className="flex items-center gap-6">
              <span className="text-[15px] font-semibold text-t-secondary">
                {formatPrice(item.script.price)}
              </span>
              <button
                onClick={() => removeFromCart(item.script.id)}
                className="text-t-ghost hover:text-red-400 transition-colors duration-300 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Coupon */}
      <div className="bg-s-base border border-b-subtle rounded-xl p-5 mb-4">
        {coupon ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#e5a312]" strokeWidth={1.5} />
              <span className="text-sm text-t-secondary font-medium">{coupon.code}</span>
              <span className="text-xs text-[#e5a312]">
                {coupon.discount_type === "percent" ? `${coupon.discount_value}%` : `₪${coupon.discount_value}`}
                {lang === "he" ? " הנחה" : " off"}
              </span>
            </div>
            <button
              onClick={removeCoupon}
              className="text-t-ghost hover:text-red-400 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        ) : (
          <form
            onSubmit={(e) => { e.preventDefault(); if (couponCode.trim()) applyCoupon(couponCode); }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Tag className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-t-ghost" strokeWidth={1.5} />
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder={lang === "he" ? "קוד קופון" : "Coupon code"}
                className="w-full bg-s-input border border-b-medium rounded-lg pr-9 pl-3 py-2.5 text-sm text-t-primary placeholder-t-ghost focus:outline-none focus:border-[#d4920a]/30 transition-colors"
                dir="ltr"
              />
            </div>
            <button
              type="submit"
              disabled={couponLoading || !couponCode.trim()}
              className="bg-[#d4920a] hover:bg-[#e5a312] disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer"
            >
              {couponLoading
                ? (lang === "he" ? "בודק..." : "Checking...")
                : (lang === "he" ? "החל" : "Apply")}
            </button>
          </form>
        )}
        {couponError && (
          <p className="text-xs text-red-400 mt-2">{couponError}</p>
        )}
      </div>

      {/* Summary */}
      <div className="bg-s-base border border-b-subtle rounded-2xl p-6">
        <div className="flex items-center justify-between mb-3 text-sm text-t-dim">
          <span>{t("cart.products")}</span>
          <span>{items.length}</span>
        </div>
        {discountAmount > 0 && (
          <>
            <div className="flex items-center justify-between mb-2 text-sm text-t-dim">
              <span>{lang === "he" ? "סכום ביניים" : "Subtotal"}</span>
              <span>{"\u20AA"}{totalPrice}</span>
            </div>
            <div className="flex items-center justify-between mb-3 text-sm text-[#e5a312]">
              <span>{lang === "he" ? "הנחה" : "Discount"} ({coupon?.code})</span>
              <span>-{"\u20AA"}{discountAmount}</span>
            </div>
          </>
        )}
        <div className="flex items-center justify-between mb-6 border-t border-b-subtle pt-4">
          <span className="text-lg font-semibold text-t-primary">{t("cart.total")}</span>
          <span className="text-lg font-semibold text-t-primary">{"\u20AA"}{finalPrice}</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/checkout"
            className="flex-1 flex items-center justify-center gap-2 bg-[#d4920a] hover:bg-[#e5a312] text-white py-3.5 rounded-full text-sm font-medium transition-all duration-300"
          >
            {t("cart.checkout")}
          </Link>
          <button
            onClick={clearCart}
            className="flex items-center justify-center gap-2 border border-b-medium text-t-dim hover:text-t-secondary hover:border-t-ghost py-3.5 px-5 rounded-full text-sm transition-all duration-300 cursor-pointer"
          >
            {t("cart.clear")}
          </button>
        </div>

        <Link
          href="/catalog"
          className="flex items-center justify-center gap-1.5 text-[13px] text-t-faint hover:text-t-muted transition-colors duration-300 mt-4"
        >
          <BackArrow className="w-3.5 h-3.5" strokeWidth={1.5} />
          {t("cart.continue")}
        </Link>
      </div>
    </div>
  );
}
