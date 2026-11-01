"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

export async function login(prevState, formData) {
  const data = formData instanceof FormData ? formData : prevState;
  const email = data?.get?.("email")?.toString()?.trim() || "";
  const password = data?.get?.("password")?.toString() || "";

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  let errorToReturn = null;
  try {
    const supabase = await createAdminClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      errorToReturn =
        error.message === "Invalid login credentials"
          ? "Email atau password salah."
          : error.message;
    }
  } catch (err) {
    errorToReturn = err.message || "Terjadi kesalahan saat memproses login.";
  }

  if (errorToReturn) {
    return { error: errorToReturn };
  }

  redirect("/admin");
}

export async function logout() {
  try {
    const supabase = await createAdminClient();
    await supabase.auth.signOut();
  } catch {
    // Abaikan jika sudah tidak ada sesi aktif
  }

  redirect("/admin/login");
}

