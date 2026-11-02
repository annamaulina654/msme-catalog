import { ambilSesiAdmin } from "@/lib/sesi-admin";
import { keCsv } from "@/lib/csv";

// US-35: unduh semua produk sebagai CSV. Dibuat di server dan hanya untuk admin yang login.
export async function GET() {
  const sesi = await ambilSesiAdmin();
  if (!sesi) {
    return new Response("Anda harus login terlebih dahulu.", { status: 401 });
  }

  try {
    const { data, error } = await sesi.supabase
      .from("produk")
      .select("*")
      .order("urutan", { ascending: true })
      .order("id", { ascending: true });

    if (error) {
      console.error("Gagal mengekspor produk, kode:", error.code ?? "tidak-diketahui");
      return new Response("Produk belum bisa diekspor. Coba lagi beberapa saat lagi.", { status: 500 });
    }

    const judul = ["id", "nama", "harga", "harga_diskon", "stok", "kategori", "badge", "foto_url", "deskripsi", "aktif", "urutan", "dibuat"];
    const isi = (data ?? []).map((p) => [
      p.id,
      p.nama,
      p.harga,
      p.harga_diskon,
      p.stok,
      p.kategori,
      p.badge,
      p.foto_url,
      p.deskripsi,
      p.aktif === false ? "tidak" : "ya",
      p.urutan,
      p.created_at,
    ]);

    const tanggal = new Date().toISOString().slice(0, 10);
    return new Response(keCsv([judul, ...isi]), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="produk-${tanggal}.csv"`,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("Gagal mengekspor produk, jenis error:", err?.name ?? "tidak-diketahui");
    return new Response("Produk belum bisa diekspor. Coba lagi beberapa saat lagi.", { status: 500 });
  }
}
