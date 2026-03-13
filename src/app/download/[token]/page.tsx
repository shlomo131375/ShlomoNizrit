"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Download, Check, Package, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/lib/languageContext";

interface OrderItem {
  script_id: string;
  script_name: string;
  price: number;
}

interface Order {
  id: string;
  download_token: string;
  payment_status: string;
  items: OrderItem[];
  total_amount: number;
  created_at: string;
}

export default function DownloadPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const { lang } = useLanguage();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadedItems, setDownloadedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchOrder() {
      const { data, error: fetchError } = await supabase
        .from("orders")
        .select("*")
        .eq("download_token", token)
        .eq("payment_status", "completed")
        .single();

      if (fetchError || !data) {
        setError(lang === "he"
          ? "קישור ההורדה לא נמצא או שפג תוקפו"
          : "Download link not found or expired");
        setLoading(false);
        return;
      }

      const items = typeof data.items === "string" ? JSON.parse(data.items) : data.items;
      setOrder({ ...data, items });
      setLoading(false);
    }

    fetchOrder();
  }, [token, lang]);

  const handleDownload = (scriptId: string) => {
    setDownloadedItems(prev => new Set(prev).add(scriptId));
    // The actual download happens via the link's href
  };

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-6 py-24 text-center">
        <div className="animate-pulse">
          <div className="w-12 h-12 rounded-full bg-s-hover mx-auto mb-4" />
          <div className="h-4 bg-s-hover rounded w-48 mx-auto" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-lg mx-auto px-6 py-24 text-center">
        <div className="bg-s-base border border-b-subtle rounded-2xl p-10">
          <div className="w-12 h-12 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-5 h-5 text-red-400" strokeWidth={1.5} />
          </div>
          <h1 className="text-xl font-semibold text-t-primary mb-3">
            {lang === "he" ? "קישור לא תקין" : "Invalid Link"}
          </h1>
          <p className="text-sm text-t-dim mb-8">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 border border-b-medium text-t-muted hover:text-t-primary px-6 py-3 rounded-full text-sm transition-colors duration-300"
          >
            {lang === "he" ? "חזרה לאתר" : "Back to site"}
          </Link>
        </div>
      </div>
    );
  }

  const allDownloaded = order.items.every(item => downloadedItems.has(item.script_id));

  return (
    <div className="max-w-lg mx-auto px-6 py-16">
      <div className="bg-s-base border border-b-subtle rounded-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 border border-[#d4920a]/30 rounded-full flex items-center justify-center mx-auto mb-5">
            <Check className="w-6 h-6 text-[#e5a312]" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-bold text-t-primary mb-2 tracking-tight">
            {lang === "he" ? "תודה על הרכישה!" : "Thank you for your purchase!"}
          </h1>
          <p className="text-sm text-t-dim">
            {lang === "he"
              ? "הסקריפטים שלך מוכנים להורדה"
              : "Your scripts are ready to download"}
          </p>
        </div>

        {/* Download Items */}
        <div className="space-y-3 mb-8">
          {order.items.map((item) => {
            const isDownloaded = downloadedItems.has(item.script_id);
            return (
              <div
                key={item.script_id}
                className="flex items-center justify-between bg-s-hover border border-b-medium rounded-xl p-4"
              >
                <div>
                  <div className="text-sm font-medium text-t-primary">{item.script_name}</div>
                  <div className="text-xs text-t-faint mt-0.5">
                    {item.price === 0 ? (lang === "he" ? "חינם" : "Free") : `₪${item.price}`}
                  </div>
                </div>
                <a
                  href={`/api/download/${token}?script=${item.script_id}`}
                  onClick={() => handleDownload(item.script_id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    isDownloaded
                      ? "bg-[#d4920a]/10 text-[#e5a312] border border-[#d4920a]/20"
                      : "bg-[#d4920a] hover:bg-[#e5a312] text-white"
                  }`}
                >
                  {isDownloaded ? (
                    <>
                      <Check className="w-3.5 h-3.5" strokeWidth={2} />
                      {lang === "he" ? "הורד" : "Downloaded"}
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" strokeWidth={2} />
                      {lang === "he" ? "הורדה" : "Download"}
                    </>
                  )}
                </a>
              </div>
            );
          })}
        </div>

        {/* Info */}
        <div className="bg-[#d4920a]/[0.04] border border-[#d4920a]/10 rounded-xl p-4 mb-6">
          <p className="text-xs text-t-dim leading-relaxed">
            {lang === "he"
              ? "שמור את הקישור הזה - תוכל להוריד את הסקריפטים שוב בכל עת. לתמיכה טכנית או שאלות, צור קשר דרך עמוד צור קשר."
              : "Save this link - you can download your scripts again anytime. For support or questions, contact us through the contact page."}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {allDownloaded && (
            <Link
              href="/catalog"
              className="flex items-center justify-center gap-2 bg-[#d4920a] hover:bg-[#e5a312] text-white py-3 rounded-full text-sm font-medium transition-all duration-300"
            >
              {lang === "he" ? "המשך לגלות סקריפטים" : "Explore More Scripts"}
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
            </Link>
          )}
          <Link
            href="/"
            className="flex items-center justify-center gap-2 border border-b-medium text-t-muted hover:text-t-primary py-3 rounded-full text-sm transition-colors duration-300"
          >
            {lang === "he" ? "חזרה לדף הבית" : "Back to Home"}
          </Link>
        </div>
      </div>
    </div>
  );
}
