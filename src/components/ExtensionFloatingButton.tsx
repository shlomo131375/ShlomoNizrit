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
      className="fixed bottom-6 left-6 z-40 group flex items-center gap-2 bg-[#d4920a] hover:bg-[#e5a312] text-white pl-3 pr-4 py-2.5 rounded-full shadow-lg shadow-black/20 transition-all duration-300 hover:scale-105"
    >
      <Puzzle className="w-4 h-4" strokeWidth={1.5} />
      <span className="text-xs font-medium">
        {lang === "he" ? "התוסף לאינדיזיין" : "InDesign Extension"}
      </span>
    </Link>
  );
}
