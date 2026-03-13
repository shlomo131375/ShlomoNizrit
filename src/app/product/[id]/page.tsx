"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeft, ShoppingCart, Check, Download, Play, Package } from "lucide-react";
import { useScripts } from "@/lib/scriptsContext";
import { useCart } from "@/lib/cartContext";
import { useLanguage } from "@/lib/languageContext";
import ScriptCard from "@/components/ScriptCard";

function getYoutubeEmbedUrl(url: string): string | null {
  try {
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1]?.split("?")[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (url.includes("youtube.com/watch")) {
      const urlObj = new URL(url);
      const id = urlObj.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (url.includes("youtube.com/playlist")) {
      const urlObj = new URL(url);
      const listId = urlObj.searchParams.get("list");
      return listId ? `https://www.youtube.com/embed/videoseries?list=${listId}` : null;
    }
  } catch {
    return null;
  }
  return null;
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { scripts, getScriptById, formatPrice } = useScripts();
  const script = getScriptById(id);
  const { addToCart, isInCart, isOrdered } = useCart();
  const { t, lang } = useLanguage();
  const BackArrow = lang === "he" ? ArrowRight : ArrowLeft;
  const alreadyOrdered = isOrdered(id);

  // Build combined video list: videos array + legacy videoUrl
  const allVideos: { url: string; title: string; is_main: boolean }[] = [];
  if (script) {
    if (script.videos && script.videos.length > 0) {
      // Use videos array (already sorted by sort_order from context)
      script.videos.forEach((v) => allVideos.push(v));
    } else if (script.videoUrl) {
      // Fallback to legacy single video
      allVideos.push({ url: script.videoUrl, title: script.displayName, is_main: true });
    }
  }

  const mainVideoIndex = allVideos.findIndex((v) => v.is_main);
  const initialIndex = mainVideoIndex >= 0 ? mainVideoIndex : 0;
  const [activeVideoIndex, setActiveVideoIndex] = useState(initialIndex);

  if (!script) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">
        <h1 className="text-xl font-medium text-t-primary mb-4">{t("product.notFound")}</h1>
        <Link href="/catalog" className="text-sm text-[#e5a312] hover:text-[#fdc43f] transition-colors">
          {t("product.backToScripts")}
        </Link>
      </div>
    );
  }

  const inCart = isInCart(script.id);
  const isFree = script.price === "free";
  const currentVideo = allVideos[activeVideoIndex];
  const embedUrl = currentVideo ? getYoutubeEmbedUrl(currentVideo.url) : null;

  const related = scripts
    .filter((s) => s.category === script.category && s.id !== script.id)
    .slice(0, 3);

  const features = [
    t("product.instantDownload"),
    t("product.freeUpdates"),
    t("product.singleLicense"),
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[12px] text-t-faint mb-10">
        <Link href="/" className="hover:text-t-muted transition-colors duration-300">{t("product.home")}</Link>
        <span className="text-t-ghost">/</span>
        <Link href="/catalog" className="hover:text-t-muted transition-colors duration-300">{t("nav.scripts")}</Link>
        <span className="text-t-ghost">/</span>
        <Link href={`/catalog?category=${script.category}`} className="hover:text-t-muted transition-colors duration-300">
          {t(`cat.${script.category}`)}
        </Link>
        <span className="text-t-ghost">/</span>
        <span className="text-t-muted">{script.displayName}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Main */}
        <div className="lg:col-span-3 space-y-8">
          {/* Video */}
          {embedUrl ? (
            <div>
              <div className="aspect-video rounded-2xl overflow-hidden bg-s-base border border-b-subtle">
                <iframe
                  src={embedUrl}
                  title={currentVideo?.title || script.displayName}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Video selector - only show if multiple videos */}
              {allVideos.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  {allVideos.map((video, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveVideoIndex(index)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-300 cursor-pointer border ${
                        activeVideoIndex === index
                          ? "bg-[#d4920a]/15 border-[#d4920a]/30 text-[#e5a312]"
                          : "bg-s-base border-b-subtle text-t-dim hover:text-t-secondary hover:border-t-ghost"
                      }`}
                    >
                      <Play className="w-3 h-3" strokeWidth={1.5} />
                      {video.title || `${lang === "he" ? "סרטון" : "Video"} ${index + 1}`}
                      {video.is_main && (
                        <span className="text-[9px] bg-[#d4920a]/20 text-[#e5a312] px-1.5 py-0.5 rounded-full">
                          {lang === "he" ? "ראשי" : "Main"}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-video rounded-2xl bg-s-base border border-b-subtle flex items-center justify-center">
              <p className="text-sm text-t-ghost">{t("product.noVideo")}</p>
            </div>
          )}

          {/* Description */}
          <div>
            <h2 className="text-[11px] font-medium text-t-dim uppercase tracking-wider mb-3">{t("product.description")}</h2>
            <p className="text-t-muted leading-relaxed">{script.description}</p>
          </div>

          {/* Technical */}
          <div>
            <h2 className="text-[11px] font-medium text-t-dim uppercase tracking-wider mb-4">{t("product.details")}</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: t("product.file"), value: script.scriptName },
                { label: t("product.version"), value: script.version },
                { label: t("product.category"), value: t(`cat.${script.category}`) },
                { label: t("product.compatibility"), value: "InDesign 18+" },
              ].map((item) => (
                <div key={item.label} className="bg-s-base border border-b-subtle rounded-xl p-4">
                  <div className="text-[11px] text-t-faint uppercase tracking-wider">{item.label}</div>
                  <div className="text-sm text-t-secondary mt-1 font-mono">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 space-y-6">
            <div className="bg-s-base rounded-2xl border border-b-subtle p-6">
              <h1 className="text-xl font-semibold text-t-primary mb-1 tracking-tight">{script.displayName}</h1>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-[11px] text-t-faint uppercase tracking-wider">{t(`cat.${script.category}`)}</span>
                {allVideos.length > 0 && (
                  <span className="flex items-center gap-1 text-[11px] text-t-ghost">
                    <Play className="w-3 h-3" strokeWidth={1.5} />
                    {allVideos.length > 1 ? `${allVideos.length} ${lang === "he" ? "סרטונים" : "videos"}` : ""}
                  </span>
                )}
              </div>

              <div className="text-3xl font-bold text-t-primary mb-6 tracking-tight">
                {formatPrice(script.price)}
              </div>

              {isFree ? (
                <a
                  href={`/api/download-free?id=${script.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-[#d4920a] hover:bg-[#e5a312] text-white py-3.5 rounded-full text-sm font-medium transition-all duration-300"
                >
                  <Download className="w-4 h-4" strokeWidth={1.5} />
                  {t("product.downloadFree")}
                </a>
              ) : alreadyOrdered ? (
                <div className="w-full flex items-center justify-center gap-2 bg-s-hover border border-b-subtle text-t-dim py-3.5 rounded-full text-sm font-medium">
                  <Package className="w-4 h-4" strokeWidth={1.5} />
                  {lang === "he" ? "כבר הוזמן" : "Already Ordered"}
                </div>
              ) : inCart ? (
                <Link
                  href="/cart"
                  className="w-full flex items-center justify-center gap-2 bg-[#d4920a]/10 border border-[#d4920a]/20 text-[#e5a312] py-3.5 rounded-full text-sm font-medium"
                >
                  <Check className="w-4 h-4" strokeWidth={1.5} />
                  {t("product.inCartCheckout")}
                </Link>
              ) : (
                <button
                  onClick={() => addToCart(script)}
                  className="w-full flex items-center justify-center gap-2 bg-[#d4920a] hover:bg-[#e5a312] text-white py-3.5 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" strokeWidth={1.5} />
                  {t("card.addToCart")}
                </button>
              )}

              <ul className="mt-6 space-y-2.5 text-[13px] text-t-dim">
                {features.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-[#d4920a]/40" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href="/catalog"
              className="flex items-center justify-center gap-2 text-[13px] text-t-faint hover:text-t-muted transition-colors duration-300"
            >
              <BackArrow className="w-3.5 h-3.5" strokeWidth={1.5} />
              {t("product.backToScripts")}
            </Link>
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-20 pt-10 border-t border-b-subtle">
          <h2 className="text-xl font-semibold text-t-primary mb-8 tracking-tight">{t("product.related")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {related.map((s) => (
              <ScriptCard key={s.id} script={s} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
