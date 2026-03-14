"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, Trash2, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/authContext";
import { useLanguage } from "@/lib/languageContext";
import Link from "next/link";

interface Review {
  id: string;
  script_id: string;
  user_id: string;
  display_name: string;
  display_mode: string;
  rating: number;
  comment: string;
  created_at: string;
}

function Stars({ rating, size = 16, interactive, onRate }: { rating: number; size?: number; interactive?: boolean; onRate?: (r: number) => void }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-0.5" dir="ltr">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onRate?.(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          className={interactive ? "cursor-pointer" : "cursor-default"}
        >
          <Star
            style={{ width: size, height: size }}
            strokeWidth={1.5}
            className={`transition-colors duration-200 ${
              (hover || rating) >= star
                ? "fill-[#e5a312] text-[#e5a312]"
                : "fill-none text-t-ghost"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function ReviewSection({ scriptId }: { scriptId: string }) {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [displayMode, setDisplayMode] = useState<"real" | "custom" | "anonymous">("real");
  const [customName, setCustomName] = useState("");
  const [error, setError] = useState("");
  const [showAll, setShowAll] = useState(false);

  const fetchReviews = useCallback(async () => {
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .eq("script_id", scriptId)
      .order("created_at", { ascending: false });
    setReviews(data || []);
    setLoading(false);
  }, [scriptId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const userReview = user ? reviews.find((r) => r.user_id === user.id) : null;
  const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  const getUserDisplayName = (): string => {
    if (displayMode === "anonymous") return lang === "he" ? "אנונימי" : "Anonymous";
    if (displayMode === "custom") return customName.trim() || (lang === "he" ? "אנונימי" : "Anonymous");
    return user?.user_metadata?.full_name || user?.email?.split("@")[0] || (lang === "he" ? "משתמש" : "User");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (rating === 0) {
      setError(t("reviews.ratingRequired"));
      return;
    }
    if (!comment.trim()) {
      setError(t("reviews.commentRequired"));
      return;
    }

    setSubmitting(true);
    setError("");

    const { error: err } = await supabase.from("reviews").insert({
      script_id: scriptId,
      user_id: user.id,
      user_email: user.email,
      display_name: getUserDisplayName(),
      display_mode: displayMode,
      rating,
      comment: comment.trim(),
    });

    if (err) {
      if (err.code === "23505") {
        setError(t("reviews.alreadyReviewed"));
      } else {
        setError(lang === "he" ? "שגיאה בשליחה" : "Error submitting");
      }
    } else {
      setShowForm(false);
      setRating(0);
      setComment("");
      await fetchReviews();
    }
    setSubmitting(false);
  };

  const handleDelete = async (reviewId: string) => {
    await supabase.from("reviews").delete().eq("id", reviewId);
    await fetchReviews();
  };

  const visibleReviews = showAll ? reviews : reviews.slice(0, 3);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(lang === "he" ? "he-IL" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) return null;

  return (
    <section className="mt-16 pt-10 border-t border-b-subtle">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-semibold text-t-primary tracking-tight">{t("reviews.title")}</h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-3 mt-2">
              <Stars rating={Math.round(avgRating)} size={18} />
              <span className="text-sm text-t-muted">
                {avgRating.toFixed(1)} ({reviews.length} {t("reviews.count")})
              </span>
            </div>
          )}
        </div>
        {user && !userReview && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-[#d4920a] hover:bg-[#e5a312] text-white text-sm font-medium rounded-full transition-all duration-300 cursor-pointer"
          >
            {t("reviews.write")}
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-s-base border border-b-subtle rounded-2xl p-6 mb-8 space-y-4">
          {/* Rating */}
          <div>
            <label className="block text-xs text-t-faint mb-2">{t("reviews.yourRating")}</label>
            <Stars rating={rating} size={28} interactive onRate={setRating} />
          </div>

          {/* Comment */}
          <div>
            <label className="block text-xs text-t-faint mb-1.5">{t("reviews.yourComment")}</label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-s-input border border-b-medium rounded-xl px-4 py-3 text-sm text-t-primary placeholder-t-ghost focus:outline-none focus:border-[#d4920a]/30 transition-colors duration-300 resize-none"
              placeholder={t("reviews.commentPlaceholder")}
            />
          </div>

          {/* Display mode */}
          <div>
            <label className="block text-xs text-t-faint mb-2">{t("reviews.displayAs")}</label>
            <div className="flex flex-wrap gap-2">
              {([
                { value: "real", label: user?.user_metadata?.full_name || user?.email?.split("@")[0] || t("reviews.realName") },
                { value: "custom", label: t("reviews.customName") },
                { value: "anonymous", label: t("reviews.anonymous") },
              ] as const).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDisplayMode(opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-300 cursor-pointer ${
                    displayMode === opt.value
                      ? "bg-[#d4920a]/15 border-[#d4920a]/30 text-[#e5a312]"
                      : "bg-s-base border-b-subtle text-t-dim hover:border-t-ghost"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {displayMode === "custom" && (
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder={t("reviews.enterName")}
                className="mt-2 w-full max-w-xs bg-s-input border border-b-medium rounded-lg px-3 py-2 text-sm text-t-primary placeholder-t-ghost focus:outline-none focus:border-[#d4920a]/30 transition-colors"
              />
            )}
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-[#d4920a] hover:bg-[#e5a312] disabled:opacity-60 text-white text-sm font-medium rounded-full transition-all duration-300 cursor-pointer"
            >
              {submitting ? (lang === "he" ? "שולח..." : "Sending...") : t("reviews.submit")}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setError(""); }}
              className="px-4 py-2.5 text-sm text-t-dim hover:text-t-muted transition-colors cursor-pointer"
            >
              {t("reviews.cancel")}
            </button>
          </div>
        </form>
      )}

      {/* Login prompt */}
      {!user && reviews.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-t-dim mb-3">{t("reviews.loginToReview")}</p>
          <Link href="/login" className="text-sm text-[#e5a312] hover:text-[#fdc43f] transition-colors">
            {t("reviews.login")}
          </Link>
        </div>
      )}

      {!user && reviews.length > 0 && !showForm && (
        <div className="mb-6">
          <Link href="/login" className="text-xs text-[#e5a312] hover:text-[#fdc43f] transition-colors">
            {t("reviews.loginToReview")}
          </Link>
        </div>
      )}

      {/* Reviews list */}
      {reviews.length === 0 && user && !showForm && (
        <p className="text-sm text-t-dim py-4">{t("reviews.noReviews")}</p>
      )}

      {visibleReviews.length > 0 && (
        <div className="space-y-4">
          {visibleReviews.map((review) => (
            <div key={review.id} className="bg-s-base border border-b-subtle rounded-xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#d4920a]/10 border border-[#d4920a]/20 flex items-center justify-center text-xs font-medium text-[#e5a312]">
                    {review.display_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-t-secondary">{review.display_name}</div>
                    <div className="text-[11px] text-t-ghost">{formatDate(review.created_at)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Stars rating={review.rating} size={14} />
                  {user && review.user_id === user.id && (
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="text-t-ghost hover:text-red-400 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-t-muted mt-3 leading-relaxed whitespace-pre-line">{review.comment}</p>
            </div>
          ))}
        </div>
      )}

      {/* Show more */}
      {reviews.length > 3 && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="flex items-center gap-1 mx-auto mt-6 text-sm text-t-dim hover:text-t-muted transition-colors cursor-pointer"
        >
          <ChevronDown className="w-4 h-4" strokeWidth={1.5} />
          {t("reviews.showAll")} ({reviews.length})
        </button>
      )}
    </section>
  );
}
