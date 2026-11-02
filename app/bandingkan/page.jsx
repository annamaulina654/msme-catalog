import Link from "next/link";
import { notFound } from "next/navigation";
import PilihanBanding from "@/components/PilihanBanding";
import HargaProduk from "@/components/HargaProduk";
import BadgeProduk from "@/components/BadgeProduk";
import Tombol from "@/components/Tombol";
import { ambilProdukByIds } from "@/lib/katalog";
import { idProduk } from "@/lib/validasi-produk";
import { stokHabis } from "@/lib/harga";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Bandingkan produk",
  robots: { index: false, follow: true },
};

const ambilParam = (sp, k) => String(Array.isArray(sp?.[k]) ? sp[k][0] : (sp?.[k] ?? ""));

// US-37: dua produk berdampingan. Alamat: /bandingkan?a=<id>&b=<id>.
export default async function HalamanBandingkan({ searchParams }) {
  const sp = await searchParams;
  const mentahA = ambilParam(sp, "a");
  const mentahB = ambilParam(sp, "b");

  // Belum ada pilihan di alamat: tampilkan pilihan yang tersimpan di browser.
  if (!mentahA && !mentahB) {
    return (
      <div className="flex flex-col gap-4 py-8 md:py-12">
        <h1 className="text-3xl font-extrabold tracking-tight">Bandingkan produk</h1>
        <PilihanBanding />
      </div>
    );
  }

  const a = idProduk(mentahA);
  const b = idProduk(mentahB);
  if (!a || !b) notFound();

  if (a === b) {
    return (
      <div className="flex flex-col items-start gap-4 py-8 md:py-12">
        <h1 className="text-3xl font-extrabold tracking-tight">Bandingkan produk</h1>
        <p className="text-teks-lembut">Pilih dua produk yang berbeda untuk dibandingkan.</p>
        <Tombol href="/">Lihat produk</Tombol>
      </div>
    );
  }

  const produk = await ambilProdukByIds([a, b]);
  if (produk.length !== 2) notFound(); // salah satu produk tidak ada atau nonaktif

  const baris = [
    ["Kategori", (p) => p.kategori ?? "-"],
    ["Harga", (p) => <HargaProduk produk={p} />],
    ["Ketersediaan", (p) => (stokHabis(p) ? <span className="font-semibold text-bahaya">Habis</span> : "Tersedia")],
    ["Deskripsi", (p) => <span className="leading-relaxed text-teks-lembut">{p.deskripsi ?? "-"}</span>],
  ];

  return (
    <div className="flex flex-col gap-6 py-8 md:py-12">
      <div>
        <Link href="/" className="text-sm text-teks-lembut underline underline-offset-4 hover:text-tautan">
          Kembali ke katalog
        </Link>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Bandingkan produk</h1>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] table-fixed border-separate border-spacing-x-4 text-left text-sm">
          <caption className="sr-only">Perbandingan {produk[0].nama} dan {produk[1].nama}</caption>
          <thead>
            <tr>
              <td className="w-24" />
              {produk.map((p) => (
                <th key={p.id} scope="col" className="align-top">
                  <div className="relative">
                    <img src={p.foto_url} alt={p.nama} className="aspect-square w-full rounded-2xl border border-garis bg-permukaan object-cover" />
                    <BadgeProduk produk={p} className="absolute left-2 top-2" />
                  </div>
                  <Link href={`/produk/${p.id}`} className="mt-3 block text-lg font-extrabold hover:text-tautan">
                    {p.nama}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {baris.map(([label, tampil]) => (
              <tr key={label}>
                <th scope="row" className="py-3 pr-2 align-top font-semibold text-teks-lembut">
                  {label}
                </th>
                {produk.map((p) => (
                  <td key={p.id} className="border-t border-garis py-3 align-top">
                    {tampil(p)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
