import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL!;

const SUPABASE_PROJECT_ID = "zbxlijthtsczkfgxflvt";

// Pages that should always be accessible
const ALLOWED_PATHS = [
  "/maintenance",
  "/shabbat",
  "/api/site-mode",
  "/api/auth",
  "/api/",
  "/_next",
  "/favicon.ico",
  "/admin",
];

function extractAccessToken(request: NextRequest): string | null {
  // Try the main cookie first
  const mainCookie = request.cookies.get(`sb-${SUPABASE_PROJECT_ID}-auth-token`)?.value;
  if (mainCookie) {
    try {
      const parsed = JSON.parse(mainCookie);
      if (parsed?.access_token) return parsed.access_token;
      if (typeof parsed === "string") return parsed;
    } catch {
      // Not JSON, might be a raw token
      if (mainCookie.startsWith("ey")) return mainCookie;
    }
  }

  // Try chunked cookies (Supabase splits large cookies into .0, .1, etc.)
  let combined = "";
  for (let i = 0; i < 10; i++) {
    const chunk = request.cookies.get(`sb-${SUPABASE_PROJECT_ID}-auth-token.${i}`)?.value;
    if (!chunk) break;
    combined += chunk;
  }
  if (combined) {
    try {
      const parsed = JSON.parse(combined);
      if (parsed?.access_token) return parsed.access_token;
    } catch {
      // ignore
    }
  }

  // Try base64-encoded cookie
  const base64Cookie = request.cookies.get(`sb-${SUPABASE_PROJECT_ID}-auth-token-code-verifier`)?.value;
  if (!base64Cookie) {
    // Also check the raw base64 variant
    const rawB64 = request.cookies.get(`sb-${SUPABASE_PROJECT_ID}-auth-token`)?.value;
    if (rawB64) {
      try {
        const decoded = Buffer.from(rawB64, "base64").toString("utf-8");
        const parsed = JSON.parse(decoded);
        if (parsed?.access_token) return parsed.access_token;
      } catch {
        // not base64
      }
    }
  }

  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow certain paths (admin can always access admin panel)
  if (ALLOWED_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Check site mode from Supabase
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["maintenance_mode", "shabbat_mode"]);

    const settings: Record<string, boolean> = {};
    for (const row of data || []) {
      settings[row.key] = row.value === "true";
    }

    const maintenanceMode = settings.maintenance_mode || false;
    const shabbatMode = settings.shabbat_mode || false;

    if (!maintenanceMode && !shabbatMode) {
      return NextResponse.next();
    }

    // Check if user is admin via cookie
    const accessToken = extractAccessToken(request);
    if (accessToken) {
      try {
        const { data: { user } } = await supabase.auth.getUser(accessToken);
        if (user?.email === adminEmail) {
          return NextResponse.next();
        }
      } catch {
        // Not admin, continue to redirect
      }
    }

    // Redirect to appropriate page
    if (maintenanceMode && pathname !== "/maintenance") {
      return NextResponse.redirect(new URL("/maintenance", request.url));
    }
    if (shabbatMode && pathname !== "/shabbat") {
      return NextResponse.redirect(new URL("/shabbat", request.url));
    }
  } catch {
    // If settings check fails, allow access
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
