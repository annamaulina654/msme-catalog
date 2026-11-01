import { createClient } from "@/lib/supabase/server";
import { urlSitus } from "@/lib/situs";

// US-27: sitemap.xml dibuat dari database setiap kali diminta, jadi produk baru
// langsung masuk tanpa perlu deploy ulang.
export const dynamic = "force-dynamic";

export default async function sitemap() {
  const dasar = urlSitus();
  const daftar = [{ url: dasar, changeFrequency: "daily", priority: 1 }];

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("produk")
      .select("id, created_at")
      .order("id", { ascending: true });

    if (error) {
      console.error("Gagal membuat sitemap, kode:", error.code ?? "tidak-diketahui");
      return daftar;
    }

    for (const produk of data ?? []) {
      daftar.push({
        url: `${dasar}/produk/${produk.id}`,
        lastModified: produk.created_at ? new Date(produk.created_at) : undefined,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  } catch (err) {
    console.error("Gagal membuat sitemap, jenis error:", err?.name ?? "tidak-diketahui");
  }

  return daftar;
}
