"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Users, ArrowRight, Gift, Tag, ChevronDown, X, Search, Check, Mail, Calendar, LogIn, MapPin, Phone, UserPlus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useScripts } from "@/lib/scriptsContext";
import Link from "next/link";

interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar: string;
  country: string;
  city: string;
  phone: string;
  provider: string;
  created_at: string;
  last_sign_in: string | null;
}

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
  const [authUsers, setAuthUsers] = useState<AuthUser[]>([]);
  const [benefits, setBenefits] = useState<UserBenefit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Which user is getting a benefit
  const [activeUserEmail, setActiveUserEmail] = useState<string | null>(null);
  const [activeUserName, setActiveUserName] = useState<string>("");

  // Benefit form state
  const [benefitType, setBenefitType] = useState<"coupon" | "free_script">("free_script");
  const [couponCode, setCouponCode] = useState("");
  const [scriptId, setScriptId] = useState("");
  const [notes, setNotes] = useState("");

  // Script dropdown
  const [scriptDropdownOpen, setScriptDropdownOpen] = useState(false);
  const [scriptSearch, setScriptSearch] = useState("");
  const scriptDropdownRef = useRef<HTMLDivElement>(null);

  // Add user form
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ email: "", password: "", name: "", country: "", city: "", phone: "" });
  const [addingUser, setAddingUser] = useState(false);
  const [addUserError, setAddUserError] = useState("");

  // Delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const getAuthHeaders = async (): Promise<Record<string, string>> => {
    const { data: { session } } = await supabase.auth.getSession();
    return session ? { Authorization: `Bearer ${session.access_token}` } : {};
  };

  const fetchAuthUsers = async () => {
    const headers = await getAuthHeaders();
    const res = await fetch("/api/admin/users", { headers });
    if (res.ok) {
      const data = await res.json();
      setAuthUsers(data.users || []);
    }
  };

  const fetchBenefits = async () => {
    const { data } = await supabase
      .from("user_benefits")
      .select("*")
      .order("created_at", { ascending: false });
    setBenefits(data || []);
  };

  useEffect(() => {
    Promise.all([fetchAuthUsers(), fetchBenefits()]).then(() => setLoading(false));
  }, []);

  const resetForm = () => {
    setBenefitType("free_script");
    setCouponCode("");
    setScriptId("");
    setNotes("");
    setError("");
  };

  const openBenefitForm = (email: string, name: string) => {
    resetForm();
    setActiveUserEmail(email);
    setActiveUserName(name);
  };

  const closeBenefitForm = () => {
    setActiveUserEmail(null);
    setActiveUserName("");
    resetForm();
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
      user_email: activeUserEmail!.toLowerCase(),
      user_name: activeUserName || null,
      benefit_type: benefitType,
      coupon_code: benefitType === "coupon" ? couponCode.toUpperCase().trim() : null,
      script_id: benefitType === "free_script" ? scriptId : null,
      notes: notes.trim() || null,
    });

    if (err) {
      setError(err.message);
    } else {
      closeBenefitForm();
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

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingUser(true);
    setAddUserError("");

    const headers = await getAuthHeaders();
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });

    const data = await res.json();
    if (!res.ok) {
      setAddUserError(data.error);
    } else {
      setNewUser({ email: "", password: "", name: "", country: "", city: "", phone: "" });
      setShowAddUser(false);
      fetchAuthUsers();
    }
    setAddingUser(false);
  };

  const handleDeleteUser = async (userId: string) => {
    setDeletingId(userId);
    const headers = await getAuthHeaders();
    const res = await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    if (res.ok) {
      setAuthUsers((prev) => prev.filter((u) => u.id !== userId));
    }
    setDeleteConfirmId(null);
    setDeletingId(null);
  };

  const getScriptName = (id: string) => {
    const s = scripts.find((s) => s.id === id);
    return s?.displayName || id;
  };

  const getUserBenefits = (email: string) => {
    return benefits.filter((b) => b.user_email === email.toLowerCase());
  };

  const filteredUsers = authUsers.filter(
    (u) =>
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalBenefits = benefits.length;
  const activeBenefits = benefits.filter((b) => !b.used).length;
  const usedBenefits = benefits.filter((b) => b.used).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
      <div className="flex items-center justify-between mb-6 sm:mb-10">
        <div>
          <Link href="/admin" className="text-xs text-t-ghost hover:text-t-dim transition-colors mb-2 inline-flex items-center gap-1">
            <ArrowRight className="w-3 h-3" strokeWidth={1.5} />
            ניהול
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-t-primary tracking-tight">ניהול משתמשים</h1>
        </div>
        <button
          onClick={() => { setShowAddUser(!showAddUser); setAddUserError(""); }}
          className="flex items-center gap-1.5 bg-[#d4920a] hover:bg-[#e5a312] text-white px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" strokeWidth={1.5} />
          <span className="hidden sm:inline">הוסף משתמש</span>
          <span className="sm:hidden">הוסף</span>
        </button>
      </div>

      {/* Add User Form */}
      {showAddUser && (
        <form onSubmit={handleAddUser} className="bg-s-base border border-b-subtle rounded-xl p-4 sm:p-5 mb-6 space-y-3">
          <h2 className="text-xs font-medium text-t-dim uppercase tracking-wider">הוספת משתמש חדש</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              placeholder="שם מלא"
              className="w-full bg-s-input border border-b-medium rounded-lg px-4 py-2.5 text-sm text-t-primary placeholder-t-ghost focus:outline-none focus:border-[#d4920a]/30 transition-colors"
            />
            <input
              type="email"
              required
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              placeholder="אימייל"
              className="w-full bg-s-input border border-b-medium rounded-lg px-4 py-2.5 text-sm text-t-primary placeholder-t-ghost focus:outline-none focus:border-[#d4920a]/30 transition-colors"
              dir="ltr"
            />
            <input
              type="password"
              required
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              placeholder="סיסמה (מינימום 6)"
              className="w-full bg-s-input border border-b-medium rounded-lg px-4 py-2.5 text-sm text-t-primary placeholder-t-ghost focus:outline-none focus:border-[#d4920a]/30 transition-colors"
              dir="ltr"
              minLength={6}
            />
            <input
              type="tel"
              value={newUser.phone}
              onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
              placeholder="טלפון"
              className="w-full bg-s-input border border-b-medium rounded-lg px-4 py-2.5 text-sm text-t-primary placeholder-t-ghost focus:outline-none focus:border-[#d4920a]/30 transition-colors"
              dir="ltr"
            />
            <input
              type="text"
              value={newUser.country}
              onChange={(e) => setNewUser({ ...newUser, country: e.target.value })}
              placeholder="מדינה"
              className="w-full bg-s-input border border-b-medium rounded-lg px-4 py-2.5 text-sm text-t-primary placeholder-t-ghost focus:outline-none focus:border-[#d4920a]/30 transition-colors"
            />
            <input
              type="text"
              value={newUser.city}
              onChange={(e) => setNewUser({ ...newUser, city: e.target.value })}
              placeholder="עיר"
              className="w-full bg-s-input border border-b-medium rounded-lg px-4 py-2.5 text-sm text-t-primary placeholder-t-ghost focus:outline-none focus:border-[#d4920a]/30 transition-colors"
            />
          </div>
          {addUserError && <p className="text-xs text-red-400">{addUserError}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={addingUser}
              className="bg-[#d4920a] hover:bg-[#e5a312] disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer"
            >
              {addingUser ? "יוצר..." : "צור משתמש"}
            </button>
            <button
              type="button"
              onClick={() => setShowAddUser(false)}
              className="border border-b-medium text-t-dim hover:text-t-secondary px-5 py-2 rounded-lg text-sm transition-all duration-300 cursor-pointer"
            >
              ביטול
            </button>
          </div>
        </form>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-6 sm:mb-8">
        {[
          { label: "משתמשים רשומים", value: authUsers.length.toString() },
          { label: "סה״כ הטבות", value: totalBenefits.toString() },
          { label: "הטבות פעילות", value: activeBenefits.toString() },
          { label: "הטבות מומשו", value: usedBenefits.toString() },
        ].map((stat) => (
          <div key={stat.label} className="bg-s-base border border-b-subtle rounded-xl p-3 sm:p-5">
            <div className="text-[10px] sm:text-[11px] text-t-faint uppercase tracking-wider">{stat.label}</div>
            <div className="text-lg sm:text-xl font-semibold text-t-primary mt-1 tracking-tight">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4 sm:mb-6">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-t-ghost" strokeWidth={1.5} />
        <input
          type="text"
          placeholder="חיפוש לפי אימייל או שם..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-s-base border border-b-subtle rounded-xl pr-10 pl-4 py-3 text-sm text-t-primary placeholder-t-ghost focus:outline-none focus:border-[#d4920a]/30 transition-colors"
        />
      </div>

      {/* Users List */}
      {loading ? (
        <div className="text-center py-12 text-sm text-t-dim">טוען...</div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-8 h-8 text-t-ghost mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-sm text-t-dim">{searchQuery ? "לא נמצאו תוצאות" : "אין משתמשים רשומים"}</p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {filteredUsers.map((user) => {
            const userBenefits = getUserBenefits(user.email);
            const isFormOpen = activeUserEmail === user.email;
            const isDeleteConfirm = deleteConfirmId === user.id;

            return (
              <div key={user.id} className="bg-s-base border border-b-subtle rounded-xl overflow-hidden">
                {/* User header */}
                <div className="px-4 sm:px-5 py-3 sm:py-4">
                  <div className="flex items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {user.avatar ? (
                        <img src={user.avatar} alt="" className="w-9 h-9 rounded-full flex-shrink-0" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-[#d4920a]/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-medium text-[#e5a312]">
                            {(user.name || user.email || "U").charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-t-secondary truncate">
                          {user.name || user.email}
                        </div>
                        {/* Desktop info row */}
                        <div className="hidden sm:flex items-center gap-3 mt-0.5 flex-wrap">
                          <span className="text-xs text-t-ghost font-mono flex items-center gap-1" dir="ltr">
                            <Mail className="w-3 h-3" strokeWidth={1.5} />
                            {user.email}
                          </span>
                          {user.phone && (
                            <span className="text-[10px] text-t-ghost flex items-center gap-1">
                              <Phone className="w-3 h-3" strokeWidth={1.5} />
                              {user.phone}
                            </span>
                          )}
                          <span className="text-[10px] text-t-ghost flex items-center gap-1">
                            <Calendar className="w-3 h-3" strokeWidth={1.5} />
                            {new Date(user.created_at).toLocaleDateString("he-IL")}
                          </span>
                          {user.last_sign_in && (
                            <span className="text-[10px] text-t-ghost flex items-center gap-1">
                              <LogIn className="w-3 h-3" strokeWidth={1.5} />
                              {new Date(user.last_sign_in).toLocaleDateString("he-IL")}
                            </span>
                          )}
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                            user.provider === "google" ? "bg-blue-400/10 text-blue-400" : "bg-s-hover text-t-ghost"
                          }`}>
                            {user.provider === "google" ? "Google" : "Email"}
                          </span>
                          {(user.country || user.city) && (
                            <span className="text-[10px] text-t-ghost flex items-center gap-1">
                              <MapPin className="w-3 h-3" strokeWidth={1.5} />
                              {[user.city, user.country].filter(Boolean).join(", ")}
                            </span>
                          )}
                        </div>
                        {/* Mobile info */}
                        <div className="sm:hidden text-[11px] text-t-ghost mt-0.5" dir="ltr">{user.email}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {userBenefits.length > 0 && (
                        <span className="text-[10px] sm:text-xs text-t-faint hidden sm:inline">
                          {userBenefits.length} {userBenefits.length === 1 ? "הטבה" : "הטבות"}
                        </span>
                      )}
                      <button
                        onClick={() => isFormOpen ? closeBenefitForm() : openBenefitForm(user.email, user.name)}
                        className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-medium transition-all duration-300 cursor-pointer ${
                          isFormOpen
                            ? "bg-red-400/10 text-red-400 hover:bg-red-400/20"
                            : "bg-[#d4920a]/10 text-[#e5a312] hover:bg-[#d4920a]/20"
                        }`}
                      >
                        {isFormOpen ? (
                          <><X className="w-3 h-3" strokeWidth={1.5} /> <span className="hidden sm:inline">ביטול</span></>
                        ) : (
                          <><Plus className="w-3 h-3" strokeWidth={1.5} /> <span className="hidden sm:inline">הטבה</span></>
                        )}
                      </button>
                      {/* Delete user button */}
                      {isDeleteConfirm ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={deletingId === user.id}
                            className="text-[10px] sm:text-xs text-red-400 hover:text-red-300 transition-colors cursor-pointer px-1.5 py-1"
                          >
                            {deletingId === user.id ? "..." : "אישור"}
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="text-[10px] sm:text-xs text-t-ghost hover:text-t-dim transition-colors cursor-pointer px-1.5 py-1"
                          >
                            ביטול
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(user.id)}
                          className="text-t-ghost hover:text-red-400 transition-colors cursor-pointer p-1.5"
                          title="מחק משתמש"
                        >
                          <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Mobile extra info */}
                  <div className="sm:hidden flex items-center gap-2 mt-2 flex-wrap">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      user.provider === "google" ? "bg-blue-400/10 text-blue-400" : "bg-s-hover text-t-ghost"
                    }`}>
                      {user.provider === "google" ? "Google" : "Email"}
                    </span>
                    <span className="text-[10px] text-t-ghost">
                      {new Date(user.created_at).toLocaleDateString("he-IL")}
                    </span>
                    {(user.country || user.city) && (
                      <span className="text-[10px] text-t-ghost">
                        {[user.city, user.country].filter(Boolean).join(", ")}
                      </span>
                    )}
                    {userBenefits.length > 0 && (
                      <span className="text-[10px] text-t-faint">
                        {userBenefits.length} הטבות
                      </span>
                    )}
                  </div>
                </div>

                {/* Benefit form for this user */}
                {isFormOpen && (
                  <form onSubmit={handleSubmit} className="px-4 sm:px-5 py-4 border-t border-b-subtle bg-s-hover/30 space-y-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setBenefitType("free_script")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all duration-300 cursor-pointer border ${
                          benefitType === "free_script"
                            ? "bg-[#d4920a]/15 border-[#d4920a]/30 text-[#e5a312]"
                            : "bg-s-input border-b-medium text-t-dim hover:text-t-secondary"
                        }`}
                      >
                        <Gift className="w-3.5 h-3.5" strokeWidth={1.5} />
                        סקריפט חינם
                      </button>
                      <button
                        type="button"
                        onClick={() => setBenefitType("coupon")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all duration-300 cursor-pointer border ${
                          benefitType === "coupon"
                            ? "bg-[#d4920a]/15 border-[#d4920a]/30 text-[#e5a312]"
                            : "bg-s-input border-b-medium text-t-dim hover:text-t-secondary"
                        }`}
                      >
                        <Tag className="w-3.5 h-3.5" strokeWidth={1.5} />
                        קוד קופון
                      </button>
                    </div>

                    {benefitType === "coupon" ? (
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="קוד קופון (לדוגמה: WELCOME10)"
                        className="w-full bg-s-input border border-b-medium rounded-lg px-4 py-2.5 text-sm text-t-primary placeholder-t-ghost focus:outline-none focus:border-[#d4920a]/30 transition-colors"
                        dir="ltr"
                      />
                    ) : (
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
                    )}

                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="הערות (אופציונלי)"
                      className="w-full bg-s-input border border-b-medium rounded-lg px-4 py-2.5 text-sm text-t-primary placeholder-t-ghost focus:outline-none focus:border-[#d4920a]/30 transition-colors"
                    />

                    {error && <p className="text-xs text-red-400">{error}</p>}

                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-[#d4920a] hover:bg-[#e5a312] disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer"
                    >
                      {saving ? "שומר..." : "הוסף הטבה"}
                    </button>
                  </form>
                )}

                {/* User benefits */}
                {userBenefits.length > 0 && (
                  <div className="divide-y divide-b-subtle border-t border-b-subtle">
                    {userBenefits.map((b) => (
                      <div
                        key={b.id}
                        className={`px-4 sm:px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${b.used ? "opacity-50" : ""}`}
                      >
                        <div className="flex items-center gap-3">
                          {b.benefit_type === "free_script" ? (
                            <Gift className="w-4 h-4 text-[#e5a312] flex-shrink-0" strokeWidth={1.5} />
                          ) : (
                            <Tag className="w-4 h-4 text-[#e5a312] flex-shrink-0" strokeWidth={1.5} />
                          )}
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
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
                            {b.notes && <div className="text-[11px] text-t-ghost mt-0.5">{b.notes}</div>}
                            <div className="text-[11px] text-t-ghost mt-0.5">
                              {new Date(b.created_at).toLocaleDateString("he-IL")}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
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
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
