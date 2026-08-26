// Edge Function: create-user
// Called by the admin Users master to create a new login account.
// Holds the service-role key server-side; verifies the caller is an admin
// (via their JWT + profiles table) before creating the account.

import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  const jwt = authHeader.replace("Bearer ", "");
  if (!jwt) {
    return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  // Client scoped to the caller's JWT — used only to verify who is calling.
  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${jwt}` } },
  });

  const {
    data: { user: caller },
    error: callerError,
  } = await callerClient.auth.getUser();

  if (callerError || !caller) {
    return new Response(JSON.stringify({ error: "Invalid session" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  const { data: callerProfile, error: profileError } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", caller.id)
    .single();

  if (profileError || callerProfile?.role !== "admin") {
    return new Response(JSON.stringify({ error: "Forbidden — admin only" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: { email?: string; password?: string; role?: string; full_name?: string; username?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { email, password, role, full_name, username } = body;

  if (!email || !password || !username || (role !== "admin" && role !== "staff")) {
    return new Response(
      JSON.stringify({ error: "email, password, username, and role ('admin' or 'staff') are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }
  if (password.length < 6) {
    return new Response(JSON.stringify({ error: "Password must be at least 6 characters" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role, full_name: full_name || email, username },
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // The inviting admin's identity is only known here (the profiles-insert
  // trigger that fires from auth.users has no access to who called this
  // function), so the "create" audit entry for a new user account is
  // written explicitly from this side rather than from a generic trigger.
  await adminClient.from("audit_log").insert({
    actor_id: caller.id,
    action: "create",
    entity_type: "user",
    entity_id: data.user.id,
    summary: `${username} (${role})`,
    new_values: { email, role, username, full_name: full_name || email },
  });

  return new Response(JSON.stringify({ id: data.user.id, email: data.user.email, role, username }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
