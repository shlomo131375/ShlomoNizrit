"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Trash2, ArrowRight, Pencil, Search, Eye, ChevronDown, X, GripVertical } from "lucide-react";
import { useScripts } from "@/lib/scriptsContext";
import Link from "next/link";
import type { Script } from "@/data/scripts";

const CATEGORIES = ["עימוד", "ניווט", "ייצוא", "עיצוב"];

interface FormData {
  id: string;
  scriptName: string;
  displayName: string;
  description: string;
  category: string;
  price: string;
  isFree: boolean;
  version: string;
  downloadUrl: string;
  videoUrl: string;
}

const emptyForm: FormData = {
  id: "",
  scriptName: "",
  displayName: "",
  description: "",
  category: "עימוד",
  price: "",
  isFree: false,
  version: "1.0.1",
  downloadUrl: "",
  videoUrl: "",
};

export default function AdminScriptsPage() {
  const { scripts, addScript, updateScript, deleteScript, formatPrice, loading } = useScripts();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) {
        setCatDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
  };

  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (script: Script) => {
    setEditingId(script.id);
    setForm({
      id: script.id,
      scriptName: script.scriptName,
      displayName: script.displayName,
      description: script.description,
      category: script.category,
      price: script.price === "free" ? "" : String(script.price),
      isFree: script.price === "free",
      version: script.version,
      downloadUrl: script.downloadUrl,
      videoUrl: script.videoUrl || "",
    });
    setError("");
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    const scriptData: Omit<Script, "id"> & { id?: string } = {
      scriptName: form.scriptName.trim(),
      displayName: form.displayName.trim(),
      description: form.description.trim(),
      category: form.category,
      price: form.isFree ? "free" : Number(form.price),
      version: form.version.trim(),
      downloadUrl: form.downloadUrl.trim(),
      icon: null,
      videoUrl: form.videoUrl.trim() || null,
    };

    if (editingId) {
      const { error: err } = await updateScript(editingId, scriptData);
      if (err) {
        setError(err);
      } else {
        resetForm();
        setShowForm(false);
      }
    } else {
      const id = form.id.trim() || form.displayName.toLowerCase().replace(/[^a-z0-9\u0590-\u05ff]+/g, "-").replace(/(^-|-$)/g, "");
      const { error: err } = await addScript({ ...scriptData, id });
      if (err) {
        setError(err.includes("duplicate") ? "סקריפט עם מזהה זה כבר קיים" : err);
      } else {
        resetForm();
        setShowForm(false);
      }
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await deleteScript(id);
    setDeleteConfirm(null);
  };

  const filteredScripts = scripts.filter(
    (s) =>
      s.displayName.includes(searchQuery) ||
      s.description.includes(searchQuery) ||
      s.scriptName.includes(searchQuery)
  );

  const updateField = (field: keyof FormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-5xl mx-auto px-6 lg:px-8 py-16">
      <div className="flex items-center justify-between mb-10">
        <div>
          <Link href="/admin" className="text-xs text-t-ghost hover:text-t-dim transition-colors mb-2 inline-flex items-center gap-1">
            <ArrowRight className="w-3 h-3" strokeWidth={1.5} />
            ניהול
          </Link>
          <h1 className="text-2xl font-bold text-t-primary tracking-tight">סקריפטים</h1>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#d4920a] hover:bg-[#e5a312] text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer"
        >
          <Plus className="w-4 h-4" strokeWidth={1.5} />
          סקריפט חדש
        </button>
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-s-base border border-b-subtle rounded-xl p-6 mb-8 space-y-4">
          <h2 className="text-xs font-medium text-t-dim uppercase tracking-wider">
            {editingId ? "עריכת סקריפט" : "סקריפט חדש"}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Display Name */}
            <div>
              <label className="block text-xs text-t-faint mb-1.5">שם תצוגה</label>
              <input
                type="text"
                required
                value={form.displayName}
                onChange={(e) => updateField("displayName", e.target.value)}
                placeholder="כותרת הערות שוליים"
                className="w-full bg-s-input border border-b-medium rounded-lg px-4 py-2.5 text-sm text-t-primary placeholder-t-ghost focus:outline-none focus:border-[#d4920a]/30 transition-colors"
              />
            </div>

            {/* Script Name */}
            <div>
              <label className="block text-xs text-t-faint mb-1.5">שם קובץ</label>
              <input
                type="text"
                required
                value={form.scriptName}
                onChange={(e) => updateField("scriptName", e.target.value)}
                placeholder="כותרת להערות שוליים.jsx"
                className="w-full bg-s-input border border-b-medium rounded-lg px-4 py-2.5 text-sm text-t-primary placeholder-t-ghost focus:outline-none focus:border-[#d4920a]/30 transition-colors"
              />
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="block text-xs text-t-faint mb-1.5">תיאור</label>
              <textarea
                required
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="מאפשר לבחור אלמנט ולמקמו בכותרת הערות שוליים"
                rows={3}
                className="w-full bg-s-input border border-b-medium rounded-lg px-4 py-2.5 text-sm text-t-primary placeholder-t-ghost focus:outline-none focus:border-[#d4920a]/30 transition-colors resize-none"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs text-t-faint mb-1.5">קטגוריה</label>
              <div className="relative" ref={catRef}>
                <button
                  type="button"
                  onClick={() => setCatDropdownOpen(!catDropdownOpen)}
                  className={`w-full flex items-center justify-between bg-s-input border rounded-lg px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                    catDropdownOpen ? "border-[#d4920a]/30" : "border-b-medium"
                  }`}
                >
                  <span className="text-t-primary">{form.category}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-t-ghost transition-transform duration-200 ${catDropdownOpen ? "rotate-180" : ""}`} strokeWidth={1.5} />
                </button>
                {catDropdownOpen && (
                  <div className="absolute z-50 top-full mt-1.5 w-full bg-s-dropdown border border-b-subtle rounded-xl shadow-lg overflow-hidden">
                    {CATEGORIES.map((cat) => (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => { updateField("category", cat); setCatDropdownOpen(false); }}
                        className={`w-full text-right px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                          form.category === cat ? "text-[#e5a312] bg-[#d4920a]/10" : "text-t-muted hover:bg-s-hover"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Price */}
            <div>
              <label className="block text-xs text-t-faint mb-1.5">מחיר</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) => updateField("price", e.target.value)}
                  placeholder="250"
                  disabled={form.isFree}
                  className="flex-1 bg-s-input border border-b-medium rounded-lg px-4 py-2.5 text-sm text-t-primary placeholder-t-ghost focus:outline-none focus:border-[#d4920a]/30 transition-colors disabled:opacity-40"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => updateField("isFree", !form.isFree)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer border ${
                    form.isFree
                      ? "bg-[#d4920a]/15 border-[#d4920a]/30 text-[#e5a312]"
                      : "bg-s-input border-b-medium text-t-dim hover:text-t-secondary"
                  }`}
                >
                  חינם
                </button>
              </div>
            </div>

            {/* Version */}
            <div>
              <label className="block text-xs text-t-faint mb-1.5">גרסה</label>
              <input
                type="text"
                required
                value={form.version}
                onChange={(e) => updateField("version", e.target.value)}
                placeholder="1.0.1"
                className="w-full bg-s-input border border-b-medium rounded-lg px-4 py-2.5 text-sm text-t-primary placeholder-t-ghost focus:outline-none focus:border-[#d4920a]/30 transition-colors"
                dir="ltr"
              />
            </div>

            {/* ID (only for new) */}
            {!editingId && (
              <div>
                <label className="block text-xs text-t-faint mb-1.5">מזהה (אופציונלי)</label>
                <input
                  type="text"
                  value={form.id}
                  onChange={(e) => updateField("id", e.target.value)}
                  placeholder="נוצר אוטומטית מהשם"
                  className="w-full bg-s-input border border-b-medium rounded-lg px-4 py-2.5 text-sm text-t-primary placeholder-t-ghost focus:outline-none focus:border-[#d4920a]/30 transition-colors"
                  dir="ltr"
                />
              </div>
            )}

            {/* Download URL */}
            <div className="sm:col-span-2">
              <label className="block text-xs text-t-faint mb-1.5">קישור הורדה</label>
              <input
                type="url"
                required
                value={form.downloadUrl}
                onChange={(e) => updateField("downloadUrl", e.target.value)}
                placeholder="https://drive.google.com/..."
                className="w-full bg-s-input border border-b-medium rounded-lg px-4 py-2.5 text-sm text-t-primary placeholder-t-ghost focus:outline-none focus:border-[#d4920a]/30 transition-colors"
                dir="ltr"
              />
            </div>

            {/* Video URL */}
            <div className="sm:col-span-2">
              <label className="block text-xs text-t-faint mb-1.5">קישור סרטון (אופציונלי)</label>
              <input
                type="url"
                value={form.videoUrl}
                onChange={(e) => updateField("videoUrl", e.target.value)}
                placeholder="https://youtu.be/..."
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
              {saving ? "שומר..." : editingId ? "שמור שינויים" : "צור סקריפט"}
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

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-t-ghost" strokeWidth={1.5} />
        <input
          type="text"
          placeholder="חיפוש סקריפט..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-s-input border border-b-medium rounded-xl pr-11 pl-4 py-3 text-sm text-t-primary placeholder-t-ghost focus:outline-none focus:border-[#d4920a]/30 transition-colors"
        />
      </div>

      {/* Scripts List */}
      {loading ? (
        <div className="text-center py-12 text-sm text-t-dim">טוען...</div>
      ) : filteredScripts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm text-t-dim">לא נמצאו סקריפטים</p>
        </div>
      ) : (
        <div className="bg-s-base border border-b-subtle rounded-xl overflow-hidden">
          <div className="p-4 border-b border-b-subtle">
            <span className="text-[11px] text-t-ghost uppercase tracking-wider">{filteredScripts.length} סקריפטים</span>
          </div>
          <div className="divide-y divide-b-subtle">
            {filteredScripts.map((script) => (
              <div
                key={script.id}
                className="flex items-center justify-between p-4 hover:bg-s-hover transition-colors duration-200"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-t-secondary">{script.displayName}</span>
                        <span className="text-[11px] text-t-ghost font-mono">{script.version}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-[11px] text-t-ghost font-mono">{script.scriptName}</span>
                        <span className="text-[11px] text-t-dim">{script.category}</span>
                        <span className={`text-[11px] ${script.price === "free" ? "text-[#e5a312]/60" : "text-t-muted"}`}>
                          {formatPrice(script.price)}
                        </span>
                        {script.videoUrl && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#d4920a]/60" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 mr-3">
                  <button
                    onClick={() => openEdit(script)}
                    className="text-t-ghost hover:text-[#e5a312] transition-colors cursor-pointer p-2"
                    title="ערוך"
                  >
                    <Pencil className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </button>
                  <Link
                    href={`/product/${script.id}`}
                    className="text-t-ghost hover:text-[#e5a312] transition-colors p-2"
                    title="צפה"
                  >
                    <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </Link>
                  {deleteConfirm === script.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(script.id)}
                        className="text-xs text-red-400 hover:text-red-300 transition-colors cursor-pointer px-2 py-1"
                      >
                        מחק
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="text-xs text-t-ghost hover:text-t-dim transition-colors cursor-pointer px-2 py-1"
                      >
                        ביטול
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(script.id)}
                      className="text-t-ghost hover:text-red-400 transition-colors cursor-pointer p-2"
                      title="מחק"
                    >
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
