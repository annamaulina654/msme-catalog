import NavAdmin from "@/components/NavAdmin";
import FormBanner from "@/components/FormBanner";
import Tombol from "@/components/Tombol";
import TombolAksi from "@/components/TombolAksi";
import { createAdminClient } from "@/lib/supabase/admin";
import { idProduk } from "@/lib/validasi-produk";
import { aturAktifBanner, hapusBanner } from "@/app/admin/aksi-konten";

export const dynamic = "force-dynamic";

// US-42: kelola banner promo di beranda. Hanya satu banner aktif yang tampil (yang terbaru diubah).
export default async function HalamanBanner({ searchParams }) {
  const sp = await searchParams;
  const idUbah = idProduk(Array.isArray(sp?.ubah) ? sp.ubah[0] : sp?.ubah);

  let daftar = [];
  let pesanError = null;

  try {
    const supabase = await createAdminClient();
    const { data, error } = await supabase.from("banner").select("*").order("updated_at", { ascending: false });
    if (error) {
      console.error("Gagal memuat banner admin, kode:", error.code ?? "tidak-diketahui");
      pesanError = "Banner belum bisa dimuat. Pastikan skrip docs/migrasi-bonus-2.sql sudah dijalankan.";
    } else {
      daftar = data ?? [];
    }
  } catch (err) {
    console.error("Gagal memuat banner admin, jenis error:", err?.name ?? "tidak-diketahui");
    pesanError = "Banner belum bisa dimuat. Silakan coba lagi beberapa saat lagi.";
  }

  const bannerUbah = idUbah ? daftar.find((b) => b.id === idUbah) : null;

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div>
        <h1 className="text-2xl font-extrabold">Banner promo</h1>
        <p className="mt-1 text-sm text-teks-lembut">
          Banner aktif tampil di bagian atas beranda. Kalau ada beberapa yang aktif, yang paling baru diubah yang tampil.
        </p>
      </div>

      {pesanError ? (
        <div className="rounded-xl border border-garis bg-permukaan p-6 text-center text-bahaya">{pesanError}</div>
      ) : (
        <>
          <section aria-labelledby="judul-form">
            <h2 id="judul-form" className="mb-3 font-bold">
              {bannerUbah ? "Ubah banner" : "Banner baru"}
            </h2>
            {/* key membuat form dimuat ulang saat berpindah antara banner baru dan banner yang diubah */}
            <FormBanner key={bannerUbah?.id ?? "baru"} banner={bannerUbah ?? undefined} />
          </section>

          {daftar.length === 0 ? (
            <p className="text-teks-lembut">Belum ada banner</p>
          ) : (
            <ul className="flex max-w-3xl flex-col divide-y divide-garis rounded-2xl border border-garis">
              {daftar.map((b) => (
                <li key={b.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start">
                  {b.gambar_url && <img src={b.gambar_url} alt="" className="h-16 w-24 rounded-lg object-cover" />}
                  <div className="flex-1">
                    <p className="font-semibold">
                      {b.judul}
                      <span className={`ml-2 text-xs ${b.aktif ? "text-tautan" : "text-teks-lembut"}`}>
                        {b.aktif ? "Aktif" : "Nonaktif"}
                      </span>
                    </p>
                    {b.teks && <p className="text-sm text-teks-lembut">{b.teks}</p>}
                    {b.tautan && <p className="text-xs text-teks-lembut">Tautan: {b.tautan}</p>}
                  </div>
                  <div className="flex flex-wrap items-start gap-2">
                    <Tombol href={`/admin/banner?ubah=${b.id}`} varian="garis">
                      Ubah
                    </Tombol>
                    <TombolAksi
                      aksi={aturAktifBanner}
                      nilai={{ id: b.id, aktif: !b.aktif }}
                      label={b.aktif ? "Nonaktifkan" : "Aktifkan"}
                    />
                    <TombolAksi
                      aksi={hapusBanner}
                      nilai={{ id: b.id }}
                      label="Hapus"
                      labelProses="Menghapus..."
                      varian="bahaya"
                      konfirmasi={`Hapus banner "${b.judul}"?`}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
