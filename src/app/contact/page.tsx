"use client";

import { useState } from "react";
import { Check, Mail } from "lucide-react";
import { useLanguage } from "@/lib/languageContext";

export default function ContactPage() {
  const { t, lang } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "", website: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSubmitted(true);
    } catch {
      alert(lang === "he" ? "שגיאה בשליחה, נסה שוב" : "Error sending, please try again");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-t-primary tracking-tight mb-3">{t("contact.title")}</h1>
        <p className="text-sm text-t-dim">{t("contact.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Info */}
        <div className="space-y-10">
          <div>
            <h2 className="text-[11px] font-medium text-t-dim uppercase tracking-wider mb-4">{t("contact.info")}</h2>
            <div className="space-y-5">
              <a
                href="https://mail.google.com/mail/?view=cm&to=shlomo1313753@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 group"
              >
                <div className="w-9 h-9 rounded-full border border-b-subtle flex items-center justify-center group-hover:border-[#d4920a]/30 transition-colors duration-300">
                  <Mail className="w-4 h-4 text-t-dim group-hover:text-[#e5a312] transition-colors duration-300" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="text-[11px] text-t-ghost uppercase tracking-wider">{t("contact.emailLabel")}</div>
                  <div className="text-sm text-t-muted group-hover:text-[#e5a312] transition-colors duration-300" dir="ltr">shlomo1313753@gmail.com</div>
                </div>
              </a>

              <a
                href="https://wa.me/9720504669926"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 group"
              >
                <div className="w-9 h-9 rounded-full border border-b-subtle flex items-center justify-center group-hover:border-[#d4920a]/30 transition-colors duration-300">
                  <svg className="w-4 h-4 text-t-dim group-hover:text-[#e5a312] transition-colors duration-300" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </div>
                <div>
                  <div className="text-[11px] text-t-ghost uppercase tracking-wider">{t("contact.whatsapp")}</div>
                  <div className="text-sm text-t-muted group-hover:text-[#e5a312] transition-colors duration-300" dir="ltr">050-466-9926</div>
                </div>
              </a>
            </div>
          </div>

          <div>
            <h2 className="text-[11px] font-medium text-t-dim uppercase tracking-wider mb-4">{t("contact.hours")}</h2>
            <div className="space-y-2 text-sm">
              {[
                { day: t("contact.sunThu"), hours: "08:00 - 17:00" },
                { day: t("contact.fri"), hours: t("contact.closed") },
                { day: t("contact.sat"), hours: t("contact.closed") },
              ].map((item) => (
                <div key={item.day} className="flex justify-between">
                  <span className="text-t-faint">{item.day}</span>
                  <span className="text-t-muted">{item.hours}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form */}
        <div>
          {submitted ? (
            <div className="bg-s-base border border-b-subtle rounded-2xl p-10 text-center">
              <div className="w-12 h-12 border border-[#d4920a]/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-5 h-5 text-[#e5a312]" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-medium text-t-primary mb-2">{t("contact.sent")}</h3>
              <p className="text-sm text-t-dim">{t("contact.sentDesc")}</p>
            </div>
          ) : (
            <form method="POST" onSubmit={handleSubmit} className="space-y-4">
              {[
                { label: t("contact.name"), key: "name" as const, type: "text", placeholder: t("contact.namePlaceholder") },
                { label: t("contact.emailLabel"), key: "email" as const, type: "email", placeholder: t("contact.emailPlaceholder") },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-xs text-t-faint mb-1.5">{field.label}</label>
                  <input
                    type={field.type}
                    required
                    value={form[field.key]}
                    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                    className="w-full bg-s-input border border-b-medium rounded-xl px-4 py-3 text-sm text-t-primary placeholder-t-ghost focus:outline-none focus:border-[#d4920a]/30 transition-colors duration-300"
                    placeholder={field.placeholder}
                    dir={field.type === "email" ? "ltr" : undefined}
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs text-t-faint mb-1.5">{t("contact.message")}</label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full bg-s-input border border-b-medium rounded-xl px-4 py-3 text-sm text-t-primary placeholder-t-ghost focus:outline-none focus:border-[#d4920a]/30 transition-colors duration-300 resize-none"
                  placeholder={t("contact.messagePlaceholder")}
                />
              </div>
              {/* Honeypot - hidden from real users, bots fill it */}
              <div className="absolute opacity-0 -z-10" aria-hidden="true">
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="w-full bg-[#d4920a] hover:bg-[#e5a312] disabled:opacity-60 text-white py-3.5 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer"
              >
                {sending ? (lang === "he" ? "שולח..." : "Sending...") : t("contact.send")}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
