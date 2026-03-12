"use client";

import { useState } from "react";
import { Search, Eye, Tag, Package } from "lucide-react";
import { useScripts } from "@/lib/scriptsContext";
import Link from "next/link";

export default function AdminPage() {
  const { scripts, formatPrice } = useScripts();
  const [searchQuery, setSearchQuery] = useState("");

  const totalValue = scripts.reduce((sum, s) => sum + (s.price === "free" ? 0 : s.price), 0);
  const paidScripts = scripts.filter((s) => s.price !== "free");
  const avgPrice = Math.round(
    paidScripts.reduce((sum, s) => sum + (typeof s.price === "number" ? s.price : 0), 0) / paidScripts.length
  );
  const freeCount = scripts.filter((s) => s.price === "free").length;

  const categoryStats = scripts.reduce<Record<string, number>>((acc, s) => {
    acc[s.category] = (acc[s.category] || 0) + 1;
    return acc;
  }, {});

  const filteredScripts = scripts.filter(
    (s) =>
      s.displayName.includes(searchQuery) ||
      s.description.includes(searchQuery) ||
      s.scriptName.includes(searchQuery)
  );

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
      <h1 className="text-2xl font-bold text-t-primary mb-10 tracking-tight">ניהול</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
        {[
          { label: "סקריפטים", value: scripts.length.toString() },
          { label: "שווי קטלוג", value: `\u20AA${totalValue.toLocaleString()}` },
          { label: "מחיר ממוצע", value: `\u20AA${avgPrice}` },
          { label: "חינם", value: freeCount.toString() },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-s-base border border-b-subtle rounded-xl p-5"
          >
            <div className="text-[11px] text-t-faint uppercase tracking-wider">{stat.label}</div>
            <div className="text-xl font-semibold text-t-primary mt-1 tracking-tight">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="mb-10 flex flex-wrap gap-3">
        <Link
          href="/admin/scripts"
          className="inline-flex items-center gap-2 bg-s-base border border-b-subtle hover:border-[#d4920a]/30 rounded-xl px-5 py-3 text-sm text-t-secondary transition-all duration-300"
        >
          <Package className="w-4 h-4 text-[#e5a312]" strokeWidth={1.5} />
          ניהול סקריפטים
        </Link>
        <Link
          href="/admin/coupons"
          className="inline-flex items-center gap-2 bg-s-base border border-b-subtle hover:border-[#d4920a]/30 rounded-xl px-5 py-3 text-sm text-t-secondary transition-all duration-300"
        >
          <Tag className="w-4 h-4 text-[#e5a312]" strokeWidth={1.5} />
          ניהול קופונים
        </Link>
      </div>

      {/* Categories */}
      <div className="bg-s-base border border-b-subtle rounded-xl p-6 mb-10">
        <h2 className="text-[11px] font-medium text-t-dim uppercase tracking-wider mb-4">קטגוריות</h2>
        <div className="space-y-3">
          {Object.entries(categoryStats).map(([cat, count]) => (
            <div key={cat} className="flex items-center gap-4">
              <span className="text-sm text-t-muted w-16">{cat}</span>
              <div className="flex-1 bg-s-hover rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-l from-[#d4920a] to-[#d4920a] rounded-full"
                  style={{ width: `${(count / scripts.length) * 100}%` }}
                />
              </div>
              <span className="text-sm text-t-dim w-6 text-left">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-s-base border border-b-subtle rounded-xl overflow-hidden">
        <div className="p-5 border-b border-b-subtle flex items-center justify-between">
          <h2 className="text-[11px] font-medium text-t-dim uppercase tracking-wider">כל הסקריפטים</h2>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-t-ghost" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="חיפוש..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-s-input border border-b-medium rounded-lg pr-8 pl-3 py-1.5 text-xs text-t-primary placeholder-t-ghost focus:outline-none focus:border-[#d4920a]/30 transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-b-subtle">
                {["שם", "קטגוריה", "מחיר", "גרסה", "סרטון", ""].map((h, i) => (
                  <th key={i} className="text-right text-[11px] text-t-ghost font-medium uppercase tracking-wider px-5 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredScripts.map((script) => (
                <tr
                  key={script.id}
                  className="border-b border-b-subtle hover:bg-s-hover transition-colors duration-200"
                >
                  <td className="px-5 py-3.5">
                    <div className="text-sm text-t-secondary">{script.displayName}</div>
                    <div className="text-[11px] text-t-ghost font-mono">{script.scriptName}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs text-t-dim">{script.category}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-sm ${script.price === "free" ? "text-[#e5a312]/60" : "text-t-muted"}`}>
                      {formatPrice(script.price)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-t-faint">{script.version}</td>
                  <td className="px-5 py-3.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${script.videoUrl ? "bg-[#d4920a]/60" : "bg-t-ghost"}`} />
                  </td>
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/product/${script.id}`}
                      className="text-t-ghost hover:text-[#e5a312] transition-colors duration-300"
                    >
                      <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
