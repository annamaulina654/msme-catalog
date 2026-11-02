import { createClient } from "@/lib/supabase/server";

// Pembacaan data publik (koneksi server). Semua fungsi mengembalikan nilai kosong
// kalau terjadi error, supaya satu bagian yang bermasalah tidak merusak seluruh halaman.

export const UKURAN_HALAMAN = 9;
export const PILIHAN_URUTAN = [
  { nilai: "", label: "Urutan toko" },
  { nilai: "terbaru", label: "Terbaru" },
  { nilai: "termurah", label: "Termurah" },
  { nilai: "termahal", label: "Termahal" },
];

function catatError(konteks, error) {
  console.error(`${konteks}, kode:`, error?.code ?? error?.name ?? "tidak-diketahui");
}

// Karakter khusus pola LIKE (%, _, \) dibuat biasa supaya pencarian "50%" tidak cocok ke semuanya.
function amankanLike(teks) {
  return teks.replace(/[\\%_]/g, (c) => `\\${c}`);
}

// US-11, 15, 16: ubah parameter URL menjadi nilai yang aman dipakai.
export function bacaParameter(sp = {}) {
  const ambil = (k) => (Array.isArray(sp[k]) ? sp[k][0] : sp[k]) ?? "";
  const urut = String(ambil("urut"));
  const hal = Number.parseInt(String(ambil("hal")), 10);

  return {
    q: String(ambil("q")).trim().slice(0, 60),
    kategori: String(ambil("kategori")).trim().slice(0, 60),
    urut: PILIHAN_URUTAN.some((p) => p.nilai === urut) ? urut : "",
    hal: Number.isInteger(hal) && hal > 0 && hal < 100000 ? hal : 1,
  };
}

// US-11, 15, 16, 32, 47: daftar produk aktif dengan pencarian, urutan, dan halaman.
// Semua penyaringan, pengurutan, dan pembatasan jumlah dilakukan di query database.
export async function cariProduk({ q = "", kategori = "", urut = "", hal = 1, ukuran = UKURAN_HALAMAN } = {}) {
  const kosong = { produk: [], total: 0, halaman: hal, totalHalaman: 1, error: false, diluarJangkauan: false };

  try {
    const supabase = createClient();
    let query = supabase.from("produk").select("*", { count: "exact" }).eq("aktif", true);

    if (q) query = query.ilike("nama", `%${amankanLike(q)}%`);
    if (kategori) query = query.eq("kategori", kategori);

    if (urut === "termurah") {
      query = query.order("harga", { ascending: true }).order("id", { ascending: true });
    } else if (urut === "termahal") {
      query = query.order("harga", { ascending: false }).order("id", { ascending: true });
    } else if (urut === "terbaru") {
      query = query.order("created_at", { ascending: false }).order("id", { ascending: false });
    } else {
      query = query.order("urutan", { ascending: true }).order("id", { ascending: true });
    }

    const dari = (hal - 1) * ukuran;
    const { data, error, count } = await query.range(dari, dari + ukuran - 1);

    if (error) {
      // Nomor halaman melebihi jumlah data: biarkan halaman mengarahkan ke halaman pertama.
      if (error.code === "PGRST103") return { ...kosong, diluarJangkauan: true };
      catatError("Gagal memuat katalog", error);
      return { ...kosong, error: true };
    }

    const total = count ?? 0;
    return {
      ...kosong,
      produk: data ?? [],
      total,
      totalHalaman: Math.max(1, Math.ceil(total / ukuran)),
      diluarJangkauan: (data ?? []).length === 0 && hal > 1,
    };
  } catch (err) {
    catatError("Gagal memuat katalog", err);
    return { ...kosong, error: true };
  }
}

// Daftar kategori untuk filter dan form.
export async function ambilKategori() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from("kategori").select("id, nama, slug").order("nama", { ascending: true });
    if (error) {
      catatError("Gagal memuat kategori", error);
      return [];
    }
    return data ?? [];
  } catch (err) {
    catatError("Gagal memuat kategori", err);
    return [];
  }
}

export async function ambilKategoriBySlug(slug) {
  if (!/^[a-z0-9-]{1,80}$/.test(String(slug ?? ""))) return null;
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from("kategori").select("id, nama, slug").eq("slug", slug).maybeSingle();
    if (error) {
      catatError("Gagal memuat kategori", error);
      return null;
    }
    return data ?? null;
  } catch (err) {
    catatError("Gagal memuat kategori", err);
    return null;
  }
}

// US-17: produk lain dari kategori yang sama, tanpa produk yang sedang dibuka.
export async function ambilTerkait(produk, jumlah = 4) {
  if (!produk?.kategori) return [];
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("produk")
      .select("*")
      .eq("aktif", true)
      .eq("kategori", produk.kategori)
      .neq("id", produk.id)
      .order("urutan", { ascending: true })
      .order("id", { ascending: true })
      .limit(jumlah);
    if (error) {
      catatError("Gagal memuat produk terkait", error);
      return [];
    }
    return data ?? [];
  } catch (err) {
    catatError("Gagal memuat produk terkait", err);
    return [];
  }
}

// US-48: varian harga per ukuran.
export async function ambilVarian(produkId) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("varian")
      .select("id, nama, harga")
      .eq("produk_id", produkId)
      .order("urutan", { ascending: true })
      .order("id", { ascending: true });
    if (error) {
      catatError("Gagal memuat varian", error);
      return [];
    }
    return data ?? [];
  } catch (err) {
    catatError("Gagal memuat varian", err);
    return [];
  }
}

// US-38 dan US-39: ulasan yang ditampilkan dan rata-rata ratingnya
// (ulasan yang disembunyikan tidak ikut dihitung).
export async function ambilUlasan(produkId) {
  const kosong = { daftar: [], jumlah: 0, rata: 0 };
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("ulasan")
      .select("id, nama, rating, komentar, created_at")
      .eq("produk_id", produkId)
      .eq("tampil", true)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) {
      catatError("Gagal memuat ulasan", error);
      return kosong;
    }
    const semua = data ?? [];
    const rata = semua.length ? semua.reduce((n, u) => n + u.rating, 0) / semua.length : 0;
    return { daftar: semua.slice(0, 20), jumlah: semua.length, rata };
  } catch (err) {
    catatError("Gagal memuat ulasan", err);
    return kosong;
  }
}

// US-42: banner aktif terbaru.
export async function ambilBannerAktif() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("banner")
      .select("*")
      .eq("aktif", true)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) {
      catatError("Gagal memuat banner", error);
      return null;
    }
    return data ?? null;
  } catch (err) {
    catatError("Gagal memuat banner", err);
    return null;
  }
}

// Dipakai favorit, terakhir dilihat, dan perbandingan: produk aktif berdasarkan daftar id.
export async function ambilProdukByIds(ids) {
  const bersih = [...new Set((Array.isArray(ids) ? ids : []).map(Number))]
    .filter((n) => Number.isInteger(n) && n > 0)
    .slice(0, 50);
  if (bersih.length === 0) return [];

  try {
    const supabase = createClient();
    const { data, error } = await supabase.from("produk").select("*").eq("aktif", true).in("id", bersih);
    if (error) {
      catatError("Gagal memuat produk berdasarkan id", error);
      return [];
    }
    // Pertahankan urutan id yang diminta.
    const peta = new Map((data ?? []).map((p) => [p.id, p]));
    return bersih.map((id) => peta.get(id)).filter(Boolean);
  } catch (err) {
    catatError("Gagal memuat produk berdasarkan id", err);
    return [];
  }
}
