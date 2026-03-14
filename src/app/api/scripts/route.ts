import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL!;
const validApiKey = process.env.SITE_API_KEY!;

async function isAuthorized(request: NextRequest): Promise<boolean> {
  const apiKey = request.headers.get("x-api-key");
  if (apiKey && apiKey === validApiKey) return true;

  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabaseServer.auth.getUser(token);
    if (user?.email === adminEmail) return true;
  }

  return false;
}

// GET - list all scripts (public) or single script by ?id=xxx
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  try {
    if (id) {
      const { data, error } = await supabaseServer
        .from("scripts")
        .select("*")
        .eq("id", id)
        .eq("active", true)
        .single();

      if (error || !data) {
        return NextResponse.json({ error: "Script not found" }, { status: 404 });
      }
      return NextResponse.json(data);
    }

    const { data, error } = await supabaseServer
      .from("scripts")
      .select("id, script_name, display_name, description, category, price, version, icon, video_url, videos, sort_order, active, created_at")
      .eq("active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      return NextResponse.json({ error: "Failed to fetch scripts" }, { status: 500 });
    }

    return NextResponse.json({ scripts: data, total: data?.length || 0 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - create a new script (admin / API key only)
export async function POST(request: NextRequest) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const {
      id,
      script_name,
      display_name,
      description,
      category,
      price,
      version,
      download_url,
      icon,
      video_url,
      videos,
      guide,
      sort_order,
    } = body;

    // Validate required fields
    if (!script_name || !display_name || !description || !category || !download_url) {
      return NextResponse.json(
        { error: "Missing required fields: script_name, display_name, description, category, download_url" },
        { status: 400 }
      );
    }

    const scriptId = id || display_name.toLowerCase().replace(/[^a-z0-9\u0590-\u05ff]+/g, "-").replace(/(^-|-$)/g, "");

    const insertData: Record<string, unknown> = {
      id: scriptId,
      script_name,
      display_name,
      description,
      category,
      price: price === "free" || price === null || price === undefined ? null : Number(price),
      version: version || "1.0.1",
      download_url,
      icon: icon || null,
      video_url: video_url || null,
      videos: videos || [],
      guide: guide || [],
      sort_order: sort_order ?? 0,
      active: true,
    };

    const { data, error } = await supabaseServer
      .from("scripts")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, script: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT - update an existing script (admin / API key only)
export async function PUT(request: NextRequest) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing script id" }, { status: 400 });
    }

    // Handle price conversion
    if ("price" in updates) {
      updates.price = updates.price === "free" || updates.price === null ? null : Number(updates.price);
    }

    const { data, error } = await supabaseServer
      .from("scripts")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, script: data });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - soft delete a script (admin / API key only)
export async function DELETE(request: NextRequest) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing script id" }, { status: 400 });
    }

    const { error } = await supabaseServer
      .from("scripts")
      .update({ active: false })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: `Script ${id} deactivated` });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
