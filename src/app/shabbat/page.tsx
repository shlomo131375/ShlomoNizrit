"use client";

import { useLanguage } from "@/lib/languageContext";

export default function ShabbatPage() {
  const { lang } = useLanguage();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full border border-[#d4920a]/30 flex items-center justify-center mx-auto mb-8">
          <span className="text-4xl">&#x2721;</span>
        </div>
        <h1 className="text-2xl font-bold text-t-primary mb-3 tracking-tight">
          {lang === "he" ? "שבת שלום" : "Shabbat Shalom"}
        </h1>
        <p className="text-sm text-t-dim leading-relaxed mb-2">
          {lang === "he"
            ? "האתר אינו פעיל בשבתות וחגים."
            : "The site is closed on Shabbat and holidays."}
        </p>
        <p className="text-sm text-t-dim leading-relaxed mb-8">
          {lang === "he"
            ? "נחזור לפעילות במוצאי שבת / חג."
            : "We'll be back after Shabbat / holiday."}
        </p>
        <div className="text-xs text-t-ghost">
          {lang === "he" ? "שבת שלום וחג שמח" : "Shabbat Shalom & Chag Sameach"}
        </div>
      </div>
    </div>
  );
}
