"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ScriptCard from "@/components/ScriptCard";
import { useScripts } from "@/lib/scriptsContext";
import Logo from "@/components/Logo";
import { useLanguage } from "@/lib/languageContext";

export default function HomePage() {
  const { t, lang } = useLanguage();
  const { scripts, categories } = useScripts();
  const Arrow = lang === "he" ? ArrowLeft : ArrowRight;

  const featuredScripts = scripts
    .filter((s) => s.price !== "free")
    .sort((a, b) => (typeof b.price === "number" ? b.price : 0) - (typeof a.price === "number" ? a.price : 0))
    .slice(0, 6);

  const freeScripts = scripts.filter((s) => s.price === "free");

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#d4920a]/[0.04] rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 lg:px-8 py-28 md:py-40">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <Logo size={64} className="opacity-80" />
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-t-primary mb-4 leading-[1.1] tracking-tight">
              {lang === "he" ? "סקריפטים חכמים" : "Smart Scripts for"}
              <br />
              {lang === "he" && "ל-"}
              <span className="bg-gradient-to-l from-[#e5a312] to-[#d4920a] bg-clip-text text-transparent">
                {lang === "he" ? "אדובי אינדיזיין" : "Adobe InDesign"}
              </span>
            </h1>

            <p className="text-base md:text-lg text-t-muted mb-6 max-w-xl mx-auto leading-relaxed">
              {lang === "he"
                ? "שמקצרים תהליכי עבודה של מעצבים ומעמדים."
                : "That streamline workflows for designers and typesetters."}
            </p>

            <div className="flex flex-col items-center gap-1 mb-4 text-sm text-t-dim">
              <p>{lang === "he" ? "פחות פעולות ידניות." : "Fewer manual tasks."}</p>
              <p>{lang === "he" ? "פחות זמן מבוזבז." : "Less wasted time."}</p>
              <p>{lang === "he" ? "יותר עבודה אמיתית." : "More real work."}</p>
            </div>

            <p className="text-sm text-t-faint mb-10">
              {lang === "he"
                ? "פעולות של דקות — בלחיצה אחת."
                : "Minutes of work — in one click."}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/catalog"
                className="inline-flex items-center justify-center gap-2 bg-[#d4920a] hover:bg-[#e5a312] text-white px-7 py-3.5 rounded-full text-sm font-medium transition-all duration-300 hover:shadow-lg hover:shadow-[#d4920a]/20"
              >
                {t("hero.cta")}
                <Arrow className="w-4 h-4" strokeWidth={1.5} />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center gap-2 border border-b-medium hover:border-t-dim text-t-secondary hover:text-t-primary px-7 py-3.5 rounded-full text-sm font-medium transition-all duration-300"
              >
                {t("hero.learn")}
              </Link>
            </div>
          </div>
        </div>

        <div className="h-px bg-gradient-to-l from-transparent via-b-subtle to-transparent" />
      </section>

      {/* Stats */}
      <section className="max-w-5xl mx-auto px-6 lg:px-8 py-20">
        <div className="grid grid-cols-3 gap-8">
          {[
            { value: `${scripts.length}+`, label: t("stats.scripts") },
            { value: "5+", label: lang === "he" ? "שנות פיתוח" : "Years of Development" },
            { value: "1000+", label: t("stats.hours") },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-t-primary tracking-tight">{stat.value}</div>
              <div className="text-xs text-t-dim mt-2 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="h-px bg-gradient-to-l from-transparent via-b-subtle to-transparent" />

      {/* Categories */}
      <section className="max-w-5xl mx-auto px-6 lg:px-8 py-20">
        <h2 className="text-2xl md:text-3xl font-bold text-t-primary text-center mb-12 tracking-tight">
          {t("home.categories")}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {categories
            .filter((c) => c.id !== "all")
            .map((cat) => {
              const count = scripts.filter((s) => s.category === cat.id).length;
              return (
                <Link
                  key={cat.id}
                  href={`/catalog?category=${cat.id}`}
                  className="group bg-s-base border border-b-subtle rounded-2xl p-6 text-center hover:border-[#d4920a]/20 transition-all duration-500"
                >
                  <h3 className="text-t-secondary font-medium text-[15px] group-hover:text-[#e5a312] transition-colors duration-300">
                    {t(`cat.${cat.id}`)}
                  </h3>
                  <p className="text-t-faint text-xs mt-1">{count} {t("home.scriptsCount")}</p>
                </Link>
              );
            })}
        </div>
      </section>

      <div className="h-px bg-gradient-to-l from-transparent via-b-subtle to-transparent" />

      {/* Featured */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-t-primary tracking-tight">
            {t("home.featured")}
          </h2>
          <Link
            href="/catalog"
            className="text-sm text-t-dim hover:text-[#e5a312] transition-colors duration-300 flex items-center gap-1.5"
          >
            {t("home.all")}
            <Arrow className="w-3.5 h-3.5" strokeWidth={1.5} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredScripts.map((script) => (
            <ScriptCard key={script.id} script={script} />
          ))}
        </div>
      </section>

      {/* Free */}
      {freeScripts.length > 0 && (
        <>
          <div className="h-px bg-gradient-to-l from-transparent via-b-subtle to-transparent" />
          <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
            <h2 className="text-2xl md:text-3xl font-bold text-t-primary text-center mb-12 tracking-tight">
              {t("home.free")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {freeScripts.map((script) => (
                <ScriptCard key={script.id} script={script} />
              ))}
            </div>
          </section>
        </>
      )}

      <div className="h-px bg-gradient-to-l from-transparent via-b-subtle to-transparent" />

      {/* Why us */}
      <section className="max-w-5xl mx-auto px-6 lg:px-8 py-20">
        <h2 className="text-2xl md:text-3xl font-bold text-t-primary text-center mb-12 tracking-tight">
          {t("home.whyUs")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: t("home.timeSaving"), desc: t("home.timeSavingDesc") },
            { title: t("home.fromField"), desc: t("home.fromFieldDesc") },
            { title: t("home.licensing"), desc: t("home.licensingDesc") },
          ].map((feature) => (
            <div key={feature.title} className="text-center">
              <h3 className="text-t-secondary font-medium text-[15px] mb-2">{feature.title}</h3>
              <p className="text-sm text-t-dim leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="h-px bg-gradient-to-l from-transparent via-b-subtle to-transparent" />

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 lg:px-8 py-24">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-t-primary mb-4 tracking-tight">
            {t("home.ctaTitle")}
          </h2>
          <p className="text-sm text-t-dim mb-8">
            {t("home.ctaSubtitle")}
          </p>
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 bg-[#d4920a] hover:bg-[#e5a312] text-white px-7 py-3.5 rounded-full text-sm font-medium transition-all duration-300 hover:shadow-lg hover:shadow-[#d4920a]/20"
          >
            {t("home.ctaButton")}
            <Arrow className="w-4 h-4" strokeWidth={1.5} />
          </Link>
        </div>
      </section>
    </div>
  );
}
