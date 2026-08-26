// One-time seed script — creates the two starter admin panel accounts.
// Requires SUPABASE_SERVICE_ROLE_KEY in .env (never commit this key).
//
// Usage:
//   node scripts/seed-users.mjs

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env");
  const text = readFileSync(envPath, "utf-8");
  const env = {};
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  }
  return env;
}

const env = loadEnv();
const SUPABASE_URL = env.SUPABASE_URL;
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env — fill in the service_role key from Supabase Dashboard -> Project Settings -> API before running this script.",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const seedAccounts = [
  { email: "admin@gmail.com", password: "123456", role: "admin", full_name: "Admin", username: "admin" },
  { email: "staff@gmail.com", password: "123456", role: "staff", full_name: "Staff", username: "staff" },
];

for (const account of seedAccounts) {
  const { data, error } = await supabase.auth.admin.createUser({
    email: account.email,
    password: account.password,
    email_confirm: true,
    user_metadata: { role: account.role, full_name: account.full_name, username: account.username },
  });

  if (error) {
    if (error.message?.toLowerCase().includes("already been registered")) {
      console.log(`Skipped ${account.email} — already exists.`);
      continue;
    }
    console.error(`Failed to create ${account.email}:`, error.message);
    continue;
  }

  console.log(`Created ${account.email} (role: ${account.role}, id: ${data.user.id})`);
}

console.log("Done.");
