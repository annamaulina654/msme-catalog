import { createClient } from "@/lib/supabase/server";
import { urlSitus } from "@/lib/situs";

// US-27: sitemap.xml dibuat dari database setiap kali diminta, jadi produk dan kategori baru
// langsung masuk tanpa perlu deploy ulang. Produk nonaktif tidak ikut.
export const dynamic = "force-dynamic";

export default async function sitemap() {
  const dasar = urlSitus();
  const daftar = [
    { url: dasar, changeFrequency: "daily", priority: 1 },
    { url: `${dasar}/tentang`, changeFrequency: "monthly", priority: 0.4 },
  ];

  try {
    const supabase = createClient();
    const [produk, kategori] = await Promise.all([
      supabase.from("produk").select("id, created_at").eq("aktif", true).order("id", { ascending: true }),
      supabase.from("kategori").select("slug").order("slug", { ascending: true }),
    ]);

    if (produk.error) {
      console.error("Gagal membuat sitemap, kode:", produk.error.code ?? "tidak-diketahui");
    }
    for (const p of produk.data ?? []) {
      daftar.push({
        url: `${dasar}/produk/${p.id}`,
        lastModified: p.created_at ? new Date(p.created_at) : undefined,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }

    for (const k of kategori.data ?? []) {
      daftar.push({ url: `${dasar}/kategori/${k.slug}`, changeFrequency: "weekly", priority: 0.6 });
    }
  } catch (err) {
    console.error("Gagal membuat sitemap, jenis error:", err?.name ?? "tidak-diketahui");
  }

  return daftar;
}
