import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { username } = await req.json();

  if (!username || typeof username !== "string") {
    return NextResponse.json({ error: "Missing username" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });

  if (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  const user = data.users.find(
    (u) =>
      (u.user_metadata?.full_name || "").toLowerCase() === username.toLowerCase()
  );

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ email: user.email });
}
