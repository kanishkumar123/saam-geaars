// Edge Function: create-user
// Called by the admin Users master to create a new login account.
// Holds the service-role key server-side; verifies the caller is an admin
// (via their JWT + profiles table) before creating the account.

import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

Deno.serve(async (req: Request) => {
  // ---------------------------------------------------------
  // CORS preflight
  // ---------------------------------------------------------
  // Browsers send an OPTIONS request before the actual POST
  // when making a cross-origin request.
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: corsHeaders,
    });
  }

  // ---------------------------------------------------------
  // Only allow POST requests
  // ---------------------------------------------------------
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  // ---------------------------------------------------------
  // Get caller JWT
  // ---------------------------------------------------------
  const authHeader = req.headers.get("Authorization") ?? "";
  const jwt = authHeader.replace("Bearer ", "");

  if (!jwt) {
    return new Response(
      JSON.stringify({
        error: "Missing Authorization header",
      }),
      {
        status: 401,
        headers: corsHeaders,
      },
    );
  }

  // ---------------------------------------------------------
  // Supabase environment variables
  // ---------------------------------------------------------
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!supabaseUrl || !serviceRoleKey || !anonKey) {
    console.error("Missing required Supabase environment variables");

    return new Response(
      JSON.stringify({
        error: "Server configuration error",
      }),
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }

  // ---------------------------------------------------------
  // Client scoped to caller's JWT
  // Used only to verify who is calling
  // ---------------------------------------------------------
  const callerClient = createClient(supabaseUrl, anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    },
  });

  const {
    data: { user: caller },
    error: callerError,
  } = await callerClient.auth.getUser();

  if (callerError || !caller) {
    return new Response(
      JSON.stringify({
        error: "Invalid session",
      }),
      {
        status: 401,
        headers: corsHeaders,
      },
    );
  }

  // ---------------------------------------------------------
  // Admin client using service-role key
  // ---------------------------------------------------------
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  // ---------------------------------------------------------
  // Verify caller is an admin
  // ---------------------------------------------------------
  const { data: callerProfile, error: profileError } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", caller.id)
    .single();

  if (profileError || callerProfile?.role !== "admin") {
    return new Response(
      JSON.stringify({
        error: "Forbidden — admin only",
      }),
      {
        status: 403,
        headers: corsHeaders,
      },
    );
  }

  // ---------------------------------------------------------
  // Parse request body
  // ---------------------------------------------------------
  let body: {
    email?: string;
    password?: string;
    role?: string;
    full_name?: string;
    username?: string;
  };

  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({
        error: "Invalid JSON body",
      }),
      {
        status: 400,
        headers: corsHeaders,
      },
    );
  }

  const { email, password, role, full_name, username } = body;

  // ---------------------------------------------------------
  // Validate input
  // ---------------------------------------------------------
  if (
    !email ||
    !password ||
    !username ||
    (role !== "admin" && role !== "staff")
  ) {
    return new Response(
      JSON.stringify({
        error:
          "email, password, username, and role ('admin' or 'staff') are required",
      }),
      {
        status: 400,
        headers: corsHeaders,
      },
    );
  }

  if (password.length < 6) {
    return new Response(
      JSON.stringify({
        error: "Password must be at least 6 characters",
      }),
      {
        status: 400,
        headers: corsHeaders,
      },
    );
  }

  // ---------------------------------------------------------
  // Create Supabase Auth user
  // ---------------------------------------------------------
  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      role,
      full_name: full_name || email,
      username,
    },
  });

  if (error) {
    console.error("Failed to create user:", error);

    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        status: 400,
        headers: corsHeaders,
      },
    );
  }

  // ---------------------------------------------------------
  // Create audit log
  // ---------------------------------------------------------
  // The inviting admin's identity is only known here.
  // The profiles-insert trigger that fires from auth.users
  // has no access to who called this function.
  await adminClient.from("audit_log").insert({
    actor_id: caller.id,
    action: "create",
    entity_type: "user",
    entity_id: data.user.id,
    summary: `${username} (${role})`,
    new_values: {
      email,
      role,
      username,
      full_name: full_name || email,
    },
  });

  // ---------------------------------------------------------
  // Return successful response
  // ---------------------------------------------------------
  return new Response(
    JSON.stringify({
      id: data.user.id,
      email: data.user.email,
      role,
      username,
    }),
    {
      status: 200,
      headers: corsHeaders,
    },
  );
});
