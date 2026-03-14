"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Logo from "@/components/Logo";
import { useLanguage } from "@/lib/languageContext";
import { useScripts } from "@/lib/scriptsContext";

export default function AboutPage() {
  const { t, lang } = useLanguage();
  const { scripts } = useScripts();
  const Arrow = lang === "he" ? ArrowLeft : ArrowRight;

  return (
    <div className="max-w-3xl mx-auto px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="flex justify-center mb-6">
          <Logo size={48} className="opacity-70" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-t-primary tracking-tight mb-5">
          {lang === "he"
            ? "סקריפטים שמקצרים שעות עבודה באינדיזיין"
            : "Scripts That Save Hours of InDesign Work"}
        </h1>
        <p className="text-[15px] text-t-dim max-w-lg mx-auto leading-relaxed">
          {lang === "he"
            ? "Shlomo Nizrit הוא אוסף סקריפטים מקצועיים ל-Adobe InDesign שנועדו לפתור את הבעיות שמעצבים ומעמדים פוגשים כל יום בעבודה."
            : "Shlomo Nizrit is a collection of professional Adobe InDesign scripts designed to solve the problems designers and typesetters face every day."}
        </p>
        <div className="mt-6 space-y-1 text-sm text-t-muted">
          <p>{lang === "he" ? "פחות עבודה ידנית." : "Less manual work."}</p>
          <p>{lang === "he" ? "פחות פעולות שחוזרות על עצמן." : "Fewer repetitive tasks."}</p>
          <p>{lang === "he" ? "יותר זמן לעיצוב אמיתי." : "More time for real design."}</p>
        </div>
      </div>

      <div className="h-px bg-gradient-to-l from-transparent via-b-subtle to-transparent mb-16" />

      {/* Story */}
      <div className="mb-16">
        <h2 className="text-[11px] font-medium text-t-dim uppercase tracking-wider mb-6">
          {lang === "he" ? "הסיפור" : "The Story"}
        </h2>
        <div className="text-[15px] text-t-dim leading-[1.9] space-y-5">
          <p className="text-t-muted font-medium">
            {lang === "he"
              ? "הכול התחיל מהמציאות הפשוטה של עבודת עימוד."
              : "It all started from the simple reality of typesetting work."}
          </p>
          <p>
            {lang === "he"
              ? "קובץ ארוך מגיע. צריך לנקות רווחים. להחליף סגנונות. לנווט בין מאות עמודים. לייצא שוב ושוב גרסאות שונות."
              : "A long file arrives. Spaces need cleaning. Styles need replacing. Navigating hundreds of pages. Exporting different versions again and again."}
          </p>
          <p>
            {lang === "he"
              ? "מי שעובד עם אינדיזיין מכיר את זה היטב: לא מדובר בעבודה מורכבת — אלא בפעולות קטנות שחוזרות על עצמן עשרות ומאות פעמים."
              : "Anyone who works with InDesign knows this well: it's not complex work — it's small actions that repeat themselves dozens and hundreds of times."}
          </p>
          <p>
            {lang === "he"
              ? "כמעצב שעובד יום-יום עם אינדיזיין, הבנתי מהר מאוד שהדרך היחידה לעבוד באמת ביעילות היא לא לעשות את הכול ידנית."
              : "As a designer working daily with InDesign, I quickly realized that the only way to truly work efficiently is to stop doing everything manually."}
          </p>
          <p className="text-t-muted font-medium">
            {lang === "he" ? "אז התחלתי לכתוב סקריפטים." : "So I started writing scripts."}
          </p>
          <p>
            {lang === "he"
              ? "בהתחלה כדי לפתור בעיות קטנות בעבודה האישית שלי. אחר כך כדי לייעל תהליכים שלמים. ולאט לאט נוצרו כלים שחוסכים זמן אמיתי בכל פרויקט."
              : "At first to solve small problems in my personal work. Then to streamline entire processes. And gradually, tools were created that save real time in every project."}
          </p>
          <p>
            {lang === "he"
              ? "כשהבנתי שמעצבים ומעמדים אחרים מתמודדים בדיוק עם אותן בעיות — החלטתי להפוך את הכלים האלה לפרויקט מסודר."
              : "When I realized that other designers and typesetters face exactly the same problems — I decided to turn these tools into an organized project."}
          </p>
          <p className="text-t-muted font-medium">
            {lang === "he" ? "וכך נולד Shlomo Nizrit." : "And so Shlomo Nizrit was born."}
          </p>
        </div>
      </div>

      <div className="h-px bg-gradient-to-l from-transparent via-b-subtle to-transparent mb-16" />

      {/* Stats */}
      <div className="mb-16">
        <h2 className="text-[11px] font-medium text-t-dim uppercase tracking-wider mb-8 text-center">
          {lang === "he" ? "במספרים" : "In Numbers"}
        </h2>
        <div className="grid grid-cols-3 gap-8">
          {[
            {
              value: `${scripts.length}+`,
              label: lang === "he" ? "סקריפטים פעילים" : "Active Scripts",
            },
            {
              value: "50+",
              label: lang === "he" ? "מעצבים ומעמדים" : "Designers & Typesetters",
            },
            {
              value: "5+",
              sub: lang === "he" ? "שנים" : "years",
              label: lang === "he" ? "שימוש יומיומי ופיתוח" : "Daily use & development",
            },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-t-primary tracking-tight">
                {stat.value}
                {stat.sub && <span className="text-sm font-normal text-t-dim mr-1"> {stat.sub}</span>}
              </div>
              <div className="text-[11px] text-t-faint mt-1 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-gradient-to-l from-transparent via-b-subtle to-transparent mb-16" />

      {/* Why different */}
      <div className="mb-16">
        <h2 className="text-[11px] font-medium text-t-dim uppercase tracking-wider mb-8">
          {lang === "he" ? "למה הסקריפטים האלה שונים" : "Why These Scripts Are Different"}
        </h2>
        <div className="space-y-8">
          {[
            {
              title: lang === "he" ? "נבנו מתוך עבודה אמיתית" : "Built from Real Work",
              desc: lang === "he"
                ? "הסקריפטים לא נולדו כרעיון תיאורטי — אלא מתוך עבודה יומיומית עם מסמכים מורכבים ופרויקטים אמיתיים. כל כלי פותח כדי לפתור בעיה שקיימת בעבודה בפועל."
                : "The scripts weren't born as a theoretical idea — but from daily work with complex documents and real projects. Every tool was developed to solve a problem that exists in actual work.",
            },
            {
              title: lang === "he" ? "ממשק ברור בעברית" : "Clear Hebrew Interface",
              desc: lang === "he"
                ? "כל הסקריפטים מגיעים עם ממשק משתמש מלא בעברית — ברור, נוח, ובלי צורך לנחש מה כל כפתור עושה."
                : "All scripts come with a full Hebrew user interface — clear, comfortable, and no need to guess what each button does.",
            },
            {
              title: lang === "he" ? "חוסכים זמן אמיתי" : "Save Real Time",
              desc: lang === "he"
                ? "הסקריפטים מיועדים למשימות שלוקחות דקות רבות בכל פרויקט — וכשמצטברים מאות פעמים, הן הופכות לשעות עבודה. הכלים כאן נועדו לקצר בדיוק את המקומות האלה."
                : "The scripts target tasks that take many minutes in every project — and when accumulated hundreds of times, they become hours of work. These tools are designed to shorten exactly those spots.",
            },
            {
              title: lang === "he" ? "מתפתחים כל הזמן" : "Constantly Evolving",
              desc: lang === "he"
                ? "הסקריפטים ממשיכים להשתפר עם הזמן — עם עדכונים, שיפורים ופידבק ממשתמשים."
                : "The scripts keep improving over time — with updates, improvements and user feedback.",
            },
          ].map((item) => (
            <div key={item.title}>
              <h3 className="text-[15px] text-t-secondary font-medium mb-1.5">{item.title}</h3>
              <p className="text-sm text-t-dim leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-gradient-to-l from-transparent via-b-subtle to-transparent mb-16" />

      {/* Closing */}
      <div className="text-center mb-16">
        <p className="text-[15px] text-t-muted leading-relaxed max-w-md mx-auto">
          {lang === "he"
            ? "המטרה פשוטה: לעזור למעצבים ומעמדים לעבוד מהר יותר, חכם יותר, ועם פחות עבודה ידנית."
            : "The goal is simple: help designers and typesetters work faster, smarter, and with less manual work."}
        </p>
      </div>

      {/* CTA */}
      <div className="text-center">
        <Link
          href="/catalog"
          className="inline-flex items-center gap-2 bg-[#d4920a] hover:bg-[#e5a312] text-white px-7 py-3.5 rounded-full text-sm font-medium transition-all duration-300"
        >
          {t("about.cta")}
          <Arrow className="w-4 h-4" strokeWidth={1.5} />
        </Link>
      </div>
    </div>
  );
}
