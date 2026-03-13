"use client";

import Link from "next/link";
import { ShoppingCart, Play, Check, ArrowLeft, ArrowRight, Package } from "lucide-react";
import type { Script } from "@/data/scripts";
import { formatPrice } from "@/data/scripts";
import { useCart } from "@/lib/cartContext";
import { useLanguage } from "@/lib/languageContext";

interface ScriptCardProps {
  script: Script;
}

export default function ScriptCard({ script }: ScriptCardProps) {
  const { addToCart, isInCart, isOrdered } = useCart();
  const { t, lang } = useLanguage();
  const inCart = isInCart(script.id);
  const ordered = isOrdered(script.id);
  const isFree = script.price === "free";
  const Arrow = lang === "he" ? ArrowLeft : ArrowRight;

  return (
    <div className="group relative bg-s-base rounded-2xl border border-b-subtle hover:border-[#d4920a]/20 transition-all duration-500 overflow-hidden flex flex-col">
      {/* Top accent line on hover */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-l from-transparent via-[#d4920a]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="p-6 flex-1 flex flex-col">
        {/* Category + badges */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-medium text-t-dim uppercase tracking-wider">
            {t(`cat.${script.category}`)}
          </span>
          <div className="flex items-center gap-2">
            {script.videoUrl && (
              <Play className="w-3 h-3 text-t-faint" strokeWidth={1.5} />
            )}
            {isFree && (
              <span className="text-[11px] text-[#e5a312]/70 font-medium">{t("card.free")}</span>
            )}
          </div>
        </div>

        {/* Title */}
        <Link href={`/product/${script.id}`}>
          <h3 className="text-[15px] font-semibold text-t-primary mb-2 group-hover:text-[#e5a312] transition-colors duration-300 line-clamp-1">
            {script.displayName}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-[13px] text-t-dim leading-relaxed mb-6 line-clamp-2 flex-1">
          {script.description}
        </p>

        {/* Price + Action */}
        <div className="flex items-center justify-between pt-4 border-t border-b-subtle">
          <span className="text-lg font-semibold text-t-primary">
            {formatPrice(script.price)}
          </span>

          {isFree ? (
            <Link
              href={`/product/${script.id}`}
              className="flex items-center gap-1.5 text-[13px] text-[#e5a312]/80 hover:text-[#e5a312] transition-colors duration-300"
            >
              <span>{t("card.download")}</span>
              <Arrow className="w-3.5 h-3.5" strokeWidth={1.5} />
            </Link>
          ) : ordered ? (
            <span className="flex items-center gap-1.5 text-[13px] text-t-ghost">
              <Package className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>{lang === "he" ? "כבר הוזמן" : "Ordered"}</span>
            </span>
          ) : inCart ? (
            <Link
              href="/cart"
              className="flex items-center gap-1.5 text-[13px] text-[#e5a312]"
            >
              <Check className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>{t("card.inCart")}</span>
            </Link>
          ) : (
            <button
              onClick={() => addToCart(script)}
              className="flex items-center gap-1.5 text-[13px] bg-[#d4920a]/10 text-[#d4920a] hover:bg-[#d4920a] hover:text-white px-3.5 py-1.5 rounded-full transition-all duration-300 cursor-pointer"
            >
              <ShoppingCart className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>{t("card.addToCart")}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
