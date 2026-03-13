"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import Logo from "@/components/Logo";
import { useAuth } from "@/lib/authContext";
import { useLanguage } from "@/lib/languageContext";

export default function LoginPage() {
  const { signInWithEmail, signInWithGoogle, signUpWithEmail, resetPassword } = useAuth();
  const { lang } = useLanguage();
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (mode === "login") {
      let loginEmail = email;

      // If input doesn't look like an email, try looking up by username
      if (!email.includes("@")) {
        try {
          const res = await fetch("/api/auth/lookup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: email }),
          });
          if (res.ok) {
            const data = await res.json();
            loginEmail = data.email;
          } else {
            setError(
              lang === "he"
                ? "שם משתמש לא נמצא"
                : "Username not found"
            );
            setLoading(false);
            return;
          }
        } catch {
          setError(lang === "he" ? "שגיאה בחיבור לשרת" : "Server connection error");
          setLoading(false);
          return;
        }
      }

      const { error } = await signInWithEmail(loginEmail, password);
      if (error) {
        setError(
          lang === "he"
            ? "אימייל/שם משתמש או סיסמה שגויים"
            : "Invalid email/username or password"
        );
      } else {
        router.push("/");
      }
    } else {
      if (password.length < 6) {
        setError(
          lang === "he"
            ? "הסיסמה חייבת להכיל לפחות 6 תווים"
            : "Password must be at least 6 characters"
        );
        setLoading(false);
        return;
      }
      const { error } = await signUpWithEmail(email, password, name, country, city);
      if (error) {
        setError(
          lang === "he"
            ? "שגיאה ביצירת החשבון. ייתכן שהאימייל כבר רשום."
            : "Error creating account. Email may already be registered."
        );
      } else {
        setEmailSent(true);
      }
    }

    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await resetPassword(email);
    if (error) {
      setError(lang === "he" ? "שגיאה בשליחת המייל. נסה שוב." : "Error sending email. Try again.");
    } else {
      setResetSent(true);
    }
    setLoading(false);
  };

  if (resetSent) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <div className="flex justify-center mb-6">
          <Logo size={48} className="opacity-70" />
        </div>
        <h1 className="text-2xl font-bold text-t-primary mb-4 tracking-tight">
          {lang === "he" ? "בדוק את המייל שלך" : "Check Your Email"}
        </h1>
        <p className="text-sm text-t-dim leading-relaxed mb-8">
          {lang === "he"
            ? `שלחנו קישור לאיפוס סיסמה ל-${email}. לחץ על הקישור כדי לבחור סיסמה חדשה.`
            : `We sent a password reset link to ${email}. Click the link to choose a new password.`}
        </p>
        <button
          onClick={() => { setResetSent(false); setMode("login"); setEmail(""); }}
          className="text-sm text-[#d4920a] hover:text-[#e5a312] transition-colors duration-300 cursor-pointer"
        >
          {lang === "he" ? "חזרה להתחברות" : "Back to login"}
        </button>
      </div>
    );
  }

  if (emailSent) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <div className="flex justify-center mb-6">
          <Logo size={48} className="opacity-70" />
        </div>
        <h1 className="text-2xl font-bold text-t-primary mb-4 tracking-tight">
          {lang === "he" ? "בדוק את המייל שלך" : "Check Your Email"}
        </h1>
        <p className="text-sm text-t-dim leading-relaxed mb-8">
          {lang === "he"
            ? `שלחנו קישור אימות ל-${email}. לחץ על הקישור כדי להפעיל את החשבון.`
            : `We sent a verification link to ${email}. Click the link to activate your account.`}
        </p>
        <button
          onClick={() => { setEmailSent(false); setMode("login"); }}
          className="text-sm text-[#d4920a] hover:text-[#e5a312] transition-colors duration-300 cursor-pointer"
        >
          {lang === "he" ? "חזרה להתחברות" : "Back to login"}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <div className="text-center mb-10">
        <div className="flex justify-center mb-6">
          <Logo size={48} className="opacity-70" />
        </div>
        <h1 className="text-2xl font-bold text-t-primary tracking-tight mb-2">
          {mode === "forgot"
            ? (lang === "he" ? "שכחתי סיסמה" : "Forgot Password")
            : mode === "login"
              ? (lang === "he" ? "התחברות" : "Sign In")
              : (lang === "he" ? "יצירת חשבון" : "Create Account")}
        </h1>
        <p className="text-sm text-t-dim">
          {mode === "forgot"
            ? (lang === "he" ? "הזן את האימייל שלך ונשלח לך קישור לאיפוס" : "Enter your email and we'll send you a reset link")
            : mode === "login"
              ? (lang === "he" ? "התחבר כדי לנהל את הרכישות שלך" : "Sign in to manage your purchases")
              : (lang === "he" ? "צור חשבון חדש כדי להתחיל" : "Create a new account to get started")}
        </p>
      </div>

      {mode === "forgot" ? (
        /* Forgot Password Form */
        <form onSubmit={handleForgotPassword} className="space-y-4">
          <div>
            <label className="block text-xs text-t-faint mb-1.5">
              {lang === "he" ? "אימייל" : "Email"}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-s-input border border-b-medium rounded-xl px-4 py-3 text-sm text-t-primary placeholder-t-ghost focus:outline-none focus:border-[#d4920a]/30 transition-colors duration-300"
              placeholder="your@email.com"
              dir="ltr"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#d4920a] hover:bg-[#e5a312] disabled:opacity-50 text-white py-3.5 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer"
          >
            {loading
              ? (lang === "he" ? "שולח..." : "Sending...")
              : (lang === "he" ? "שלח קישור איפוס" : "Send Reset Link")}
          </button>

          <p className="text-center text-sm text-t-dim mt-4">
            <button
              type="button"
              onClick={() => { setMode("login"); setError(""); }}
              className="text-[#d4920a] hover:text-[#e5a312] font-medium transition-colors duration-300 cursor-pointer"
            >
              {lang === "he" ? "חזרה להתחברות" : "Back to login"}
            </button>
          </p>
        </form>
      ) : (
        <>
      {/* Google Button */}
      <button
        onClick={signInWithGoogle}
        className="w-full flex items-center justify-center gap-3 bg-s-base border border-b-medium hover:border-t-dim rounded-xl px-4 py-3 text-sm text-t-secondary font-medium transition-all duration-300 mb-4 cursor-pointer"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        {lang === "he" ? "המשך עם Google" : "Continue with Google"}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-b-subtle" />
        <span className="text-xs text-t-ghost">{lang === "he" ? "או" : "or"}</span>
        <div className="flex-1 h-px bg-b-subtle" />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "register" && (
          <>
          <div>
            <label className="block text-xs text-t-faint mb-1.5">
              {lang === "he" ? "שם מלא" : "Full Name"}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-s-input border border-b-medium rounded-xl px-4 py-3 text-sm text-t-primary placeholder-t-ghost focus:outline-none focus:border-[#d4920a]/30 transition-colors duration-300"
              placeholder={lang === "he" ? "השם שלך" : "Your name"}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-t-faint mb-1.5">
                {lang === "he" ? "מדינה" : "Country"}
              </label>
              <input
                type="text"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-s-input border border-b-medium rounded-xl px-4 py-3 text-sm text-t-primary placeholder-t-ghost focus:outline-none focus:border-[#d4920a]/30 transition-colors duration-300"
                placeholder={lang === "he" ? "ישראל" : "Israel"}
              />
            </div>
            <div>
              <label className="block text-xs text-t-faint mb-1.5">
                {lang === "he" ? "עיר" : "City"}
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-s-input border border-b-medium rounded-xl px-4 py-3 text-sm text-t-primary placeholder-t-ghost focus:outline-none focus:border-[#d4920a]/30 transition-colors duration-300"
                placeholder={lang === "he" ? "תל אביב" : "Tel Aviv"}
              />
            </div>
          </div>
          </>
        )}

        <div>
          <label className="block text-xs text-t-faint mb-1.5">
            {mode === "login"
              ? (lang === "he" ? "אימייל או שם משתמש" : "Email or Username")
              : (lang === "he" ? "אימייל" : "Email")}
          </label>
          <input
            type={mode === "login" ? "text" : "email"}
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-s-input border border-b-medium rounded-xl px-4 py-3 text-sm text-t-primary placeholder-t-ghost focus:outline-none focus:border-[#d4920a]/30 transition-colors duration-300"
            placeholder={mode === "login"
              ? (lang === "he" ? "אימייל או שם מלא" : "email or full name")
              : "your@email.com"}
            dir="ltr"
          />
        </div>

        <div>
          <label className="block text-xs text-t-faint mb-1.5">
            {lang === "he" ? "סיסמה" : "Password"}
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-s-input border border-b-medium rounded-xl px-4 py-3 text-sm text-t-primary placeholder-t-ghost focus:outline-none focus:border-[#d4920a]/30 transition-colors duration-300"
              placeholder={mode === "register"
                ? (lang === "he" ? "לפחות 6 תווים" : "At least 6 characters")
                : (lang === "he" ? "הסיסמה שלך" : "Your password")}
              dir="ltr"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-t-ghost hover:text-t-dim transition-colors cursor-pointer"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" strokeWidth={1.5} />
              ) : (
                <Eye className="w-4 h-4" strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>

        {mode === "login" && (
          <div className="text-left">
            <button
              type="button"
              onClick={() => { setMode("forgot"); setError(""); }}
              className="text-xs text-t-ghost hover:text-[#d4920a] transition-colors duration-300 cursor-pointer"
            >
              {lang === "he" ? "שכחתי סיסמה" : "Forgot password?"}
            </button>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-400 text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#d4920a] hover:bg-[#e5a312] disabled:opacity-50 text-white py-3.5 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer"
        >
          {loading
            ? (lang === "he" ? "מתחבר..." : "Loading...")
            : mode === "login"
              ? (lang === "he" ? "התחבר" : "Sign In")
              : (lang === "he" ? "צור חשבון" : "Create Account")}
        </button>
      </form>

      {/* Toggle mode */}
      <p className="text-center text-sm text-t-dim mt-8">
        {mode === "login"
          ? (lang === "he" ? "אין לך חשבון?" : "Don't have an account?")
          : (lang === "he" ? "כבר יש לך חשבון?" : "Already have an account?")}
        {" "}
        <button
          onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
          className="text-[#d4920a] hover:text-[#e5a312] font-medium transition-colors duration-300 cursor-pointer"
        >
          {mode === "login"
            ? (lang === "he" ? "צור חשבון" : "Create one")
            : (lang === "he" ? "התחבר" : "Sign in")}
        </button>
      </p>
        </>
      )}

      {/* Back to home */}
      <div className="text-center mt-4">
        <Link href="/" className="text-xs text-t-ghost hover:text-t-dim transition-colors duration-300">
          {lang === "he" ? "חזרה לאתר" : "Back to site"}
        </Link>
      </div>
    </div>
  );
}
