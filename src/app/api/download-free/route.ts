import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const scriptId = request.nextUrl.searchParams.get("id");

  if (!scriptId) {
    return NextResponse.json({ error: "Missing script ID" }, { status: 400 });
  }

  // Get the script - verify it's free
  const { data: script, error } = await supabaseServer
    .from("scripts")
    .select("download_url, price")
    .eq("id", scriptId)
    .eq("active", true)
    .single();

  if (error || !script) {
    return NextResponse.json({ error: "Script not found" }, { status: 404 });
  }

  // Only allow download for free scripts
  if (script.price !== null) {
    return NextResponse.json({ error: "This script requires purchase" }, { status: 403 });
  }

  if (!script.download_url) {
    return NextResponse.json({ error: "Download not available" }, { status: 404 });
  }

  return NextResponse.redirect(script.download_url);
}
