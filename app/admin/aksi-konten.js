"use server";

import { revalidatePath } from "next/cache";
import { ambilSesiAdmin, PESAN_BELUM_LOGIN } from "@/lib/sesi-admin";
import { catatLog } from "@/lib/log";
import { slugify } from "@/lib/slug";
import { unggahFoto } from "@/lib/foto";
import { cekAlamatFoto, idProduk } from "@/lib/validasi-produk";
import { normalisasiNomorWa } from "@/lib/nomor-wa";

const PESAN_GAGAL = "Terjadi kesalahan. Coba lagi beberapa saat lagi.";

function catatError(konteks, error) {
  console.error(`${konteks}, kode:`, error?.code ?? error?.name ?? "tidak-diketahui");
}

function segarkanPublik() {
  revalidatePath("/");
  revalidatePath("/admin");
}

// ===== US-31: kategori ========================================================

function bacaNamaKategori(formData) {
  const nama = (formData?.get?.("nama")?.toString() ?? "").replace(/\s+/g, " ").trim();
  if (nama.length < 2 || nama.length > 40) {
    return { error: "Nama kategori harus 2 sampai 40 karakter." };
  }
  const slug = slugify(nama);
  if (!slug) {
    return { error: "Nama kategori harus berisi huruf atau angka." };
  }
  return { nama, slug };
}

export async function tambahKategori(prevState, formData) {
  const sesi = await ambilSesiAdmin();
  if (!sesi) return { error: PESAN_BELUM_LOGIN };

  const bacaan = bacaNamaKategori(formData);
  if (bacaan.error) return { error: bacaan.error };

  try {
    const { error } = await sesi.supabase.from("kategori").insert({ nama: bacaan.nama, slug: bacaan.slug });
    if (error) {
      if (error.code === "23505") return { error: "Kategori dengan nama itu sudah ada." };
      catatError("Gagal menambah kategori", error);
      return { error: PESAN_GAGAL };
    }
    await catatLog(sesi, "Tambah kategori", bacaan.nama);
  } catch (err) {
    catatError("Gagal menambah kategori", err);
    return { error: PESAN_GAGAL };
  }

  segarkanPublik();
  revalidatePath("/admin/kategori");
  return { success: `Kategori "${bacaan.nama}" ditambahkan.` };
}

export async function ubahKategori(prevState, formData) {
  const sesi = await ambilSesiAdmin();
  if (!sesi) return { error: PESAN_BELUM_LOGIN };

  const id = idProduk(formData?.get?.("id"));
  const bacaan = bacaNamaKategori(formData);
  if (!id) return { error: "Kategori tidak ditemukan." };
  if (bacaan.error) return { error: bacaan.error };

  try {
    const { data: lama } = await sesi.supabase.from("kategori").select("nama").eq("id", id).maybeSingle();
    if (!lama) return { error: "Kategori tidak ditemukan." };

    const { error } = await sesi.supabase
      .from("kategori")
      .update({ nama: bacaan.nama, slug: bacaan.slug })
      .eq("id", id);
    if (error) {
      if (error.code === "23505") return { error: "Kategori dengan nama itu sudah ada." };
      catatError("Gagal mengubah kategori", error);
      return { error: PESAN_GAGAL };
    }

    // Produk yang memakai nama lama ikut dipindahkan ke nama baru.
    if (lama.nama !== bacaan.nama) {
      const { error: errorProduk } = await sesi.supabase
        .from("produk")
        .update({ kategori: bacaan.nama })
        .eq("kategori", lama.nama);
      if (errorProduk) {
        catatError("Gagal memperbarui kategori produk", errorProduk);
        return { error: "Nama kategori berubah, tetapi sebagian produk belum ikut berubah. Ulangi sekali lagi." };
      }
    }

    await catatLog(sesi, "Ubah kategori", `${lama.nama} -> ${bacaan.nama}`);
  } catch (err) {
    catatError("Gagal mengubah kategori", err);
    return { error: PESAN_GAGAL };
  }

  segarkanPublik();
  revalidatePath("/admin/kategori");
  return { success: "Kategori diperbarui." };
}

