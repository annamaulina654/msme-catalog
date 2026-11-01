import KartuProduk from "@/components/KartuProduk";
import { toko } from "@/lib/toko";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HalamanKatalog() {
  let daftarProduk = [];
  let pesanError = null;

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("produk")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      // K-9 dan K-13: catat hanya kode error di log server, jangan tampilkan detail ke pengunjung.
      console.error("Gagal memuat produk, kode:", error.code ?? "tidak-diketahui");
      pesanError = "Produk belum bisa dimuat. Silakan coba lagi beberapa saat lagi.";
    } else {
      daftarProduk = data || [];
    }
  } catch (err) {
    console.error("Gagal memuat produk, jenis error:", err?.name ?? "tidak-diketahui");
    pesanError = "Produk belum bisa dimuat. Silakan coba lagi beberapa saat lagi.";
  }

  return (
    <>
      <section className="py-10 sm:py-14">
        <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          {toko.nama}
        </h1>
        <p className="mt-3 max-w-xl text-lg text-teks-lembut">{toko.tagline}</p>
        <p className="mt-4 text-sm text-teks-lembut">{toko.jamBuka}</p>
      </section>

      <section aria-labelledby="judul-produk" className="flex flex-col gap-5">
        <h2 id="judul-produk" className="text-xl font-bold">
          Produk kami
        </h2>

        {pesanError ? (
          <div className="rounded-xl border border-garis bg-permukaan p-6 text-center text-bahaya">
            {pesanError}
          </div>
        ) : daftarProduk.length === 0 ? (
          <p className="py-12 text-center text-teks-lembut">Belum ada produk</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {daftarProduk.map((produk) => (
              <KartuProduk key={produk.id} produk={produk} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
