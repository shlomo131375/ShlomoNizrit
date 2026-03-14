"use client";

import { Download, FolderOpen, Copy, MonitorDown, AppWindow, Puzzle } from "lucide-react";
import { useLanguage } from "@/lib/languageContext";

export default function ExtensionPage() {
  const { lang } = useLanguage();

  const downloadUrl = "https://drive.google.com/uc?export=download&id=1n0TD6qpB2v5Ka_oRG68FZHXVrfoThlbP";

  const steps = [
    {
      icon: FolderOpen,
      title: lang === "he" ? "צרו תיקייה" : "Create a Folder",
      desc: lang === "he"
        ? "בתיקיית ה-User Scripts של אינדיזיין, צרו תיקייה בשם Shlomo Nizrit"
        : "In InDesign's User Scripts folder, create a folder named Shlomo Nizrit",
      detail: lang === "he"
        ? "הנתיב: C:\\Users\\[שם_המשתמש]\\AppData\\Roaming\\Adobe\\InDesign\\Version [גרסה]-ME\\en_IL\\Scripts\\Scripts Panel\\Shlomo Nizrit\n\nשנו את [שם_המשתמש] לשם המשתמש שלכם ואת [גרסה] לגרסת האינדיזיין שלכם (לדוגמה: 18.0, 19.0)"
        : "Path: C:\\Users\\[username]\\AppData\\Roaming\\Adobe\\InDesign\\Version [version]-ME\\en_IL\\Scripts\\Scripts Panel\\Shlomo Nizrit\n\nReplace [username] with your Windows username and [version] with your InDesign version (e.g., 18.0, 19.0)",
    },
    {
      icon: Copy,
      title: lang === "he" ? "העתיקו את הסקריפטים" : "Copy the Scripts",
      desc: lang === "he"
        ? "העתיקו לתוך התיקייה את כל הסקריפטים שקיבלתם"
        : "Copy all the scripts you received into the folder",
    },
    {
      icon: MonitorDown,
      title: lang === "he" ? "הורידו את תוכנת ההתקנה" : "Download the Installer",
      desc: lang === "he"
        ? "הורידו את Anastasiy's Extension Manager — תוכנה חינמית להתקנת תוספים לאינדיזיין"
        : "Download Anastasiy's Extension Manager — a free tool for installing InDesign extensions",
      link: { url: "https://install.anastasiy.com/", label: lang === "he" ? "להורדת התוכנה" : "Download installer" },
    },
    {
      icon: AppWindow,
      title: lang === "he" ? "התקינו את התוסף" : "Install the Extension",
      desc: lang === "he"
        ? "סגרו את אינדיזיין, פתחו את התוכנה, בחרו InDesign, לחצו Install ובחרו את קובץ התוסף"
        : "Close InDesign, open the manager, select InDesign, click Install and choose the extension file",
    },
    {
      icon: Puzzle,
      title: lang === "he" ? "הפעילו את התוסף" : "Activate the Extension",
      desc: lang === "he"
        ? "פתחו את אינדיזיין וגשו ל–"
        : "Open InDesign and go to",
      highlight: "Window → Extensions → Shlomo Nizrit",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Header */}
      <div className="text-center mb-10 sm:mb-14">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#d4920a]/10 border border-[#d4920a]/20 flex items-center justify-center mx-auto mb-5 sm:mb-6">
          <Puzzle className="w-7 h-7 sm:w-8 sm:h-8 text-[#e5a312]" strokeWidth={1.5} />
        </div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-t-primary tracking-tight mb-3 sm:mb-4">
          {lang === "he" ? "התוסף לאינדיזיין" : "InDesign Extension"}
        </h1>
        <p className="text-sm sm:text-[15px] text-t-dim max-w-lg mx-auto leading-relaxed">
          {lang === "he"
            ? "פאנל צף ונוח שעוטף את כל הסקריפטים שלי — ניתן לעגן אותו כמו כל פאנל רגיל באינדיזיין. התוסף גם מעדכן אוטומטית את הסקריפטים שקניתם במידה והם התעדכנו, ומאפשר להוריד סקריפטים חינמיים ישירות מהפאנל."
            : "A convenient floating panel that wraps all my scripts — you can dock it like any regular InDesign panel. The extension also automatically updates purchased scripts when new versions are available, and lets you download free scripts directly from the panel."}
        </p>
      </div>

      {/* Download CTA */}
      <div className="bg-s-base border border-b-subtle rounded-2xl p-5 sm:p-6 mb-10 sm:mb-14 text-center">
        <a
          href={downloadUrl}
          className="inline-flex items-center gap-2 bg-[#d4920a] hover:bg-[#e5a312] text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-full text-sm font-medium transition-all duration-300"
        >
          <Download className="w-5 h-5" strokeWidth={1.5} />
          {lang === "he" ? "הורד את התוסף" : "Download Extension"}
        </a>
        <p className="text-xs text-t-ghost mt-3">
          {lang === "he" ? "קובץ ZXP להתקנה עם Extension Manager" : "ZXP file for installation with Extension Manager"}
        </p>
      </div>

      {/* Steps */}
      <div>
        <h2 className="text-[11px] font-medium text-t-dim uppercase tracking-wider mb-8">
          {lang === "he" ? "מדריך התקנה" : "Installation Guide"}
        </h2>
        <div className="space-y-4 sm:space-y-6">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="flex gap-3 sm:gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-s-base border border-b-subtle flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-[#e5a312]">{i + 1}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-px flex-1 bg-b-subtle mt-2" />
                  )}
                </div>
                <div className="pb-6 sm:pb-8 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Icon className="w-4 h-4 text-t-dim shrink-0" strokeWidth={1.5} />
                    <h3 className="text-sm sm:text-[15px] font-medium text-t-secondary">{step.title}</h3>
                  </div>
                  <p className="text-sm text-t-dim leading-relaxed">{step.desc}</p>
                  {step.highlight && (
                    <code className="inline-block mt-2 px-3 py-1.5 bg-s-base border border-b-subtle rounded-lg text-xs sm:text-sm text-[#e5a312] font-mono" dir="ltr">
                      {step.highlight}
                    </code>
                  )}
                  {step.detail && (
                    <pre className="mt-3 px-3 sm:px-4 py-3 bg-s-base border border-b-subtle rounded-xl text-[10px] sm:text-xs text-t-muted leading-relaxed whitespace-pre-wrap font-mono overflow-x-auto" dir="ltr">
                      {step.detail}
                    </pre>
                  )}
                  {step.link && (
                    <a
                      href={step.link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-2 text-sm text-[#e5a312] hover:text-[#fdc43f] transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
                      {step.link.label}
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