export async function hapusKategori(prevState, formData) {
  const sesi = await ambilSesiAdmin();
  if (!sesi) return { error: PESAN_BELUM_LOGIN };

  const id = idProduk(formData?.get?.("id"));
  if (!id) return { error: "Kategori tidak ditemukan." };

  try {
    const { data: kategori } = await sesi.supabase.from("kategori").select("nama").eq("id", id).maybeSingle();
    if (!kategori) return { error: "Kategori tidak ditemukan." };

    // Kategori yang masih dipakai produk ditolak, supaya tidak ada produk yang kehilangan kategori.
    const { count, error: errorHitung } = await sesi.supabase
      .from("produk")
      .select("id", { count: "exact", head: true })
      .eq("kategori", kategori.nama);
    if (errorHitung) {
      catatError("Gagal menghitung produk kategori", errorHitung);
      return { error: PESAN_GAGAL };
    }
    if ((count ?? 0) > 0) {
      return { error: `Kategori masih dipakai ${count} produk. Pindahkan produknya ke kategori lain dulu.` };
    }

    const { error } = await sesi.supabase.from("kategori").delete().eq("id", id);
    if (error) {
      catatError("Gagal menghapus kategori", error);
      return { error: PESAN_GAGAL };
    }
    await catatLog(sesi, "Hapus kategori", kategori.nama);
  } catch (err) {
    catatError("Gagal menghapus kategori", err);
    return { error: PESAN_GAGAL };
  }

  segarkanPublik();
  revalidatePath("/admin/kategori");
  return { success: "Kategori dihapus." };
}

// ===== US-48: varian harga per ukuran ==========================================

export async function tambahVarian(produkId, prevState, formData) {
  const sesi = await ambilSesiAdmin();
  if (!sesi) return { error: PESAN_BELUM_LOGIN };

  const id = idProduk(produkId);
  if (!id) return { error: "Produk tidak ditemukan." };

  const nama = (formData?.get?.("nama")?.toString() ?? "").replace(/\s+/g, " ").trim();
  const hargaTeks = (formData?.get?.("harga")?.toString() ?? "").trim();
  const errors = {};
  if (!nama || nama.length > 40) errors.nama = "Nama varian wajib diisi, maksimal 40 karakter.";
  if (!/^\d+$/.test(hargaTeks) || Number(hargaTeks) > 1_000_000_000) {
    errors.harga = "Harga harus berupa angka bulat, tanpa titik atau koma.";
  }
  if (Object.keys(errors).length) {
    return { error: "Periksa kembali isian yang ditandai.", errors, nilai: { nama, harga: hargaTeks } };
  }

  try {
    const { count } = await sesi.supabase
      .from("varian")
      .select("id", { count: "exact", head: true })
      .eq("produk_id", id);
    if ((count ?? 0) >= 10) {
      return { error: "Satu produk maksimal punya 10 varian.", nilai: { nama, harga: hargaTeks } };
    }

    const { error } = await sesi.supabase
      .from("varian")
      .insert({ produk_id: id, nama, harga: Number(hargaTeks), urutan: count ?? 0 });
    if (error) {
      catatError("Gagal menambah varian", error);
      return { error: PESAN_GAGAL, nilai: { nama, harga: hargaTeks } };
    }
    await catatLog(sesi, "Tambah varian", `${nama} (produk #${id})`);
  } catch (err) {
    catatError("Gagal menambah varian", err);
    return { error: PESAN_GAGAL, nilai: { nama, harga: hargaTeks } };
  }

  revalidatePath(`/admin/produk/${id}/varian`);
  revalidatePath(`/produk/${id}`);
  return { success: `Varian "${nama}" ditambahkan.` };
}

