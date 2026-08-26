// One-time seed script — creates 5 additional staff accounts for testing
// staff activity tracking and the audit log. Requires
// SUPABASE_SERVICE_ROLE_KEY in .env (never commit this key).
//
// Usage:
//   node scripts/seed-staff.mjs

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
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env — fill in the service_role key from Supabase Dashboard -> Project Settings -> API before running this script.",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const seedAccounts = [
  { email: "priya.staff@gmail.com", password: "123456", role: "staff", full_name: "Priya Ramesh", username: "priya" },
  { email: "arjun.staff@gmail.com", password: "123456", role: "staff", full_name: "Arjun Menon", username: "arjun" },
  { email: "sanjay.staff@gmail.com", password: "123456", role: "staff", full_name: "Sanjay Iyer", username: "sanjay" },
  { email: "divya.staff@gmail.com", password: "123456", role: "staff", full_name: "Divya Nair", username: "divya" },
  { email: "karthik.staff@gmail.com", password: "123456", role: "staff", full_name: "Karthik Raja", username: "karthik" },
];

const created = [];

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
      const { data: existing } = await supabase.from("profiles").select("id").eq("username", account.username).single();
      if (existing) created.push({ ...account, id: existing.id });
      continue;
    }
    console.error(`Failed to create ${account.email}:`, error.message);
    continue;
  }

  console.log(`Created ${account.email} (role: ${account.role}, id: ${data.user.id})`);
  created.push({ ...account, id: data.user.id });
}

console.log("\n--- IDs for seeding job-card activity ---");
console.log(JSON.stringify(created.map((c) => ({ username: c.username, id: c.id })), null, 2));
console.log("Done.");
