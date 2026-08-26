import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — check your .env file.",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export const STAGE_LABELS = {
  raw_material: "Raw material",
  machining: "Machining",
  teeth_cutting: "Teeth cutting",
  pre_inspection: "Pre-inspection",
  hardening: "Hardening",
  blackening: "Blackening",
  bore_grinding: "Bore grinding",
  keyway_cutting: "Keyway cutting",
  final_inspection: "Final inspection",
  packaging_dispatch: "Packaging & dispatch",
};

export const STAGE_STATUSES = [
  "acquired",
  "on_process",
  "completed",
  "not_completed",
];

export const STATUS_LABELS = {
  acquired: "Acquired",
  on_process: "On-process",
  completed: "Completed",
  not_completed: "Not completed",
};
