"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Trash2, ArrowRight, Pencil, Search, Eye, ChevronDown, Play, Star, Type, AlignRight, ImageIcon, List, Minus, ChevronUp, BookOpen } from "lucide-react";
import { useScripts } from "@/lib/scriptsContext";
import Link from "next/link";
import type { Script, GuideBlock } from "@/data/scripts";

const CATEGORIES = ["עימוד", "ניווט", "ייצוא", "עיצוב"];

interface FormVideo {
  url: string;
  title: string;
  sort_order: number;
  is_main: boolean;
}

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
  videos: FormVideo[];
  guide: GuideBlock[];
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
  videos: [],
  guide: [],
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
      videos: script.videos || [],
      guide: script.guide || [],
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
      videos: form.videos.filter((v) => v.url.trim()),
      guide: form.guide.filter((b) => b.type === "divider" || b.content?.trim() || b.imageUrl?.trim() || (b.items && b.items.length > 0)),
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
      <div className="flex items-center justify-between mb-6 sm:mb-10">
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
                value={form.downloadUrl}
                onChange={(e) => updateField("downloadUrl", e.target.value)}
                placeholder="https://drive.google.com/..."
                className="w-full bg-s-input border border-b-medium rounded-lg px-4 py-2.5 text-sm text-t-primary placeholder-t-ghost focus:outline-none focus:border-[#d4920a]/30 transition-colors"
                dir="ltr"
              />
            </div>

            {/* Video URL (legacy/main) */}
            <div className="sm:col-span-2">
              <label className="block text-xs text-t-faint mb-1.5">סרטון ראשי (אופציונלי)</label>
              <input
                type="url"
                value={form.videoUrl}
                onChange={(e) => updateField("videoUrl", e.target.value)}
                placeholder="https://youtu.be/..."
                className="w-full bg-s-input border border-b-medium rounded-lg px-4 py-2.5 text-sm text-t-primary placeholder-t-ghost focus:outline-none focus:border-[#d4920a]/30 transition-colors"
                dir="ltr"
              />
            </div>

            {/* Multiple Videos */}
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-t-faint">סרטונים נוספים</label>
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({
                    ...prev,
                    videos: [...prev.videos, { url: "", title: "", sort_order: prev.videos.length, is_main: false }],
                  }))}
                  className="flex items-center gap-1 text-[11px] text-[#e5a312] hover:text-[#fdc43f] transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3" strokeWidth={1.5} />
                  הוסף סרטון
                </button>
              </div>
              {form.videos.length > 0 && (
                <div className="space-y-2">
                  {form.videos.map((video, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-s-hover/50 rounded-lg p-2">
                      <input
                        type="url"
                        value={video.url}
                        onChange={(e) => {
                          const updated = [...form.videos];
                          updated[idx] = { ...updated[idx], url: e.target.value };
                          setForm((prev) => ({ ...prev, videos: updated }));
                        }}
                        placeholder="https://youtu.be/..."
                        className="flex-1 bg-s-input border border-b-medium rounded-lg px-3 py-2 text-xs text-t-primary placeholder-t-ghost focus:outline-none focus:border-[#d4920a]/30 transition-colors"
                        dir="ltr"
                      />
                      <input
                        type="text"
                        value={video.title}
                        onChange={(e) => {
                          const updated = [...form.videos];
                          updated[idx] = { ...updated[idx], title: e.target.value };
                          setForm((prev) => ({ ...prev, videos: updated }));
                        }}
                        placeholder="שם הסרטון"
                        className="w-32 bg-s-input border border-b-medium rounded-lg px-3 py-2 text-xs text-t-primary placeholder-t-ghost focus:outline-none focus:border-[#d4920a]/30 transition-colors"
                      />
                      <input
                        type="number"
                        value={video.sort_order}
                        onChange={(e) => {
                          const updated = [...form.videos];
                          updated[idx] = { ...updated[idx], sort_order: Number(e.target.value) };
                          setForm((prev) => ({ ...prev, videos: updated }));
                        }}
                        className="w-14 bg-s-input border border-b-medium rounded-lg px-2 py-2 text-xs text-t-primary text-center focus:outline-none focus:border-[#d4920a]/30 transition-colors"
                        title="סדר"
                        dir="ltr"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...form.videos];
                          updated[idx] = { ...updated[idx], is_main: !updated[idx].is_main };
                          // Only one can be main
                          if (updated[idx].is_main) {
                            updated.forEach((v, i) => { if (i !== idx) v.is_main = false; });
                          }
                          setForm((prev) => ({ ...prev, videos: updated }));
                        }}
                        className={`p-2 rounded-lg transition-colors cursor-pointer ${
                          video.is_main ? "text-[#e5a312] bg-[#d4920a]/15" : "text-t-ghost hover:text-[#e5a312]"
                        }`}
                        title="סרטון ראשי"
                      >
                        <Star className="w-3.5 h-3.5" strokeWidth={1.5} fill={video.is_main ? "currentColor" : "none"} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setForm((prev) => ({ ...prev, videos: prev.videos.filter((_, i) => i !== idx) }));
                        }}
                        className="text-t-ghost hover:text-red-400 transition-colors cursor-pointer p-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Guide Editor */}
          <div className="border-t border-b-subtle pt-5 mt-2">
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center gap-2 text-xs text-t-faint">
                <BookOpen className="w-3.5 h-3.5" strokeWidth={1.5} />
                מדריך שימוש ({form.guide.length} בלוקים)
              </label>
              <div className="flex gap-1">
                {([
                  { type: "heading" as const, icon: Type, label: "כותרת" },
                  { type: "text" as const, icon: AlignRight, label: "טקסט" },
                  { type: "image" as const, icon: ImageIcon, label: "תמונה" },
                  { type: "list" as const, icon: List, label: "רשימה" },
                  { type: "divider" as const, icon: Minus, label: "מפריד" },
                ]).map(({ type, icon: Icon, label }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      const newBlock: GuideBlock = {
                        type,
                        content: "",
                        ...(type === "list" ? { items: [""] } : {}),
                      };
                      setForm((prev) => ({ ...prev, guide: [...prev.guide, newBlock] }));
                    }}
                    className="flex items-center gap-1 text-[11px] text-t-ghost hover:text-[#e5a312] transition-colors cursor-pointer px-2 py-1.5 rounded-lg hover:bg-s-hover"
                    title={label}
                  >
                    <Icon className="w-3 h-3" strokeWidth={1.5} />
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {form.guide.length > 0 && (
              <div className="space-y-2">
                {form.guide.map((block, idx) => (
                  <div key={idx} className="bg-s-hover/50 rounded-lg p-3 group">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] text-t-ghost uppercase tracking-wider w-14">
                        {block.type === "heading" ? "כותרת" : block.type === "text" ? "טקסט" : block.type === "image" ? "תמונה" : block.type === "list" ? "רשימה" : "מפריד"}
                      </span>
                      <div className="flex-1" />
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => {
                          const g = [...form.guide];
                          [g[idx - 1], g[idx]] = [g[idx], g[idx - 1]];
                          setForm((prev) => ({ ...prev, guide: g }));
                        }}
                        className="text-t-ghost hover:text-t-muted transition-colors cursor-pointer p-1 disabled:opacity-20"
                      >
                        <ChevronUp className="w-3 h-3" strokeWidth={1.5} />
                      </button>
                      <button
                        type="button"
                        disabled={idx === form.guide.length - 1}
                        onClick={() => {
                          const g = [...form.guide];
                          [g[idx], g[idx + 1]] = [g[idx + 1], g[idx]];
                          setForm((prev) => ({ ...prev, guide: g }));
                        }}
                        className="text-t-ghost hover:text-t-muted transition-colors cursor-pointer p-1 disabled:opacity-20"
                      >
                        <ChevronDown className="w-3 h-3" strokeWidth={1.5} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, guide: prev.guide.filter((_, i) => i !== idx) }))}
                        className="text-t-ghost hover:text-red-400 transition-colors cursor-pointer p-1"
                      >
                        <Trash2 className="w-3 h-3" strokeWidth={1.5} />
                      </button>
                    </div>

                    {block.type === "heading" && (
                      <input
                        type="text"
                        value={block.content}
                        onChange={(e) => {
                          const g = [...form.guide];
                          g[idx] = { ...g[idx], content: e.target.value };
                          setForm((prev) => ({ ...prev, guide: g }));
                        }}
                        placeholder="כותרת..."
                        className="w-full bg-s-input border border-b-medium rounded-lg px-3 py-2 text-sm font-semibold text-t-primary placeholder-t-ghost focus:outline-none focus:border-[#d4920a]/30 transition-colors"
                      />
                    )}

                    {block.type === "text" && (
                      <textarea
                        value={block.content}
                        onChange={(e) => {
                          const g = [...form.guide];
                          g[idx] = { ...g[idx], content: e.target.value };
                          setForm((prev) => ({ ...prev, guide: g }));
                        }}
                        placeholder="טקסט..."
                        rows={3}
                        className="w-full bg-s-input border border-b-medium rounded-lg px-3 py-2 text-sm text-t-primary placeholder-t-ghost focus:outline-none focus:border-[#d4920a]/30 transition-colors resize-none"
                      />
                    )}

                    {block.type === "image" && (
                      <div className="space-y-2">
                        <input
                          type="url"
                          value={block.imageUrl || ""}
                          onChange={(e) => {
                            const g = [...form.guide];
                            g[idx] = { ...g[idx], imageUrl: e.target.value };
                            setForm((prev) => ({ ...prev, guide: g }));
                          }}
                          placeholder="קישור לתמונה (URL)..."
                          className="w-full bg-s-input border border-b-medium rounded-lg px-3 py-2 text-xs text-t-primary placeholder-t-ghost focus:outline-none focus:border-[#d4920a]/30 transition-colors"
                          dir="ltr"
                        />
                        <input
                          type="text"
                          value={block.content}
                          onChange={(e) => {
                            const g = [...form.guide];
                            g[idx] = { ...g[idx], content: e.target.value };
                            setForm((prev) => ({ ...prev, guide: g }));
                          }}
                          placeholder="כיתוב תמונה (אופציונלי)..."
                          className="w-full bg-s-input border border-b-medium rounded-lg px-3 py-2 text-xs text-t-primary placeholder-t-ghost focus:outline-none focus:border-[#d4920a]/30 transition-colors"
                        />
                      </div>
                    )}

                    {block.type === "list" && (
                      <div className="space-y-1.5">
                        {(block.items || []).map((item, j) => (
                          <div key={j} className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#d4920a]/40 shrink-0" />
                            <input
                              type="text"
                              value={item}
                              onChange={(e) => {
                                const g = [...form.guide];
                                const items = [...(g[idx].items || [])];
                                items[j] = e.target.value;
                                g[idx] = { ...g[idx], items };
                                setForm((prev) => ({ ...prev, guide: g }));
                              }}
                              placeholder="פריט..."
                              className="flex-1 bg-s-input border border-b-medium rounded-lg px-3 py-1.5 text-xs text-t-primary placeholder-t-ghost focus:outline-none focus:border-[#d4920a]/30 transition-colors"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const g = [...form.guide];
                                const items = (g[idx].items || []).filter((_, i) => i !== j);
                                g[idx] = { ...g[idx], items };
                                setForm((prev) => ({ ...prev, guide: g }));
                              }}
                              className="text-t-ghost hover:text-red-400 transition-colors cursor-pointer p-1"
                            >
                              <Trash2 className="w-3 h-3" strokeWidth={1.5} />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            const g = [...form.guide];
                            const items = [...(g[idx].items || []), ""];
                            g[idx] = { ...g[idx], items };
                            setForm((prev) => ({ ...prev, guide: g }));
                          }}
                          className="flex items-center gap-1 text-[11px] text-[#e5a312] hover:text-[#fdc43f] transition-colors cursor-pointer mt-1"
                        >
                          <Plus className="w-3 h-3" strokeWidth={1.5} />
                          הוסף פריט
                        </button>
                      </div>
                    )}

                    {block.type === "divider" && (
                      <hr className="border-b-subtle" />
                    )}
                  </div>
                ))}
              </div>
            )}
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
                        {(script.videoUrl || (script.videos && script.videos.length > 0)) && (
                          <span className="flex items-center gap-1 text-[10px] text-t-ghost">
                            <Play className="w-3 h-3" strokeWidth={1.5} />
                            {script.videos && script.videos.length > 0 ? script.videos.length : 1}
                          </span>
                        )}
                        {script.guide && script.guide.length > 0 && (
                          <span className="flex items-center gap-1 text-[10px] text-t-ghost">
                            <BookOpen className="w-3 h-3" strokeWidth={1.5} />
                          </span>
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
