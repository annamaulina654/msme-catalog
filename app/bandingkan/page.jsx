import Link from "next/link";
import { notFound } from "next/navigation";
import BadgeProduk from "@/components/BadgeProduk";
import HargaProduk from "@/components/HargaProduk";
import PilihanBandingkan from "@/components/PilihanBandingkan";
import { ambilProdukByIds } from "@/lib/katalog";
import { idProduk } from "@/lib/validasi-produk";
import { stokHabis } from "@/lib/harga";

export const dynamic = "force-dynamic";
export const metadata = { title: "Bandingkan produk", robots: { index: false, follow: true } };

const ambil = (sp, k) => String(Array.isArray(sp?.[k]) ? sp[k][0] : (sp?.[k] ?? ""));

// US-37: dua produk berdampingan (foto, kategori, harga, deskripsi). Produk yang tidak ada menampilkan "tidak ditemukan".
export default async function HalamanBandingkan({ searchParams }) {
  const sp = await searchParams;
  const a = idProduk(ambil(sp, "a"));
  const b = idProduk(ambil(sp, "b"));
  const adaParam = ambil(sp, "a") !== "" || ambil(sp, "b") !== "";

  if (!adaParam) {
    return (
      <div className="flex flex-col gap-4 py-8 md:py-12">
        <h1 className="text-3xl font-extrabold tracking-tight">Bandingkan produk</h1>
        <PilihanBandingkan />
      </div>
    );
  }

  if (!a || !b || a === b) notFound();

  const hasil = await ambilProdukByIds([a, b]);
  if (hasil.length !== 2) notFound();

  const baris = [
    ["Kategori", (p) => p.kategori || "-"],
    ["Harga", (p) => <HargaProduk produk={p} />],
    ["Stok", (p) => (stokHabis(p) ? "Habis" : typeof p.stok === "number" ? `Tersedia (${p.stok})` : "-")],
    ["Deskripsi", (p) => <span className="leading-relaxed">{p.deskripsi || "-"}</span>],
  ];

  return (
    <div className="flex flex-col gap-6 py-8 md:py-12">
      <h1 className="text-3xl font-extrabold tracking-tight">Bandingkan produk</h1>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] table-fixed border-separate border-spacing-x-4 text-left text-sm">
          <caption className="sr-only">Perbandingan dua produk</caption>
          <thead>
            <tr>
              <td className="w-24" />
              {hasil.map((p) => (
                <th key={p.id} scope="col" className="align-top font-normal">
                  <div className="relative">
                    <img
                      src={p.foto_url}
                      alt={p.nama}
                      className="aspect-square w-full rounded-2xl border border-garis bg-permukaan object-cover"
                    />
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
                <th scope="row" className="py-3 align-top font-semibold text-teks-lembut">
                  {label}
                </th>
                {hasil.map((p) => (
                  <td key={p.id} className="border-t border-garis py-3 align-top">
                    {tampil(p)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Link href="/" className="text-sm font-semibold underline underline-offset-4 hover:text-tautan">
        Kembali ke semua produk
      </Link>
    </div>
  );
}
