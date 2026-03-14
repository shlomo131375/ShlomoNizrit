"use client";

import { useLanguage } from "@/lib/languageContext";

export default function MaintenancePage() {
  const { lang } = useLanguage();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full border border-[#d4920a]/30 flex items-center justify-center mx-auto mb-8">
          <svg className="w-10 h-10 text-[#e5a312]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-t-primary mb-3 tracking-tight">
          {lang === "he" ? "האתר בתחזוקה" : "Under Maintenance"}
        </h1>
        <p className="text-sm text-t-dim leading-relaxed mb-6">
          {lang === "he"
            ? "אנחנו עובדים על שיפורים באתר. נחזור בקרוב!"
            : "We're working on improvements. We'll be back soon!"}
        </p>
        <div className="flex items-center justify-center gap-6 text-sm text-t-faint">
          <a href="https://wa.me/9720504669926" target="_blank" rel="noopener noreferrer" className="hover:text-[#e5a312] transition-colors">
            WhatsApp
          </a>
          <span className="text-b-subtle">|</span>
          <a href="mailto:shlomo1313753@gmail.com" className="hover:text-[#e5a312] transition-colors">
            Email
          </a>
        </div>
      </div>
    </div>
  );
}
