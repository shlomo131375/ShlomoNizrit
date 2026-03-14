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

// GET - get guide for a script (public)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { data, error } = await supabaseServer
      .from("scripts")
      .select("id, display_name, guide")
      .eq("id", id)
      .eq("active", true)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Script not found" }, { status: 404 });
    }

    return NextResponse.json({
      script_id: data.id,
      display_name: data.display_name,
      guide: data.guide || [],
      block_count: Array.isArray(data.guide) ? data.guide.length : 0,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT - replace entire guide (admin / API key only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { guide } = body;

    if (!Array.isArray(guide)) {
      return NextResponse.json(
        { error: "guide must be an array of blocks" },
        { status: 400 }
      );
    }

    // Validate each block
    const validTypes = ["heading", "text", "image", "list", "divider"];
    for (const block of guide) {
      if (!validTypes.includes(block.type)) {
        return NextResponse.json(
          { error: `Invalid block type: ${block.type}. Valid types: ${validTypes.join(", ")}` },
          { status: 400 }
        );
      }
    }

    const { data, error } = await supabaseServer
      .from("scripts")
      .update({ guide })
      .eq("id", id)
      .select("id, display_name, guide")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      script_id: data.id,
      guide: data.guide,
      block_count: Array.isArray(data.guide) ? data.guide.length : 0,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH - add block(s) to existing guide (admin / API key only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { action = "append", blocks, index } = body;

    // blocks can be a single block or array
    const newBlocks = Array.isArray(blocks) ? blocks : [blocks];

    if (!newBlocks.length || !newBlocks[0]?.type) {
      return NextResponse.json(
        {
          error: "Missing blocks. Send: { blocks: { type, content } } or { blocks: [{ type, content }, ...] }",
          valid_types: ["heading", "text", "image", "list", "divider"],
          example: {
            action: "append",
            blocks: [
              { type: "heading", content: "כותרת" },
              { type: "text", content: "טקסט הסבר" },
              { type: "image", imageUrl: "https://...", content: "כיתוב" },
              { type: "list", items: ["פריט 1", "פריט 2"] },
              { type: "divider" },
            ],
          },
        },
        { status: 400 }
      );
    }

    // Get current guide
    const { data: current, error: fetchError } = await supabaseServer
      .from("scripts")
      .select("guide")
      .eq("id", id)
      .single();

    if (fetchError || !current) {
      return NextResponse.json({ error: "Script not found" }, { status: 404 });
    }

    const existingGuide: Record<string, unknown>[] = Array.isArray(current.guide) ? current.guide : [];

    let updatedGuide: Record<string, unknown>[];

    switch (action) {
      case "append":
        updatedGuide = [...existingGuide, ...newBlocks];
        break;
      case "prepend":
        updatedGuide = [...newBlocks, ...existingGuide];
        break;
      case "insert":
        if (typeof index !== "number" || index < 0) {
          return NextResponse.json({ error: "insert action requires a valid index" }, { status: 400 });
        }
        updatedGuide = [...existingGuide];
        updatedGuide.splice(index, 0, ...newBlocks);
        break;
      case "remove":
        if (typeof index !== "number" || index < 0 || index >= existingGuide.length) {
          return NextResponse.json({ error: "remove action requires a valid index" }, { status: 400 });
        }
        updatedGuide = [...existingGuide];
        updatedGuide.splice(index, 1);
        break;
      case "clear":
        updatedGuide = [];
        break;
      default:
        return NextResponse.json(
          { error: `Invalid action: ${action}. Valid: append, prepend, insert, remove, clear` },
          { status: 400 }
        );
    }

    const { data, error } = await supabaseServer
      .from("scripts")
      .update({ guide: updatedGuide })
      .eq("id", id)
      .select("id, display_name, guide")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      action,
      script_id: data.id,
      guide: data.guide,
      block_count: Array.isArray(data.guide) ? data.guide.length : 0,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