export async function hapusVarian(prevState, formData) {
  const sesi = await ambilSesiAdmin();
  if (!sesi) return { error: PESAN_BELUM_LOGIN };

  const id = idProduk(formData?.get?.("id"));
  if (!id) return { error: "Varian tidak ditemukan." };

  try {
    const { data, error } = await sesi.supabase.from("varian").delete().eq("id", id).select("id, nama, produk_id");
    if (error) {
      catatError("Gagal menghapus varian", error);
      return { error: PESAN_GAGAL };
    }
    if (!data || data.length === 0) return { error: "Varian tidak ditemukan atau sudah dihapus." };

    await catatLog(sesi, "Hapus varian", `${data[0].nama} (produk #${data[0].produk_id})`);
    revalidatePath(`/admin/produk/${data[0].produk_id}/varian`);
    revalidatePath(`/produk/${data[0].produk_id}`);
  } catch (err) {
    catatError("Gagal menghapus varian", err);
    return { error: PESAN_GAGAL };
  }

  return { success: "Varian dihapus." };
}

// ===== US-42: banner promo =====================================================

function cekTautan(tautan) {
  if (!tautan) return null;
  if (tautan.length > 300) return "Tautan terlalu panjang.";
  const lokal = tautan.startsWith("/") && !tautan.startsWith("//");
  if (!lokal && !tautan.startsWith("https://")) return "Tautan harus diawali https:// atau / (contoh: /kategori/camilan).";
  return null;
}

export async function simpanBanner(prevState, formData) {
  const sesi = await ambilSesiAdmin();
  if (!sesi) return { error: PESAN_BELUM_LOGIN };

  const ambil = (k) => formData?.get?.(k)?.toString().trim() ?? "";
  const idMentah = ambil("id");
  const id = idMentah ? idProduk(idMentah) : null;
  const nilai = {
    id: idMentah,
    judul: ambil("judul"),
    teks: ambil("teks"),
    gambar_url: ambil("gambar_url"),
    tautan: ambil("tautan"),
    aktif: formData?.get?.("aktif") === "on",
  };

  const errors = {};
  if (!nilai.judul || nilai.judul.length > 80) errors.judul = "Judul wajib diisi, maksimal 80 karakter.";
  if (nilai.teks.length > 200) errors.teks = "Teks maksimal 200 karakter.";
  if (nilai.gambar_url) {
    const pesan = cekAlamatFoto(nilai.gambar_url);
    if (pesan) errors.gambar_url = pesan;
  }
  const pesanTautan = cekTautan(nilai.tautan);
  if (pesanTautan) errors.tautan = pesanTautan;
  if (idMentah && !id) return { error: "Banner tidak ditemukan." };

  const gambar = Object.keys(errors).length ? { kosong: true } : await unggahFoto(formData.get("gambar_file"));
  if (gambar.error) errors.gambar_file = gambar.error;
  if (Object.keys(errors).length) {
    return { error: "Periksa kembali isian yang ditandai.", errors, nilai };
  }

  const data = {
    judul: nilai.judul,
    teks: nilai.teks || null,
    gambar_url: gambar.url ?? (nilai.gambar_url || null),
    tautan: nilai.tautan || null,
    aktif: nilai.aktif,
    updated_at: new Date().toISOString(),
  };

  try {
    const { error } = id
      ? await sesi.supabase.from("banner").update(data).eq("id", id)
      : await sesi.supabase.from("banner").insert(data);
    if (error) {
      catatError("Gagal menyimpan banner", error);
      return { error: PESAN_GAGAL, nilai };
    }
    await catatLog(sesi, id ? "Ubah banner" : "Tambah banner", data.judul);
  } catch (err) {
    catatError("Gagal menyimpan banner", err);
    return { error: PESAN_GAGAL, nilai };
  }

  segarkanPublik();
  revalidatePath("/admin/banner");
  return { success: id ? "Banner diperbarui." : "Banner dibuat." };
}

