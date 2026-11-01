import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createClient() {
  let supabaseUrl = process.env.SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error(
      "SUPABASE_URL dan SUPABASE_SECRET_KEY harus diisi di environment variable."
    );
  }

  // Bersihkan URL jika ada trailing slash atau /rest/v1
  supabaseUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");

  return createSupabaseClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export const createServerClient = createClient;
export const buatKoneksiServer = createClient;

