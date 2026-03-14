"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Eye, Tag, Package, ShoppingBag, Users, Wrench, Moon } from "lucide-react";
import { useScripts } from "@/lib/scriptsContext";
import { useAuth } from "@/lib/authContext";
import Link from "next/link";

export default function AdminPage() {
  const { scripts, formatPrice } = useScripts();
  const { session } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [shabbatMode, setShabbatMode] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/site-mode")
      .then((r) => r.json())
      .then((data) => {
        setMaintenanceMode(data.maintenance_mode);
        setShabbatMode(data.shabbat_mode);
      })
      .catch(console.error);
  }, []);

  const toggleMode = useCallback(async (mode: string, enabled: boolean) => {
    setToggling(mode);
    try {
      const token = session?.access_token;
      const res = await fetch("/api/site-mode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ mode, enabled }),
      });
      if (res.ok) {
        if (mode === "maintenance_mode") setMaintenanceMode(enabled);
        if (mode === "shabbat_mode") setShabbatMode(enabled);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setToggling(null);
    }
  }, [session]);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
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
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 bg-s-base border border-b-subtle hover:border-[#d4920a]/30 rounded-xl px-5 py-3 text-sm text-t-secondary transition-all duration-300"
        >
          <ShoppingBag className="w-4 h-4 text-[#e5a312]" strokeWidth={1.5} />
          ניהול הזמנות
        </Link>
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 bg-s-base border border-b-subtle hover:border-[#d4920a]/30 rounded-xl px-5 py-3 text-sm text-t-secondary transition-all duration-300"
        >
          <Users className="w-4 h-4 text-[#e5a312]" strokeWidth={1.5} />
          ניהול משתמשים
        </Link>
      </div>

      {/* Site Mode Toggles */}
      <div className="bg-s-base border border-b-subtle rounded-xl p-6 mb-10">
        <h2 className="text-[11px] font-medium text-t-dim uppercase tracking-wider mb-4">מצב האתר</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => toggleMode("maintenance_mode", !maintenanceMode)}
            disabled={toggling === "maintenance_mode"}
            className={`flex items-center gap-3 rounded-xl px-5 py-3.5 border transition-all duration-300 cursor-pointer ${
              maintenanceMode
                ? "border-orange-500/40 bg-orange-500/10 text-orange-400"
                : "border-b-medium bg-s-input text-t-secondary hover:border-t-ghost"
            }`}
          >
            <Wrench className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-sm font-medium">
              {toggling === "maintenance_mode" ? "..." : maintenanceMode ? "תחזוקה פעילה" : "מצב תחזוקה"}
            </span>
            <div className={`w-9 h-5 rounded-full transition-colors duration-300 relative ${
              maintenanceMode ? "bg-orange-500" : "bg-s-hover"
            }`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-300 ${
                maintenanceMode ? "right-0.5" : "right-4"
              }`} />
            </div>
          </button>

          <button
            onClick={() => toggleMode("shabbat_mode", !shabbatMode)}
            disabled={toggling === "shabbat_mode"}
            className={`flex items-center gap-3 rounded-xl px-5 py-3.5 border transition-all duration-300 cursor-pointer ${
              shabbatMode
                ? "border-blue-500/40 bg-blue-500/10 text-blue-400"
                : "border-b-medium bg-s-input text-t-secondary hover:border-t-ghost"
            }`}
          >
            <Moon className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-sm font-medium">
              {toggling === "shabbat_mode" ? "..." : shabbatMode ? "שבת/חג פעיל" : "מצב שבת/חג"}
            </span>
            <div className={`w-9 h-5 rounded-full transition-colors duration-300 relative ${
              shabbatMode ? "bg-blue-500" : "bg-s-hover"
            }`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-300 ${
                shabbatMode ? "right-0.5" : "right-4"
              }`} />
            </div>
          </button>
        </div>
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
