import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const scriptId = request.nextUrl.searchParams.get("script");

  if (!token || !scriptId) {
    return NextResponse.json({ error: "Missing token or script ID" }, { status: 400 });
  }

  // Find the order by download token
  const { data: order, error: orderError } = await supabaseServer
    .from("orders")
    .select("*")
    .eq("download_token", token)
    .eq("payment_status", "completed")
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: "Invalid or expired download link" }, { status: 403 });
  }

  // Check if the script is in the order
  const items = typeof order.items === "string" ? JSON.parse(order.items) : order.items;
  const orderedScript = items.find((item: { script_id: string }) => item.script_id === scriptId);
  if (!orderedScript) {
    return NextResponse.json({ error: "Script not found in this order" }, { status: 403 });
  }

  // Get the download URL from the database (server-side only)
  const { data: script, error: scriptError } = await supabaseServer
    .from("scripts")
    .select("download_url, display_name")
    .eq("id", scriptId)
    .single();

  if (scriptError || !script?.download_url) {
    return NextResponse.json({ error: "Script not found" }, { status: 404 });
  }

  // Redirect to the actual download URL
  return NextResponse.redirect(script.download_url);
}
