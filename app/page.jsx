import { redirect } from "next/navigation";
import BannerPromo from "@/components/BannerPromo";
import DaftarProduk from "@/components/DaftarProduk";
import FilterKatalog from "@/components/FilterKatalog";
import Paginasi from "@/components/Paginasi";
import TerakhirDilihat from "@/components/TerakhirDilihat";
import { ambilBannerAktif, ambilKategori, bacaParameter, cariProduk } from "@/lib/katalog";
import { ambilPengaturan } from "@/lib/pengaturan";

export const dynamic = "force-dynamic";

function bangunQuery(params) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) qs.set(k, String(v));
  const teks = qs.toString();
  return teks ? `/?${teks}` : "/";
}

export default async function HalamanKatalog({ searchParams }) {
  const sp = await searchParams;
  const param = bacaParameter(sp);

  const [pengaturan, banner, daftarKategori, hasil] = await Promise.all([
    ambilPengaturan(),
    ambilBannerAktif(),
    ambilKategori(),
    cariProduk(param),
  ]);

  // Nomor halaman melebihi jumlah halaman: kembali ke halaman pertama dengan filter yang sama.
  if (hasil.diluarJangkauan && param.hal > 1) {
    redirect(bangunQuery({ q: param.q, kategori: param.kategori, urut: param.urut }));
  }

  const adaFilter = Boolean(param.q || param.kategori);
  const { produk, total, totalHalaman, error } = hasil;

  return (
    <>
      <section className="py-10 sm:py-14">
        <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          {pengaturan.nama}
        </h1>
        <p className="mt-3 max-w-xl text-lg text-teks-lembut">{pengaturan.tagline}</p>
        <p className="mt-4 text-sm text-teks-lembut">{pengaturan.jamBuka}</p>
      </section>

      {banner && (
        <div className="mb-8">
          <BannerPromo banner={banner} />
        </div>
      )}

      <TerakhirDilihat />

      <section aria-labelledby="judul-produk" className="flex flex-col gap-5">
        <h2 id="judul-produk" className="text-xl font-bold">
          Produk kami
        </h2>

        <FilterKatalog
          aksi="/"
          q={param.q}
          kategori={param.kategori}
          urut={param.urut}
          daftarKategori={daftarKategori}
        />

        {error ? (
          <div className="rounded-xl border border-garis bg-permukaan p-6 text-center text-bahaya">
            Produk belum bisa dimuat. Silakan coba lagi beberapa saat lagi.
          </div>
        ) : produk.length === 0 ? (
          <p className="py-12 text-center text-teks-lembut">
            {adaFilter ? "Tidak ada produk yang cocok dengan pencarian Anda." : "Belum ada produk"}
          </p>
        ) : (
          <>
            <p className="text-sm text-teks-lembut">
              {total} produk · halaman {Math.min(param.hal, totalHalaman)} dari {totalHalaman}
            </p>
            <DaftarProduk produk={produk} />
            <Paginasi
              basePath="/"
              params={{ q: param.q, kategori: param.kategori, urut: param.urut }}
              halaman={param.hal}
              totalHalaman={totalHalaman}
            />
          </>
        )}
      </section>
    </>
  );
}
