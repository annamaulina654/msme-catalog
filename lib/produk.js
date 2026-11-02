import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { idProduk } from "@/lib/validasi-produk";

// Ambil satu produk untuk pengunjung (koneksi server). Hasilnya dibagi dalam satu
// permintaan, jadi generateMetadata dan halaman detail tidak query dua kali.
// Mengembalikan null kalau id tidak valid, produk tidak ada, atau terjadi error.
export const ambilProduk = cache(async (idMentah) => {
  const id = idProduk(idMentah);
  if (!id) return null;

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("produk")
      .select("*")
      .eq("id", id)
      .eq("aktif", true) // US-32: produk nonaktif dianggap tidak ada
      .maybeSingle();

    if (error) {
      console.error("Gagal memuat produk, kode:", error.code ?? "tidak-diketahui");
      return null;
    }
    return data ?? null;
  } catch (err) {
    console.error("Gagal memuat produk, jenis error:", err?.name ?? "tidak-diketahui");
    return null;
  }
});
