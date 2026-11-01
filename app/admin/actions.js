"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { cekBatas, resetBatas, teksTunggu } from "@/lib/rate-limit";

async function ambilIp() {
  const daftarHeader = await headers();
  const diteruskan = daftarHeader.get("x-forwarded-for");
  if (diteruskan) return diteruskan.split(",")[0].trim();
  return daftarHeader.get("x-real-ip") || "tidak-dikenal";
}

export async function login(prevState, formData) {
  const data = formData instanceof FormData ? formData : prevState;
  const email = data?.get?.("email")?.toString()?.trim() || "";
  const password = data?.get?.("password")?.toString() || "";

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  // K-12: batasi percobaan login. Per alamat IP + email (5x) dan per IP saja (20x)
  // dalam 15 menit.
  const ip = await ambilIp();
  const kunciEmail = `login:${ip}:${email.toLowerCase()}`;
  const kunciIp = `login-ip:${ip}`;

  const batasEmail = cekBatas(kunciEmail, { maks: 5 });
  const batasIp = cekBatas(kunciIp, { maks: 20 });
  if (!batasEmail.diizinkan || !batasIp.diizinkan) {
    return { error: teksTunggu(Math.max(batasEmail.tungguDetik ?? 0, batasIp.tungguDetik ?? 0)) };
  }

  let errorToReturn = null;
  try {
    const supabase = await createAdminClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // K-9: jangan teruskan pesan mentah dari Supabase ke pengunjung.
      errorToReturn =
        error.code === "invalid_credentials" || error.message === "Invalid login credentials"
          ? "Email atau password salah."
          : "Login gagal. Coba lagi beberapa saat lagi.";
    }
  } catch {
    errorToReturn = "Terjadi kesalahan saat memproses login. Coba lagi beberapa saat lagi.";
  }

  if (errorToReturn) {
    return { error: errorToReturn };
  }

  resetBatas(kunciEmail);
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

export async function gantiPassword(prevState, formData) {
  const data = formData instanceof FormData ? formData : prevState;
  const passwordBaru = data?.get?.("password_baru")?.toString() || "";
  const konfirmasiPassword = data?.get?.("konfirmasi_password")?.toString() || "";

  if (!passwordBaru || passwordBaru.length < 8) {
    return { error: "Password baru minimal 8 karakter." };
  }

  if (passwordBaru !== konfirmasiPassword) {
    return { error: "Password baru dan konfirmasi password tidak cocok." };
  }

  try {
    const supabase = await createAdminClient();

    // Pastikan admin sedang login sebelum mengubah password
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: "Anda harus login terlebih dahulu." };
    }

    // K-12: batasi ganti password, 5x per 15 menit per akun.
    const batas = cekBatas(`password:${user.id}`, { maks: 5 });
    if (!batas.diizinkan) {
      return { error: teksTunggu(batas.tungguDetik) };
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: passwordBaru,
    });

    if (updateError) {
      // K-9: pesan dibuat sendiri, bukan diteruskan mentah dari Supabase.
      if (updateError.code === "same_password") {
        return { error: "Password baru harus berbeda dari password lama." };
      }
      if (updateError.code === "weak_password") {
        return { error: "Password terlalu lemah. Gunakan kombinasi yang lebih panjang." };
      }
      return { error: "Gagal mengganti password. Coba lagi beberapa saat lagi." };
    }

    return { success: "Password berhasil diganti." };
  } catch {
    return { error: "Terjadi kesalahan saat mengganti password. Coba lagi beberapa saat lagi." };
  }
}
