"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { cekBatas, resetBatas, teksTunggu } from "@/lib/rate-limit";
import { validasiProduk, idProduk } from "@/lib/validasi-produk";

// Setiap aksi yang mengubah data wajib memanggil ini lebih dulu.
// Mengembalikan koneksi sesi admin (RLS tetap berlaku) atau null kalau belum login.
async function ambilSesiAdmin() {
  try {
    const supabase = await createAdminClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) return null;
    return { supabase, user };
  } catch {
    return null;
  }
}

const PESAN_BELUM_LOGIN = "Anda harus login terlebih dahulu.";
const PESAN_GAGAL_SIMPAN = "Gagal menyimpan produk. Coba lagi beberapa saat lagi.";

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

// US-08: tambah produk.
export async function tambahProduk(prevState, formData) {
  const sesi = await ambilSesiAdmin();
  if (!sesi) {
    return { error: PESAN_BELUM_LOGIN };
  }

  const { nilai, data, error: pesanValidasi } = validasiProduk(formData);
  if (pesanValidasi) {
    return { error: pesanValidasi, nilai };
  }

  try {
    const { error } = await sesi.supabase.from("produk").insert(data);

    if (error) {
      console.error("Gagal menambah produk, kode:", error.code ?? "tidak-diketahui");
      return { error: PESAN_GAGAL_SIMPAN, nilai };
    }
  } catch (err) {
    console.error("Gagal menambah produk, jenis error:", err?.name ?? "tidak-diketahui");
    return { error: PESAN_GAGAL_SIMPAN, nilai };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}

// US-09: ubah produk. `id` diisi lewat bind() di halaman, lalu diperiksa ulang di sini.
export async function ubahProduk(id, prevState, formData) {
  const sesi = await ambilSesiAdmin();
  if (!sesi) {
    return { error: PESAN_BELUM_LOGIN };
  }

  const idValid = idProduk(id);
  if (!idValid) {
    return { error: "Produk tidak ditemukan." };
  }

  const { nilai, data, error: pesanValidasi } = validasiProduk(formData);
  if (pesanValidasi) {
    return { error: pesanValidasi, nilai };
  }

  try {
    // select("id") supaya ketahuan kalau tidak ada baris yang berubah (id salah atau sudah dihapus).
    const { data: terubah, error } = await sesi.supabase
      .from("produk")
      .update(data)
      .eq("id", idValid)
      .select("id");

    if (error) {
      console.error("Gagal mengubah produk, kode:", error.code ?? "tidak-diketahui");
      return { error: PESAN_GAGAL_SIMPAN, nilai };
    }
    if (!terubah || terubah.length === 0) {
      return { error: "Produk tidak ditemukan atau sudah dihapus.", nilai };
    }
  } catch (err) {
    console.error("Gagal mengubah produk, jenis error:", err?.name ?? "tidak-diketahui");
    return { error: PESAN_GAGAL_SIMPAN, nilai };
  }

  revalidatePath("/");
  revalidatePath(`/produk/${idValid}`);
  revalidatePath("/admin");
  redirect("/admin");
}

// US-10: hapus produk. Konfirmasi ditanyakan di browser (components/TombolHapus.jsx);
// pemeriksaan login yang sebenarnya tetap di sini, di server.
export async function hapusProduk(prevState, formData) {
  const sesi = await ambilSesiAdmin();
  if (!sesi) {
    return { error: PESAN_BELUM_LOGIN };
  }

  const id = idProduk(formData?.get?.("id"));
  if (!id) {
    return { error: "Produk tidak ditemukan." };
  }

  try {
    const { data: terhapus, error } = await sesi.supabase
      .from("produk")
      .delete()
      .eq("id", id)
      .select("id");

    if (error) {
      console.error("Gagal menghapus produk, kode:", error.code ?? "tidak-diketahui");
      return { error: "Gagal menghapus produk. Coba lagi beberapa saat lagi." };
    }
    if (!terhapus || terhapus.length === 0) {
      return { error: "Produk tidak ditemukan atau sudah dihapus." };
    }
  } catch (err) {
    console.error("Gagal menghapus produk, jenis error:", err?.name ?? "tidak-diketahui");
    return { error: "Gagal menghapus produk. Coba lagi beberapa saat lagi." };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return { success: "Produk dihapus." };
}
