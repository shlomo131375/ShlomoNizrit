"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Logo from "@/components/Logo";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        router.push("/");
      }
    });

    // Fallback - if already signed in or hash processed
    const timeout = setTimeout(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        router.push(session ? "/" : "/login");
      });
    }, 3000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router]);

  return (
    <div className="flex items-center justify-center py-32">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <Logo size={48} className="opacity-70 animate-pulse" />
        </div>
        <p className="text-sm text-t-dim">מתחבר...</p>
      </div>
    </div>
  );
}
