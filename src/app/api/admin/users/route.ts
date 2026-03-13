import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  // Verify admin
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.replace("Bearer ", "");
  const { data: { user } } = await supabaseAdmin.auth.getUser(token);

  if (!user || user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Fetch all auth users
  const { data, error } = await supabaseAdmin.auth.admin.listUsers({
    perPage: 1000,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const users = data.users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.user_metadata?.full_name || "",
    avatar: u.user_metadata?.avatar_url || "",
    provider: u.app_metadata?.provider || "email",
    created_at: u.created_at,
    last_sign_in: u.last_sign_in_at,
  }));

  return NextResponse.json({ users });
}
