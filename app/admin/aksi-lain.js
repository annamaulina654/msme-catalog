"use server";

import { revalidatePath } from "next/cache";
import { ambilSesiAdmin, PESAN_BELUM_LOGIN } from "@/lib/sesi-admin";
import { createClient } from "@/lib/supabase/server";
import { catatLog } from "@/lib/log";
import { slugify } from "@/lib/slug";
import { uraiCsv } from "@/lib/csv";
import { idProduk, validasiProduk } from "@/lib/validasi-produk";

const PESAN_GAGAL = "Terjadi kesalahan. Coba lagi beberapa saat lagi.";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function catatError(konteks, error) {
  console.error(`${konteks}, kode:`, error?.code ?? error?.status ?? error?.name ?? "tidak-diketahui");
}

// ===== US-39: moderasi ulasan ==================================================

export async function aturTampilUlasan(prevState, formData) {
  const sesi = await ambilSesiAdmin();
  if (!sesi) return { error: PESAN_BELUM_LOGIN };

  const id = idProduk(formData?.get?.("id"));
  const tampil = formData?.get?.("tampil")?.toString() === "true";
  if (!id) return { error: "Ulasan tidak ditemukan." };

  try {
    const { data, error } = await sesi.supabase.from("ulasan").update({ tampil }).eq("id", id).select("produk_id");
    if (error || !data?.length) {
      if (error) catatError("Gagal mengubah status ulasan", error);
      return { error: "Gagal mengubah status ulasan." };
    }
    await catatLog(sesi, tampil ? "Tampilkan ulasan" : "Sembunyikan ulasan", `ulasan #${id}`);
    revalidatePath(`/produk/${data[0].produk_id}`);
  } catch (err) {
    catatError("Gagal mengubah status ulasan", err);
    return { error: "Gagal mengubah status ulasan." };
  }

  revalidatePath("/admin/ulasan");
  return { success: tampil ? "Ulasan ditampilkan." : "Ulasan disembunyikan." };
}

export async function hapusUlasan(prevState, formData) {
  const sesi = await ambilSesiAdmin();
  if (!sesi) return { error: PESAN_BELUM_LOGIN };

  const id = idProduk(formData?.get?.("id"));
  if (!id) return { error: "Ulasan tidak ditemukan." };

  try {
    const { data, error } = await sesi.supabase.from("ulasan").delete().eq("id", id).select("produk_id");
    if (error || !data?.length) {
      if (error) catatError("Gagal menghapus ulasan", error);
      return { error: "Gagal menghapus ulasan." };
    }
    await catatLog(sesi, "Hapus ulasan", `ulasan #${id}`);
    revalidatePath(`/produk/${data[0].produk_id}`);
  } catch (err) {
    catatError("Gagal menghapus ulasan", err);
    return { error: "Gagal menghapus ulasan." };
  }

  revalidatePath("/admin/ulasan");
  return { success: "Ulasan dihapus." };
}

// ===== US-44: kelola akun admin ================================================
// Memakai Auth Admin API dengan kunci rahasia, hanya di server. Pendaftaran umum tetap dimatikan,
// jadi semua akun yang ada di Supabase Auth adalah admin.

export async function tambahAdmin(prevState, formData) {
  const sesi = await ambilSesiAdmin();
  if (!sesi) return { error: PESAN_BELUM_LOGIN };

  const email = (formData?.get?.("email")?.toString() ?? "").trim().toLowerCase();
  const password = formData?.get?.("password")?.toString() ?? "";
  const errors = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 120) errors.email = "Email tidak valid.";
  if (password.length < 8 || password.length > 72) errors.password = "Password harus 8 sampai 72 karakter.";
  if (Object.keys(errors).length) {
    return { error: "Periksa kembali isian yang ditandai.", errors, nilai: { email } };
  }

  try {
    const admin = createClient();
    const { error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
    if (error) {
      if (error.code === "email_exists" || error.status === 422) {
        return { error: "Email itu sudah terdaftar.", nilai: { email } };
      }
      if (error.code === "weak_password") {
        return { error: "Password terlalu lemah. Gunakan kombinasi yang lebih panjang.", nilai: { email } };
      }
      catatError("Gagal menambah admin", error);
      return { error: PESAN_GAGAL, nilai: { email } };
    }
    await catatLog(sesi, "Tambah admin", email);
  } catch (err) {
    catatError("Gagal menambah admin", err);
    return { error: PESAN_GAGAL, nilai: { email } };
  }

  revalidatePath("/admin/akun");
  return { success: `Admin ${email} ditambahkan.` };
}

export async function aturBlokAdmin(prevState, formData) {
  const sesi = await ambilSesiAdmin();
  if (!sesi) return { error: PESAN_BELUM_LOGIN };

  const id = formData?.get?.("id")?.toString() ?? "";
  const blokir = formData?.get?.("blokir")?.toString() === "true";
  if (!UUID.test(id)) return { error: "Akun tidak ditemukan." };
  if (id === sesi.user.id) return { error: "Anda tidak bisa menonaktifkan akun Anda sendiri." };

  try {
    const admin = createClient();
    const { data, error } = await admin.auth.admin.updateUserById(id, { ban_duration: blokir ? "876000h" : "none" });
    if (error) {
      catatError("Gagal mengubah status admin", error);
      return { error: PESAN_GAGAL };
    }
    await catatLog(sesi, blokir ? "Nonaktifkan admin" : "Aktifkan admin", data?.user?.email ?? id);
  } catch (err) {
    catatError("Gagal mengubah status admin", err);
    return { error: PESAN_GAGAL };
  }

  revalidatePath("/admin/akun");
  return { success: blokir ? "Akun dinonaktifkan." : "Akun diaktifkan." };
}

