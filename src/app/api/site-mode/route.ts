import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

// GET - check current site mode
export async function GET() {
  try {
    const { data } = await supabaseServer
      .from("site_settings")
      .select("key, value")
      .in("key", ["maintenance_mode", "shabbat_mode"]);

    const settings: Record<string, boolean> = {};
    for (const row of data || []) {
      settings[row.key] = row.value === "true";
    }

    return NextResponse.json({
      maintenance_mode: settings.maintenance_mode || false,
      shabbat_mode: settings.shabbat_mode || false,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

// POST - toggle site mode (admin only or API key)
export async function POST(request: NextRequest) {
  try {
    // Check for API key (for n8n automation)
    const apiKey = request.headers.get("x-api-key");
    const validApiKey = process.env.SITE_API_KEY;

    let isAuthorized = false;

    if (apiKey && validApiKey && apiKey === validApiKey) {
      isAuthorized = true;
    } else {
      // Check for admin user via auth header
      const authHeader = request.headers.get("authorization");
      if (authHeader) {
        const token = authHeader.replace("Bearer ", "");
        const { data: { user } } = await supabaseServer.auth.getUser(token);
        if (user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
          isAuthorized = true;
        }
      }
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { mode, enabled } = await request.json();

    if (!["maintenance_mode", "shabbat_mode"].includes(mode)) {
      return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
    }

    const { error } = await supabaseServer
      .from("site_settings")
      .update({ value: String(enabled), updated_at: new Date().toISOString() })
      .eq("key", mode);

    if (error) {
      return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }

    return NextResponse.json({ success: true, mode, enabled });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
