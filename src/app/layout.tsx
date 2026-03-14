import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FireCursor from "@/components/FireCursor";
import { CartProvider } from "@/lib/cartContext";
import { ThemeProvider } from "@/lib/themeContext";
import { LanguageProvider } from "@/lib/languageContext";
import { AuthProvider } from "@/lib/authContext";
import { ScriptsProvider } from "@/lib/scriptsContext";

export const metadata: Metadata = {
  title: "Shlomo Nizrit | סקריפטים מקצועיים לאינדיזיין",
  description:
    "סקריפטים מקצועיים לאדובי אינדיזיין — עימוד, ניווט, ייצוא ועיצוב. חסכו שעות עבודה עם כלים אוטומטיים.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col antialiased">
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
            <ScriptsProvider>
            <CartProvider>
              <FireCursor />
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </CartProvider>
            </ScriptsProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