export async function hapusAdmin(prevState, formData) {
  const sesi = await ambilSesiAdmin();
  if (!sesi) return { error: PESAN_BELUM_LOGIN };

  const id = formData?.get?.("id")?.toString() ?? "";
  if (!UUID.test(id)) return { error: "Akun tidak ditemukan." };
  if (id === sesi.user.id) return { error: "Anda tidak bisa menghapus akun Anda sendiri." };

  try {
    const admin = createClient();
    const { data: pengguna } = await admin.auth.admin.getUserById(id);
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) {
      catatError("Gagal menghapus admin", error);
      return { error: PESAN_GAGAL };
    }
    await catatLog(sesi, "Hapus admin", pengguna?.user?.email ?? id);
  } catch (err) {
    catatError("Gagal menghapus admin", err);
    return { error: PESAN_GAGAL };
  }

  revalidatePath("/admin/akun");
  return { success: "Akun dihapus." };
}

// ===== US-46: impor produk dari CSV ============================================

const BATAS_BERKAS = 1_048_576; // 1 MB
const BATAS_BARIS = 500;
const KOLOM_BOLEH = ["nama", "harga", "kategori", "foto_url", "deskripsi", "stok", "harga_diskon", "badge"];

export async function imporProduk(prevState, formData) {
  const sesi = await ambilSesiAdmin();
  if (!sesi) return { error: PESAN_BELUM_LOGIN };

  const berkas = formData?.get?.("berkas");
  if (!berkas || typeof berkas === "string" || typeof berkas.text !== "function" || berkas.size === 0) {
    return { error: "Pilih file CSV terlebih dahulu." };
  }
  if (berkas.size > BATAS_BERKAS) return { error: "Ukuran file CSV maksimal 1 MB." };
  if (!/\.csv$/i.test(berkas.name ?? "")) return { error: "File harus berekstensi .csv." };

  const baris = uraiCsv(await berkas.text());
  if (baris.length < 2) return { error: "File kosong atau hanya berisi judul kolom." };

  const judul = baris[0].map((k) => k.trim().toLowerCase());
  if (!judul.includes("nama") || !judul.includes("harga")) {
    return { error: 'Baris pertama harus berisi judul kolom, minimal "nama" dan "harga".' };
  }

  const dataBaris = baris.slice(1);
  if (dataBaris.length > BATAS_BARIS) {
    return { error: `Maksimal ${BATAS_BARIS} baris produk per impor. File Anda berisi ${dataBaris.length}.` };
  }

  // Validasi setiap baris dengan aturan yang sama seperti form tambah produk.
  const valid = [];
  const gagal = [];
  dataBaris.forEach((sel, i) => {
    const nomor = i + 2; // nomor baris di file (judul = baris 1)
    const rekaman = {};
    judul.forEach((kolom, j) => {
      if (KOLOM_BOLEH.includes(kolom)) rekaman[kolom] = (sel[j] ?? "").trim();
    });
    if (!rekaman.stok) rekaman.stok = "10";

    const hasil = validasiProduk({ get: (k) => rekaman[k] ?? "" });
    const pesan = Object.values(hasil.errors);
    if (pesan.length > 0) {
      gagal.push({ baris: nomor, pesan: pesan.join(" ") });
    } else {
      valid.push(hasil.data);
    }
  });

  let berhasil = 0;
  if (valid.length > 0) {
    try {
      // Kategori baru dari file otomatis dibuat supaya muncul di menu Kategori.
      const namaKategori = [...new Set(valid.map((p) => p.kategori).filter(Boolean))];
      const barisKategori = namaKategori
        .map((nama) => ({ nama, slug: slugify(nama) }))
        .filter((k) => k.slug);
      if (barisKategori.length > 0) {
        const { error: errorKategori } = await sesi.supabase
          .from("kategori")
          .upsert(barisKategori, { onConflict: "nama", ignoreDuplicates: true });
        if (errorKategori) catatError("Gagal membuat kategori dari impor", errorKategori);
      }

      const { data: terakhir } = await sesi.supabase
        .from("produk")
        .select("urutan")
        .order("urutan", { ascending: false })
        .limit(1)
        .maybeSingle();
      const awal = (terakhir?.urutan ?? -1) + 1;

      // Semua baris valid disimpan sekaligus.
      const { error } = await sesi.supabase
        .from("produk")
        .insert(valid.map((p, i) => ({ ...p, urutan: awal + i })));
      if (error) {
        catatError("Gagal mengimpor produk", error);
        return { error: "Produk belum bisa disimpan ke database. Tidak ada produk yang masuk. Coba lagi nanti." };
      }
      berhasil = valid.length;
      await catatLog(sesi, "Impor CSV", `${berhasil} produk masuk, ${gagal.length} baris ditolak`);
    } catch (err) {
      catatError("Gagal mengimpor produk", err);
      return { error: "Produk belum bisa disimpan ke database. Tidak ada produk yang masuk. Coba lagi nanti." };
    }
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return {
    ringkasan: { berhasil, gagal: gagal.length, kesalahan: gagal.slice(0, 50), terpotong: gagal.length > 50 },
  };
}
