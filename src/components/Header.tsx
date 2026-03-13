"use client";

import Link from "next/link";
import { ShoppingCart, Menu, X, Sun, Moon, Globe, User, Users, LogOut, Settings, ChevronDown, Package, Ticket } from "lucide-react";
import { useCart } from "@/lib/cartContext";
import { useTheme } from "@/lib/themeContext";
import { useLanguage } from "@/lib/languageContext";
import { useAuth } from "@/lib/authContext";
import { useState, useRef, useEffect } from "react";
import Logo from "./Logo";

export default function Header() {
  const { totalItems } = useCart();
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLanguage, t } = useLanguage();
  const { user, loading: authLoading, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const adminMenuRef = useRef<HTMLDivElement>(null);

  const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const isAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (adminMenuRef.current && !adminMenuRef.current.contains(e.target as Node)) {
        setAdminMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const links = [
    { href: "/", label: t("nav.home") },
    { href: "/catalog", label: t("nav.scripts") },
    { href: "/about", label: t("nav.about") },
    { href: "/contact", label: t("nav.contact") },
  ];

  return (
    <header className="sticky top-0 z-50 bg-bg-header backdrop-blur-xl border-b border-b-subtle">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 group">
            <Logo size={32} />
            <span className="text-[15px] font-semibold text-t-primary tracking-tight">
              Shlomo Nizrit Scripts
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[13px] text-t-muted hover:text-t-primary transition-colors duration-300"
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <div className="relative" ref={adminMenuRef}>
                <button
                  onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                  className="flex items-center gap-1 text-[13px] text-[#e5a312] hover:text-[#d4920a] transition-colors duration-300 cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5" strokeWidth={1.5} />
                  {lang === "he" ? "ניהול" : "Admin"}
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${adminMenuOpen ? "rotate-180" : ""}`} strokeWidth={1.5} />
                </button>
                {adminMenuOpen && (
                  <div className="absolute left-0 top-full mt-2 w-48 bg-s-dropdown border border-b-subtle rounded-xl shadow-lg overflow-hidden z-50">
                    <Link
                      href="/admin"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-t-muted hover:bg-s-hover hover:text-[#e5a312] transition-colors duration-200"
                      onClick={() => setAdminMenuOpen(false)}
                    >
                      <Settings className="w-3.5 h-3.5" strokeWidth={1.5} />
                      {lang === "he" ? "לוח בקרה" : "Dashboard"}
                    </Link>
                    <Link
                      href="/admin/scripts"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-t-muted hover:bg-s-hover hover:text-[#e5a312] transition-colors duration-200"
                      onClick={() => setAdminMenuOpen(false)}
                    >
                      <Package className="w-3.5 h-3.5" strokeWidth={1.5} />
                      {lang === "he" ? "ניהול סקריפטים" : "Manage Scripts"}
                    </Link>
                    <Link
                      href="/admin/coupons"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-t-muted hover:bg-s-hover hover:text-[#e5a312] transition-colors duration-200"
                      onClick={() => setAdminMenuOpen(false)}
                    >
                      <Ticket className="w-3.5 h-3.5" strokeWidth={1.5} />
                      {lang === "he" ? "ניהול קופונים" : "Manage Coupons"}
                    </Link>
                    <Link
                      href="/admin/orders"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-t-muted hover:bg-s-hover hover:text-[#e5a312] transition-colors duration-200"
                      onClick={() => setAdminMenuOpen(false)}
                    >
                      <Package className="w-3.5 h-3.5" strokeWidth={1.5} />
                      {lang === "he" ? "ניהול הזמנות" : "Manage Orders"}
                    </Link>
                    <Link
                      href="/admin/users"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-t-muted hover:bg-s-hover hover:text-[#e5a312] transition-colors duration-200"
                      onClick={() => setAdminMenuOpen(false)}
                    >
                      <Users className="w-3.5 h-3.5" strokeWidth={1.5} />
                      {lang === "he" ? "ניהול משתמשים" : "Manage Users"}
                    </Link>
                  </div>
                )}
              </div>
            )}
          </nav>

          <div className="flex items-center gap-1">
            {/* Language toggle */}
            <button
              onClick={toggleLanguage}
              className="p-2 text-t-dim hover:text-t-primary transition-colors duration-300 cursor-pointer"
              title={lang === "he" ? "Switch to English" : "עבור לעברית"}
            >
              <Globe className="w-[18px] h-[18px]" strokeWidth={1.5} />
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-t-dim hover:text-t-primary transition-colors duration-300 cursor-pointer"
              title={theme === "dark" ? "Light mode" : "Dark mode"}
            >
              {theme === "dark" ? (
                <Sun className="w-[18px] h-[18px]" strokeWidth={1.5} />
              ) : (
                <Moon className="w-[18px] h-[18px]" strokeWidth={1.5} />
              )}
            </button>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 text-t-dim hover:text-t-primary transition-colors duration-300"
            >
              <ShoppingCart className="w-[18px] h-[18px]" strokeWidth={1.5} />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#d4920a] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* User */}
            {!authLoading && (
              user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="p-2 text-t-dim hover:text-t-primary transition-colors duration-300 cursor-pointer"
                  >
                    <div className="w-[22px] h-[22px] rounded-full bg-[#d4920a]/20 flex items-center justify-center">
                      <span className="text-[10px] font-medium text-[#e5a312]">
                        {(user.user_metadata?.full_name || user.email || "U").charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute left-0 top-full mt-2 w-48 bg-s-dropdown border border-b-subtle rounded-xl shadow-lg overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-b-subtle">
                        <div className="text-xs text-t-muted truncate">{user.user_metadata?.full_name || ""}</div>
                        <div className="text-[11px] text-t-ghost truncate" dir="ltr">{user.email}</div>
                      </div>
                      <Link
                        href="/account"
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-t-dim hover:bg-s-hover hover:text-[#e5a312] transition-colors duration-200"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="w-3.5 h-3.5" strokeWidth={1.5} />
                        {lang === "he" ? "החשבון שלי" : "My Account"}
                      </Link>
                      <button
                        onClick={() => { signOut(); setUserMenuOpen(false); }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-t-dim hover:bg-s-hover hover:text-red-400 transition-colors duration-200 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" strokeWidth={1.5} />
                        {lang === "he" ? "התנתק" : "Sign Out"}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="p-2 text-t-dim hover:text-t-primary transition-colors duration-300"
                  title={lang === "he" ? "התחברות" : "Sign In"}
                >
                  <User className="w-[18px] h-[18px]" strokeWidth={1.5} />
                </Link>
              )
            )}

            <button
              className="md:hidden p-2 text-t-dim hover:text-t-primary transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? (
                <X className="w-5 h-5" strokeWidth={1.5} />
              ) : (
                <Menu className="w-5 h-5" strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="md:hidden pb-6 pt-2 border-t border-b-subtle">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-3 text-sm text-t-muted hover:text-t-primary transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <>
                <div className="h-px bg-b-subtle my-2" />
                <div className="text-[11px] text-[#e5a312] uppercase tracking-wider py-2 flex items-center gap-1.5">
                  <Settings className="w-3 h-3" strokeWidth={1.5} />
                  {lang === "he" ? "ניהול" : "Admin"}
                </div>
                <Link href="/admin" className="block py-2.5 text-sm text-t-muted hover:text-[#e5a312] transition-colors ps-5" onClick={() => setMenuOpen(false)}>
                  {lang === "he" ? "לוח בקרה" : "Dashboard"}
                </Link>
                <Link href="/admin/scripts" className="block py-2.5 text-sm text-t-muted hover:text-[#e5a312] transition-colors ps-5" onClick={() => setMenuOpen(false)}>
                  {lang === "he" ? "ניהול סקריפטים" : "Manage Scripts"}
                </Link>
                <Link href="/admin/coupons" className="block py-2.5 text-sm text-t-muted hover:text-[#e5a312] transition-colors ps-5" onClick={() => setMenuOpen(false)}>
                  {lang === "he" ? "ניהול קופונים" : "Manage Coupons"}
                </Link>
                <Link href="/admin/orders" className="block py-2.5 text-sm text-t-muted hover:text-[#e5a312] transition-colors ps-5" onClick={() => setMenuOpen(false)}>
                  {lang === "he" ? "ניהול הזמנות" : "Manage Orders"}
                </Link>
                <Link href="/admin/users" className="block py-2.5 text-sm text-t-muted hover:text-[#e5a312] transition-colors ps-5" onClick={() => setMenuOpen(false)}>
                  {lang === "he" ? "ניהול משתמשים" : "Manage Users"}
                </Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
