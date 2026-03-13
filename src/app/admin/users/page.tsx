"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Users, ArrowRight, Gift, Tag, ChevronDown, X, Search, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useScripts } from "@/lib/scriptsContext";
import Link from "next/link";

interface UserBenefit {
  id: string;
  user_email: string;
  user_name: string | null;
  benefit_type: "coupon" | "free_script";
  coupon_code: string | null;
  script_id: string | null;
  used: boolean;
  notes: string | null;
  created_at: string;
}

export default function AdminUsersPage() {
  const { scripts } = useScripts();
  const [benefits, setBenefits] = useState<UserBenefit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [benefitType, setBenefitType] = useState<"coupon" | "free_script">("free_script");
  const [couponCode, setCouponCode] = useState("");
  const [scriptId, setScriptId] = useState("");
  const [notes, setNotes] = useState("");

  // Script dropdown
  const [scriptDropdownOpen, setScriptDropdownOpen] = useState(false);
  const [scriptSearch, setScriptSearch] = useState("");
  const scriptDropdownRef = useRef<HTMLDivElement>(null);

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

  const fetchBenefits = async () => {
    const { data } = await supabase
      .from("user_benefits")
      .select("*")
      .order("created_at", { ascending: false });
    setBenefits(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchBenefits();
  }, []);

  const resetForm = () => {
    setUserEmail("");
    setUserName("");
    setBenefitType("free_script");
    setCouponCode("");
    setScriptId("");
    setNotes("");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    if (benefitType === "coupon" && !couponCode.trim()) {
      setError("יש להזין קוד קופון");
      setSaving(false);
      return;
    }
    if (benefitType === "free_script" && !scriptId) {
      setError("יש לבחור סקריפט");
      setSaving(false);
      return;
    }

    const { error: err } = await supabase.from("user_benefits").insert({
      user_email: userEmail.trim().toLowerCase(),
      user_name: userName.trim() || null,
      benefit_type: benefitType,
      coupon_code: benefitType === "coupon" ? couponCode.toUpperCase().trim() : null,
      script_id: benefitType === "free_script" ? scriptId : null,
      notes: notes.trim() || null,
    });

    if (err) {
      setError(err.message);
    } else {
      resetForm();
      setShowForm(false);
      fetchBenefits();
    }
    setSaving(false);
  };

  const deleteBenefit = async (id: string) => {
    await supabase.from("user_benefits").delete().eq("id", id);
    fetchBenefits();
  };

  const toggleUsed = async (id: string, used: boolean) => {
    await supabase.from("user_benefits").update({ used: !used }).eq("id", id);
    fetchBenefits();
  };

  const getScriptName = (id: string) => {
    const s = scripts.find((s) => s.id === id);
    return s?.displayName || id;
  };

  const filteredBenefits = benefits.filter(
    (b) =>
      b.user_email.includes(searchQuery.toLowerCase()) ||
      (b.user_name && b.user_name.includes(searchQuery)) ||
      (b.coupon_code && b.coupon_code.includes(searchQuery.toUpperCase()))
  );

  // Group by user
  const userGroups = filteredBenefits.reduce<Record<string, UserBenefit[]>>((acc, b) => {
    const key = b.user_email;
    if (!acc[key]) acc[key] = [];
    acc[key].push(b);
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-8 py-16">
      <div className="flex items-center justify-between mb-10">
        <div>
          <Link href="/admin" className="text-xs text-t-ghost hover:text-t-dim transition-colors mb-2 inline-flex items-center gap-1">
            <ArrowRight className="w-3 h-3" strokeWidth={1.5} />
            ניהול
          </Link>
          <h1 className="text-2xl font-bold text-t-primary tracking-tight">ניהול משתמשים</h1>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 bg-[#d4920a] hover:bg-[#e5a312] text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer"
        >
          <Plus className="w-4 h-4" strokeWidth={1.5} />
          הוסף הטבה
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: "משתמשים", value: Object.keys(userGroups).length.toString() },
          { label: "הטבות פעילות", value: benefits.filter((b) => !b.used).length.toString() },
          { label: "הטבות מומשו", value: benefits.filter((b) => b.used).length.toString() },
        ].map((stat) => (
          <div key={stat.label} className="bg-s-base border border-b-subtle rounded-xl p-5">
            <div className="text-[11px] text-t-faint uppercase tracking-wider">{stat.label}</div>
            <div className="text-xl font-semibold text-t-primary mt-1 tracking-tight">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-t-ghost" strokeWidth={1.5} />
        <input
          type="text"
          placeholder="חיפוש לפי אימייל, שם או קוד קופון..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-s-base border border-b-subtle rounded-xl pr-10 pl-4 py-3 text-sm text-t-primary placeholder-t-ghost focus:outline-none focus:border-[#d4920a]/30 transition-colors"
        />
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-s-base border border-b-subtle rounded-xl p-6 mb-8 space-y-4">
          <h2 className="text-xs font-medium text-t-dim uppercase tracking-wider">הוספת הטבה למשתמש</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-t-faint mb-1.5">אימייל המשתמש</label>
              <input
                type="email"
                required
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full bg-s-input border border-b-medium rounded-lg px-4 py-2.5 text-sm text-t-primary placeholder-t-ghost focus:outline-none focus:border-[#d4920a]/30 transition-colors"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-xs text-t-faint mb-1.5">שם המשתמש (אופציונלי)</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="שם מלא"
                className="w-full bg-s-input border border-b-medium rounded-lg px-4 py-2.5 text-sm text-t-primary placeholder-t-ghost focus:outline-none focus:border-[#d4920a]/30 transition-colors"
              />
            </div>
          </div>

          {/* Benefit Type */}
          <div>
            <label className="block text-xs text-t-faint mb-1.5">סוג הטבה</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setBenefitType("free_script")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer border ${
                  benefitType === "free_script"
                    ? "bg-[#d4920a]/15 border-[#d4920a]/30 text-[#e5a312]"
                    : "bg-s-input border-b-medium text-t-dim hover:text-t-secondary"
                }`}
              >
                <Gift className="w-4 h-4" strokeWidth={1.5} />
                סקריפט חינם
              </button>
              <button
                type="button"
                onClick={() => setBenefitType("coupon")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer border ${
                  benefitType === "coupon"
                    ? "bg-[#d4920a]/15 border-[#d4920a]/30 text-[#e5a312]"
                    : "bg-s-input border-b-medium text-t-dim hover:text-t-secondary"
                }`}
              >
                <Tag className="w-4 h-4" strokeWidth={1.5} />
                קוד קופון
              </button>
            </div>
          </div>

          {/* Benefit Details */}
          {benefitType === "coupon" ? (
            <div>
              <label className="block text-xs text-t-faint mb-1.5">קוד קופון</label>
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="WELCOME10"
                className="w-full bg-s-input border border-b-medium rounded-lg px-4 py-2.5 text-sm text-t-primary placeholder-t-ghost focus:outline-none focus:border-[#d4920a]/30 transition-colors"
                dir="ltr"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs text-t-faint mb-1.5">בחר סקריפט</label>
              <div className="relative" ref={scriptDropdownRef}>
                <button
                  type="button"
                  onClick={() => { setScriptDropdownOpen(!scriptDropdownOpen); setScriptSearch(""); }}
                  className={`w-full flex items-center justify-between bg-s-input border rounded-lg px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                    scriptDropdownOpen ? "border-[#d4920a]/30" : "border-b-medium"
                  }`}
                >
                  <span className={scriptId ? "text-t-primary" : "text-t-ghost"}>
                    {scriptId ? getScriptName(scriptId) : "בחר סקריפט..."}
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
                        placeholder="חיפוש סקריפט..."
                        className="w-full bg-s-input border border-b-medium rounded-lg px-3 py-2 text-xs text-t-primary placeholder-t-ghost focus:outline-none focus:border-[#d4920a]/30 transition-colors"
                        autoFocus
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {scripts
                        .filter((s) => s.price !== "free")
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
          )}

          <div>
            <label className="block text-xs text-t-faint mb-1.5">הערות (אופציונלי)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="סיבה להטבה, תנאים מיוחדים..."
              className="w-full bg-s-input border border-b-medium rounded-lg px-4 py-2.5 text-sm text-t-primary placeholder-t-ghost focus:outline-none focus:border-[#d4920a]/30 transition-colors"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-[#d4920a] hover:bg-[#e5a312] disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer"
            >
              {saving ? "שומר..." : "הוסף הטבה"}
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

      {/* Users List */}
      {loading ? (
        <div className="text-center py-12 text-sm text-t-dim">טוען...</div>
      ) : Object.keys(userGroups).length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-8 h-8 text-t-ghost mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-sm text-t-dim">{searchQuery ? "לא נמצאו תוצאות" : "אין הטבות למשתמשים עדיין"}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(userGroups).map(([email, userBenefits]) => (
            <div key={email} className="bg-s-base border border-b-subtle rounded-xl overflow-hidden">
              {/* User header */}
              <div className="px-5 py-4 border-b border-b-subtle flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-t-secondary">
                    {userBenefits[0].user_name || email}
                  </div>
                  {userBenefits[0].user_name && (
                    <div className="text-xs text-t-ghost font-mono" dir="ltr">{email}</div>
                  )}
                </div>
                <div className="text-xs text-t-faint">
                  {userBenefits.length} {userBenefits.length === 1 ? "הטבה" : "הטבות"}
                </div>
              </div>

              {/* Benefits list */}
              <div className="divide-y divide-b-subtle">
                {userBenefits.map((b) => (
                  <div
                    key={b.id}
                    className={`px-5 py-3.5 flex items-center justify-between ${b.used ? "opacity-50" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      {b.benefit_type === "free_script" ? (
                        <Gift className="w-4 h-4 text-[#e5a312]" strokeWidth={1.5} />
                      ) : (
                        <Tag className="w-4 h-4 text-[#e5a312]" strokeWidth={1.5} />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-t-muted">
                            {b.benefit_type === "free_script"
                              ? `סקריפט חינם: ${b.script_id ? getScriptName(b.script_id) : "לא ידוע"}`
                              : `קופון: ${b.coupon_code}`}
                          </span>
                          {b.used && (
                            <span className="text-[10px] bg-green-400/10 text-green-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Check className="w-2.5 h-2.5" strokeWidth={2} />
                              מומש
                            </span>
                          )}
                        </div>
                        {b.notes && (
                          <div className="text-[11px] text-t-ghost mt-0.5">{b.notes}</div>
                        )}
                        <div className="text-[11px] text-t-ghost mt-0.5">
                          {new Date(b.created_at).toLocaleDateString("he-IL")}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleUsed(b.id, b.used)}
                        className={`text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                          b.used
                            ? "bg-s-hover text-t-dim hover:text-t-secondary"
                            : "bg-[#d4920a]/10 text-[#e5a312] hover:bg-[#d4920a]/20"
                        }`}
                      >
                        {b.used ? "בטל מימוש" : "סמן כמומש"}
                      </button>
                      <button
                        onClick={() => deleteBenefit(b.id)}
                        className="text-t-ghost hover:text-red-400 transition-colors cursor-pointer p-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
