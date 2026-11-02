import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import DaftarProduk from "@/components/DaftarProduk";
import FilterKatalog from "@/components/FilterKatalog";
import Paginasi from "@/components/Paginasi";
import { ambilKategoriBySlug, bacaParameter, cariProduk } from "@/lib/katalog";
import { ambilPengaturan } from "@/lib/pengaturan";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const kategori = await ambilKategoriBySlug(slug);
  if (!kategori) return { title: "Kategori tidak ditemukan" };

  const pengaturan = await ambilPengaturan();
  return {
    title: kategori.nama,
    description: `Daftar produk kategori ${kategori.nama} di ${pengaturan.nama}.`,
    alternates: { canonical: `/kategori/${kategori.slug}` },
  };
}

// US-49: halaman khusus satu kategori. Kategori yang tidak ada menampilkan "tidak ditemukan".
export default async function HalamanKategori({ params, searchParams }) {
  const { slug } = await params;
  const sp = await searchParams;
  const kategori = await ambilKategoriBySlug(slug);

  if (!kategori) {
    notFound();
  }

  const param = bacaParameter(sp);
  const hasil = await cariProduk({ ...param, kategori: kategori.nama });

  if (hasil.diluarJangkauan && param.hal > 1) {
    redirect(`/kategori/${kategori.slug}`);
  }

  return (
    <div className="flex flex-col gap-5 py-8 md:py-12">
      <Link href="/" className="text-sm text-teks-lembut underline underline-offset-4 hover:text-tautan">
        Kembali ke semua produk
      </Link>
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{kategori.nama}</h1>

      <FilterKatalog
        aksi={`/kategori/${kategori.slug}`}
        q={param.q}
        urut={param.urut}
        sembunyikanKategori
      />

      {hasil.error ? (
        <div className="rounded-xl border border-garis bg-permukaan p-6 text-center text-bahaya">
          Produk belum bisa dimuat. Silakan coba lagi beberapa saat lagi.
        </div>
      ) : hasil.produk.length === 0 ? (
        <p className="py-12 text-center text-teks-lembut">
          {param.q ? "Tidak ada produk yang cocok dengan pencarian Anda." : "Belum ada produk di kategori ini."}
        </p>
      ) : (
        <>
          <p className="text-sm text-teks-lembut">
            {hasil.total} produk · halaman {Math.min(param.hal, hasil.totalHalaman)} dari {hasil.totalHalaman}
          </p>
          <DaftarProduk produk={hasil.produk} />
          <Paginasi
            basePath={`/kategori/${kategori.slug}`}
            params={{ q: param.q, urut: param.urut }}
            halaman={param.hal}
            totalHalaman={hasil.totalHalaman}
          />
        </>
      )}
    </div>
  );
}