export async function aturAktifBanner(prevState, formData) {
  const sesi = await ambilSesiAdmin();
  if (!sesi) return { error: PESAN_BELUM_LOGIN };

  const id = idProduk(formData?.get?.("id"));
  const aktif = formData?.get?.("aktif")?.toString() === "true";
  if (!id) return { error: "Banner tidak ditemukan." };

  try {
    const { data, error } = await sesi.supabase
      .from("banner")
      .update({ aktif, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("judul");
    if (error || !data?.length) {
      if (error) catatError("Gagal mengubah status banner", error);
      return { error: "Gagal mengubah status banner." };
    }
    await catatLog(sesi, aktif ? "Aktifkan banner" : "Nonaktifkan banner", data[0].judul);
  } catch (err) {
    catatError("Gagal mengubah status banner", err);
    return { error: "Gagal mengubah status banner." };
  }

  segarkanPublik();
  revalidatePath("/admin/banner");
  return { success: aktif ? "Banner diaktifkan." : "Banner dinonaktifkan." };
}

export async function hapusBanner(prevState, formData) {
  const sesi = await ambilSesiAdmin();
  if (!sesi) return { error: PESAN_BELUM_LOGIN };

  const id = idProduk(formData?.get?.("id"));
  if (!id) return { error: "Banner tidak ditemukan." };

  try {
    const { data, error } = await sesi.supabase.from("banner").delete().eq("id", id).select("judul");
    if (error || !data?.length) {
      if (error) catatError("Gagal menghapus banner", error);
      return { error: "Gagal menghapus banner." };
    }
    await catatLog(sesi, "Hapus banner", data[0].judul);
  } catch (err) {
    catatError("Gagal menghapus banner", err);
    return { error: "Gagal menghapus banner." };
  }

  segarkanPublik();
  revalidatePath("/admin/banner");
  return { success: "Banner dihapus." };
}

// ===== US-43: pengaturan toko ==================================================

export async function simpanPengaturan(prevState, formData) {
  const sesi = await ambilSesiAdmin();
  if (!sesi) return { error: PESAN_BELUM_LOGIN };

  const ambil = (k) => formData?.get?.(k)?.toString().trim() ?? "";
  const nilai = {
    nama: ambil("nama"),
    tagline: ambil("tagline"),
    nomor_whatsapp: ambil("nomor_whatsapp"),
    alamat: ambil("alamat"),
    jam_buka: ambil("jam_buka"),
    profil: ambil("profil"),
  };

  const errors = {};
  if (!nilai.nama || nilai.nama.length > 60) errors.nama = "Nama toko wajib diisi, maksimal 60 karakter.";
  if (nilai.tagline.length > 160) errors.tagline = "Tagline maksimal 160 karakter.";
  const nomor = normalisasiNomorWa(nilai.nomor_whatsapp);
  if (!nomor) {
    errors.nomor_whatsapp = "Nomor tidak valid. Contoh: 081234567890 atau 6281234567890.";
  }
  if (nilai.alamat.length > 200) errors.alamat = "Alamat maksimal 200 karakter.";
  if (nilai.jam_buka.length > 80) errors.jam_buka = "Jam buka maksimal 80 karakter.";
  if (nilai.profil.length > 2000) errors.profil = "Profil maksimal 2000 karakter.";
  if (Object.keys(errors).length) {
    return { error: "Periksa kembali isian yang ditandai.", errors, nilai };
  }

  try {
    const { error } = await sesi.supabase.from("pengaturan_toko").upsert({
      id: 1,
      nama: nilai.nama,
      tagline: nilai.tagline || null,
      nomor_whatsapp: nomor,
      alamat: nilai.alamat || null,
      jam_buka: nilai.jam_buka || null,
      profil: nilai.profil || null,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      catatError("Gagal menyimpan pengaturan", error);
      return { error: PESAN_GAGAL, nilai };
    }
    await catatLog(sesi, "Ubah pengaturan toko", nilai.nama);
  } catch (err) {
    catatError("Gagal menyimpan pengaturan", err);
    return { error: PESAN_GAGAL, nilai };
  }

  revalidatePath("/", "layout");
  return { success: "Pengaturan disimpan.", nilai: { ...nilai, nomor_whatsapp: nomor } };
}
