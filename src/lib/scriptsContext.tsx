"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { supabase } from "./supabase";
import type { Script } from "@/data/scripts";
import { scripts as staticScripts, categories as staticCategories, formatPrice, getScriptsByCategory } from "@/data/scripts";

interface ScriptsContextType {
  scripts: Script[];
  categories: typeof staticCategories;
  loading: boolean;
  refresh: () => Promise<void>;
  addScript: (script: Omit<Script, "id"> & { id?: string }) => Promise<{ error: string | null }>;
  updateScript: (id: string, updates: Partial<Script>) => Promise<{ error: string | null }>;
  deleteScript: (id: string) => Promise<{ error: string | null }>;
  getScriptById: (id: string) => Script | undefined;
  getScriptsByCategory: (category: string) => Script[];
  formatPrice: (price: number | "free") => string;
}

const ScriptsContext = createContext<ScriptsContextType | undefined>(undefined);

function dbToScript(row: Record<string, unknown>): Script {
  return {
    id: row.id as string,
    scriptName: row.script_name as string,
    displayName: row.display_name as string,
    description: row.description as string,
    category: row.category as string,
    price: row.price === null ? "free" : (row.price as number),
    version: row.version as string,
    downloadUrl: row.download_url as string,
    icon: (row.icon as string) || null,
    videoUrl: (row.video_url as string) || null,
  };
}

function scriptToDb(script: Partial<Script> & { id?: string }) {
  const db: Record<string, unknown> = {};
  if (script.id !== undefined) db.id = script.id;
  if (script.scriptName !== undefined) db.script_name = script.scriptName;
  if (script.displayName !== undefined) db.display_name = script.displayName;
  if (script.description !== undefined) db.description = script.description;
  if (script.category !== undefined) db.category = script.category;
  if (script.price !== undefined) db.price = script.price === "free" ? null : script.price;
  if (script.version !== undefined) db.version = script.version;
  if (script.downloadUrl !== undefined) db.download_url = script.downloadUrl;
  if (script.icon !== undefined) db.icon = script.icon;
  if (script.videoUrl !== undefined) db.video_url = script.videoUrl;
  return db;
}

export function ScriptsProvider({ children }: { children: ReactNode }) {
  const [scripts, setScripts] = useState<Script[]>(staticScripts);
  const [loading, setLoading] = useState(true);

  const fetchScripts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("scripts")
      .select("*")
      .eq("active", true)
      .order("sort_order", { ascending: true });

    if (!error && data && data.length > 0) {
      setScripts(data.map(dbToScript));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchScripts();
  }, [fetchScripts]);

  const addScript = useCallback(async (script: Omit<Script, "id"> & { id?: string }) => {
    const id = script.id || script.scriptName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const dbData = scriptToDb({ ...script, id });

    const { error } = await supabase.from("scripts").insert(dbData);
    if (error) return { error: error.message };

    await fetchScripts();
    return { error: null };
  }, [fetchScripts]);

  const updateScript = useCallback(async (id: string, updates: Partial<Script>) => {
    const dbData = scriptToDb(updates);

    const { error } = await supabase.from("scripts").update(dbData).eq("id", id);
    if (error) return { error: error.message };

    await fetchScripts();
    return { error: null };
  }, [fetchScripts]);

  const deleteScript = useCallback(async (id: string) => {
    const { error } = await supabase.from("scripts").update({ active: false }).eq("id", id);
    if (error) return { error: error.message };

    await fetchScripts();
    return { error: null };
  }, [fetchScripts]);

  const getById = useCallback((id: string) => scripts.find((s) => s.id === id), [scripts]);
  const getByCat = useCallback((category: string) => {
    if (category === "all") return scripts;
    return scripts.filter((s) => s.category === category);
  }, [scripts]);

  // Build dynamic categories from scripts
  const dynamicCategories = [
    { id: "all", name: "הכל" },
    ...Array.from(new Set(scripts.map((s) => s.category))).map((cat) => ({ id: cat, name: cat })),
  ];

  return (
    <ScriptsContext.Provider
      value={{
        scripts,
        categories: dynamicCategories,
        loading,
        refresh: fetchScripts,
        addScript,
        updateScript,
        deleteScript,
        getScriptById: getById,
        getScriptsByCategory: getByCat,
        formatPrice,
      }}
    >
      {children}
    </ScriptsContext.Provider>
  );
}

export function useScripts() {
  const context = useContext(ScriptsContext);
  if (!context) throw new Error("useScripts must be used within ScriptsProvider");
  return context;
}
