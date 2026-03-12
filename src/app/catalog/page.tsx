"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Search, ChevronDown } from "lucide-react";
import ScriptCard from "@/components/ScriptCard";
import { useScripts } from "@/lib/scriptsContext";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useLanguage } from "@/lib/languageContext";

function CatalogContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  const { t, lang } = useLanguage();
  const { scripts, categories } = useScripts();

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "price-asc" | "price-desc">("name");
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  const sortOptions = [
    { value: "name" as const, label: t("catalog.sortName") },
    { value: "price-asc" as const, label: t("catalog.sortPriceAsc") },
    { value: "price-desc" as const, label: t("catalog.sortPriceDesc") },
  ];
  const currentSort = sortOptions.find((o) => o.value === sortBy)!;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredScripts = useMemo(() => {
    let result = scripts;

    if (selectedCategory !== "all") {
      result = result.filter((s) => s.category === selectedCategory);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.displayName.includes(q) ||
          s.description.includes(q) ||
          s.scriptName.includes(q)
      );
    }

    result = [...result].sort((a, b) => {
      if (sortBy === "name") return a.displayName.localeCompare(b.displayName, lang);
      const priceA = a.price === "free" ? 0 : a.price;
      const priceB = b.price === "free" ? 0 : b.price;
      return sortBy === "price-asc" ? priceA - priceB : priceB - priceA;
    });

    return result;
  }, [scripts, selectedCategory, searchQuery, sortBy, lang]);

  const searchIconClass = lang === "he"
    ? "absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-t-faint"
    : "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-t-faint";

  const inputPadding = lang === "he" ? "pr-11 pl-4" : "pl-11 pr-4";

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-t-primary tracking-tight mb-3">{t("catalog.title")}</h1>
        <p className="text-sm text-t-dim">
          {scripts.length} {t("catalog.subtitle")}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-10 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className={searchIconClass} strokeWidth={1.5} />
            <input
              type="text"
              placeholder={t("catalog.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full bg-s-input border border-b-medium rounded-full ${inputPadding} py-3 text-sm text-t-primary placeholder-t-faint focus:outline-none focus:border-[#d4920a]/30 transition-colors duration-300`}
            />
          </div>

          <div className="relative" ref={sortRef}>
            <button
              type="button"
              onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center gap-2 bg-s-input border border-b-medium rounded-full px-5 py-3 text-sm text-t-secondary focus:outline-none focus:border-[#d4920a]/30 transition-colors duration-300 cursor-pointer hover:border-t-ghost"
            >
              {currentSort.label}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${sortOpen ? "rotate-180" : ""}`} strokeWidth={1.5} />
            </button>
            {sortOpen && (
              <div className="absolute left-0 md:right-0 md:left-auto top-full mt-2 min-w-[180px] bg-s-dropdown border border-b-medium rounded-xl overflow-hidden shadow-xl shadow-black/20 z-50">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortBy(option.value);
                      setSortOpen(false);
                    }}
                    className={`w-full ${lang === "he" ? "text-right" : "text-left"} px-4 py-2.5 text-sm transition-colors duration-200 cursor-pointer ${
                      sortBy === option.value
                        ? "text-[#e5a312] bg-[#d4920a]/10"
                        : "text-t-muted hover:text-t-primary hover:bg-s-hover"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-[#d4920a]/10 text-[#e5a312] border border-[#d4920a]/20"
                  : "text-t-dim border border-b-subtle hover:text-t-secondary hover:border-b-medium"
              }`}
            >
              {t(`cat.${cat.id}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="text-[11px] text-t-faint mb-6 uppercase tracking-wider">
        {filteredScripts.length} {t("catalog.results")}
      </div>

      {filteredScripts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredScripts.map((script) => (
            <ScriptCard key={script.id} script={script} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24">
          <h3 className="text-lg font-medium text-t-secondary mb-2">{t("catalog.noResults")}</h3>
          <p className="text-sm text-t-dim">{t("catalog.noResultsDesc")}</p>
        </div>
      )}
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-6 py-16 text-center text-t-faint text-sm">...</div>}>
      <CatalogContent />
    </Suspense>
  );
}
