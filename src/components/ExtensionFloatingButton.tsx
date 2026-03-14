"use client";

import { Puzzle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/languageContext";

export default function ExtensionFloatingButton() {
  const { lang } = useLanguage();
  const pathname = usePathname();

  // Don't show on the extension page itself or admin pages
  if (pathname === "/extension" || pathname.startsWith("/admin")) return null;

  return (
    <Link
      href="/extension"
      className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-40 group flex items-center gap-1.5 sm:gap-2 bg-[#d4920a] hover:bg-[#e5a312] text-white pl-2.5 pr-3 sm:pl-3 sm:pr-4 py-2 sm:py-2.5 rounded-full shadow-lg shadow-black/20 transition-all duration-300 hover:scale-105"
    >
      <Puzzle className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.5} />
      <span className="text-[11px] sm:text-xs font-medium">
        {lang === "he" ? "התוסף לאינדיזיין" : "InDesign Extension"}
      </span>
    </Link>
  );
}
