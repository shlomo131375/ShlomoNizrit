"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Tag, ArrowRight, Pencil, ChevronDown, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useScripts } from "@/lib/scriptsContext";
import Link from "next/link";

interface Coupon {
  id: string;
  code: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  min_order: number;
  max_uses: number | null;
  used_count: number;
  active: boolean;
  script_id: string | null;
  expires_at: string | null;
  created_at: string;
}

export default function AdminCouponsPage() {
  const { scripts } = useScripts();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percent" | "fixed">("percent");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [scriptId, setScriptId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [scriptDropdownOpen, setScriptDropdownOpen] = useState(false);
  const [scriptSearch, setScriptSearch] = useState("");
  const scriptDropdownRef = useRef<HTMLDivElement>(null);

  const paidScripts = scripts.filter((s) => s.price !== "free");

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (scriptDropdownRef.current && !scriptDropdownRef.current.contains(e.target as Node)) {
        setScriptDropdownOpen(false);
        setScriptSearch("");
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const fetchCoupons = async () => {
    const { data } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });
    setCoupons(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const resetForm = () => {
    setCode("");
    setDiscountType("percent");
    setDiscountValue("");
    setMinOrder("");
    setMaxUses("");
    setExpiresAt("");
    setScriptId("");
    setEditingId(null);
    setError("");
  };

  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (c: Coupon) => {
    setEditingId(c.id);
    setCode(c.code);
    setDiscountType(c.discount_type);
    setDiscountValue(String(c.discount_value));
    setMinOrder(c.min_order ? String(c.min_order) : "");
    setMaxUses(c.max_uses ? String(c.max_uses) : "");
    setExpiresAt(c.expires_at ? c.expires_at.split("T")[0] : "");
    setScriptId(c.script_id || "");
    setError("");
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    const payload = {
      code: code.toUpperCase().trim(),
      discount_type: discountType,
      discount_value: Number(discountValue),
      min_order: minOrder ? Number(minOrder) : 0,
      max_uses: maxUses ? Number(maxUses) : null,
      expires_at: expiresAt || null,
      script_id: scriptId || null,
    };

    if (editingId) {
      const { error: err } = await supabase
        .from("coupons")
        .update(payload)
        .eq("id", editingId);
      if (err) {
        setError(err.message.includes("duplicate") ? "קוד קופון כבר קיים" : err.message);
      } else {
        resetForm();
        setShowForm(false);
        fetchCoupons();
      }
    } else {
      const { error: err } = await supabase.from("coupons").insert(payload);
      if (err) {
        setError(err.message.includes("duplicate") ? "קוד קופון כבר קיים" : err.message);
      } else {
        resetForm();
        setShowForm(false);
        fetchCoupons();
      }
    }
    setSaving(false);
  };

  const toggleActive = async (id: string, active: boolean) => {
    await supabase.from("coupons").update({ active: !active }).eq("id", id);
    fetchCoupons();
  };

  const deleteCoupon = async (id: string) => {
    await supabase.from("coupons").delete().eq("id", id);
    fetchCoupons();
  };

  const getScriptName = (id: string) => {
    const s = scripts.find((s) => s.id === id);
    return s?.displayName || id;
  };

  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-8 py-16">
      <div className="flex items-center justify-between mb-10">
        <div>
          <Link href="/admin" className="text-xs text-t-ghost hover:text-t-dim transition-colors mb-2 inline-flex items-center gap-1">
            <ArrowRight className="w-3 h-3" strokeWidth={1.5} />
            ניהול
          </Link>
          <h1 className="text-2xl font-bold text-t-primary tracking-tight">קופונים</h1>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#d4920a] hover:bg-[#e5a312] text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer"
        >
          <Plus className="w-4 h-4" strokeWidth={1.5} />
          קופון חדש
        </button>
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-s-base border border-b-subtle rounded-xl p-6 mb-8 space-y-4">
          <h2 className="text-xs font-medium text-t-dim uppercase tracking-wider">
            {editingId ? "עריכת קופון" : "קופון חדש"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-t-faint mb-1.5">קוד קופון</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="WELCOME10"
                className="w-full bg-s-input border border-b-medium rounded-lg px-4 py-2.5 text-sm text-t-primary placeholder-t-ghost focus:outline-none focus:border-[#d4920a]/30 transition-colors"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-xs text-t-faint mb-1.5">סוג הנחה</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDiscountType("percent")}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer border ${
                    discountType === "percent"
                      ? "bg-[#d4920a]/15 border-[#d4920a]/30 text-[#e5a312]"
                      : "bg-s-input border-b-medium text-t-dim hover:text-t-secondary"
                  }`}
                >
                  אחוז (%)
                </button>
                <button
                  type="button"
                  onClick={() => setDiscountType("fixed")}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer border ${
                    discountType === "fixed"
                      ? "bg-[#d4920a]/15 border-[#d4920a]/30 text-[#e5a312]"
                      : "bg-s-input border-b-medium text-t-dim hover:text-t-secondary"
                  }`}
                >
                  סכום קבוע (₪)
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs text-t-faint mb-1.5">
                {discountType === "percent" ? "אחוז הנחה" : "סכום הנחה (₪)"}
              </label>
              <input
                type="number"
                required
                min="1"
                max={discountType === "percent" ? "100" : undefined}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={discountType === "percent" ? "10" : "50"}
                className="w-full bg-s-input border border-b-medium rounded-lg px-4 py-2.5 text-sm text-t-primary placeholder-t-ghost focus:outline-none focus:border-[#d4920a]/30 transition-colors"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-xs text-t-faint mb-1.5">מוצר ספציפי</label>
              <div className="relative" ref={scriptDropdownRef}>
                <button
                  type="button"
                  onClick={() => { setScriptDropdownOpen(!scriptDropdownOpen); setScriptSearch(""); }}
                  className={`w-full flex items-center justify-between bg-s-input border rounded-lg px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                    scriptDropdownOpen ? "border-[#d4920a]/30" : "border-b-medium"
                  }`}
                >
                  <span className={scriptId ? "text-t-primary" : "text-t-ghost"}>
                    {scriptId ? getScriptName(scriptId) : "כל המוצרים"}
                  </span>
                  <div className="flex items-center gap-1">
                    {scriptId && (
                      <span
                        onClick={(e) => { e.stopPropagation(); setScriptId(""); }}
                        className="text-t-ghost hover:text-red-400 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </span>
                    )}
                    <ChevronDown className={`w-3.5 h-3.5 text-t-ghost transition-transform duration-200 ${scriptDropdownOpen ? "rotate-180" : ""}`} strokeWidth={1.5} />
                  </div>
                </button>

                {scriptDropdownOpen && (
                  <div className="absolute z-50 top-full mt-1.5 w-full bg-s-dropdown border border-b-subtle rounded-xl shadow-lg overflow-hidden">
                    <div className="p-2 border-b border-b-subtle">
                      <input
                        type="text"
                        value={scriptSearch}
                        onChange={(e) => setScriptSearch(e.target.value)}
                        placeholder="חיפוש מוצר..."
                        className="w-full bg-s-input border border-b-medium rounded-lg px-3 py-2 text-xs text-t-primary placeholder-t-ghost focus:outline-none focus:border-[#d4920a]/30 transition-colors"
                        autoFocus
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      <button
                        type="button"
                        onClick={() => { setScriptId(""); setScriptDropdownOpen(false); setScriptSearch(""); }}
                        className={`w-full text-right px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                          !scriptId ? "text-[#e5a312] bg-[#d4920a]/10" : "text-t-muted hover:bg-s-hover"
                        }`}
                      >
                        כל המוצרים
                      </button>
                      {paidScripts
                        .filter((s) => !scriptSearch || s.displayName.includes(scriptSearch))
                        .map((s) => (
                        <button
                          type="button"
                          key={s.id}
                          onClick={() => { setScriptId(s.id); setScriptDropdownOpen(false); setScriptSearch(""); }}
                          className={`w-full text-right px-4 py-2.5 text-sm transition-colors cursor-pointer flex items-center justify-between ${
                            scriptId === s.id ? "text-[#e5a312] bg-[#d4920a]/10" : "text-t-muted hover:bg-s-hover"
                          }`}
                        >
                          <span>{s.displayName}</span>
                          <span className="text-xs text-t-ghost">₪{s.price}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-xs text-t-faint mb-1.5">מינימום הזמנה (₪)</label>
              <input
                type="number"
                min="0"
                value={minOrder}
                onChange={(e) => setMinOrder(e.target.value)}
                placeholder="0"
                className="w-full bg-s-input border border-b-medium rounded-lg px-4 py-2.5 text-sm text-t-primary placeholder-t-ghost focus:outline-none focus:border-[#d4920a]/30 transition-colors"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-xs text-t-faint mb-1.5">מקסימום שימושים</label>
              <input
                type="number"
                min="1"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                placeholder="ללא הגבלה"
                className="w-full bg-s-input border border-b-medium rounded-lg px-4 py-2.5 text-sm text-t-primary placeholder-t-ghost focus:outline-none focus:border-[#d4920a]/30 transition-colors"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-xs text-t-faint mb-1.5">תאריך תפוגה</label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full bg-s-input border border-b-medium rounded-lg px-4 py-2.5 text-sm text-t-primary placeholder-t-ghost focus:outline-none focus:border-[#d4920a]/30 transition-colors"
                dir="ltr"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-[#d4920a] hover:bg-[#e5a312] disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer"
            >
              {saving ? "שומר..." : editingId ? "שמור שינויים" : "צור קופון"}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); resetForm(); }}
              className="border border-b-medium text-t-dim hover:text-t-secondary px-6 py-2.5 rounded-xl text-sm transition-all duration-300 cursor-pointer"
            >
              ביטול
            </button>
          </div>
        </form>
      )}

      {/* Coupons List */}
      {loading ? (
        <div className="text-center py-12 text-sm text-t-dim">טוען...</div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-16">
          <Tag className="w-8 h-8 text-t-ghost mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-sm text-t-dim">אין קופונים עדיין</p>
        </div>
      ) : (
        <div className="space-y-3">
          {coupons.map((c) => (
            <div
              key={c.id}
              className={`bg-s-base border border-b-subtle rounded-xl p-5 flex items-center justify-between transition-opacity ${!c.active ? "opacity-50" : ""}`}
            >
              <div className="flex items-center gap-4">
                <Tag className="w-4 h-4 text-[#e5a312]" strokeWidth={1.5} />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-mono font-semibold text-t-secondary" dir="ltr">{c.code}</span>
                    <span className="text-xs text-[#e5a312]">
                      {c.discount_type === "percent" ? `${c.discount_value}%` : `₪${c.discount_value}`}
                    </span>
                    {c.script_id && (
                      <span className="text-[10px] bg-[#d4920a]/10 text-[#e5a312]/80 px-2 py-0.5 rounded-full">
                        {getScriptName(c.script_id)}
                      </span>
                    )}
                    {!c.active && (
                      <span className="text-[10px] bg-red-400/10 text-red-400 px-2 py-0.5 rounded-full">לא פעיל</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-t-ghost">
                    {c.min_order > 0 && <span>מינימום ₪{c.min_order}</span>}
                    <span>שימושים: {c.used_count}{c.max_uses ? `/${c.max_uses}` : ""}</span>
                    {c.expires_at && (
                      <span>תפוגה: {new Date(c.expires_at).toLocaleDateString("he-IL")}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEdit(c)}
                  className="text-t-ghost hover:text-[#e5a312] transition-colors cursor-pointer p-1.5"
                  title="ערוך"
                >
                  <Pencil className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => toggleActive(c.id, c.active)}
                  className={`text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    c.active
                      ? "bg-[#d4920a]/10 text-[#e5a312] hover:bg-[#d4920a]/20"
                      : "bg-s-hover text-t-dim hover:text-t-secondary"
                  }`}
                >
                  {c.active ? "השבת" : "הפעל"}
                </button>
                <button
                  onClick={() => deleteCoupon(c.id)}
                  className="text-t-ghost hover:text-red-400 transition-colors cursor-pointer p-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
