import Link from "next/link";
import { notFound } from "next/navigation";
import BadgeProduk from "@/components/BadgeProduk";
import HargaProduk from "@/components/HargaProduk";
import TombolWhatsApp from "@/components/TombolWhatsApp";
import { ambilProduk } from "@/lib/produk";
import { stokHabis } from "@/lib/harga";
import { toko } from "@/lib/toko";

export const dynamic = "force-dynamic";

// Ringkas deskripsi menjadi maksimal 160 karakter untuk hasil pencarian dan pratinjau tautan.
function ringkas(teks, panjang = 160) {
  const bersih = (teks ?? "").replace(/\s+/g, " ").trim();
  if (bersih.length <= panjang) return bersih;
  return `${bersih.slice(0, panjang - 1).trimEnd()}…`;
}

// US-26: judul, deskripsi, dan Open Graph sesuai produk.
export async function generateMetadata({ params }) {
  const { id } = await params;
  const produk = await ambilProduk(id);

  if (!produk) {
    return { title: "Produk tidak ditemukan" };
  }

  const deskripsi = ringkas(produk.deskripsi) || `${produk.nama} di ${toko.nama}`;
  const gambar = produk.foto_url ? [{ url: produk.foto_url, alt: produk.nama }] : undefined;
  const alamat = `/produk/${produk.id}`;

  return {
    title: produk.nama,
    description: deskripsi,
    alternates: { canonical: alamat },
    openGraph: {
      siteName: toko.nama,
      locale: "id_ID",
      type: "website",
      url: alamat,
      title: produk.nama,
      description: deskripsi,
      images: gambar,
    },
    twitter: {
      card: gambar ? "summary_large_image" : "summary",
      title: produk.nama,
      description: deskripsi,
      images: gambar,
    },
  };
}

export default async function HalamanDetailProduk({ params }) {
  const { id } = await params;
  const produk = await ambilProduk(id);

  if (!produk) {
    notFound();
  }

  const habis = stokHabis(produk);

  return (
    <article className="grid gap-8 py-8 md:grid-cols-2 md:py-12">
      <div className="relative">
        <img
          src={produk.foto_url}
          alt={produk.nama}
          className={`aspect-square w-full rounded-2xl border border-garis bg-permukaan object-cover ${habis ? "opacity-50" : ""}`}
        />
        <BadgeProduk produk={produk} className="absolute left-3 top-3" />
      </div>
      <div className="flex flex-col gap-4">
        <Link href="/" className="text-sm text-teks-lembut underline underline-offset-4 hover:text-tautan">
          Kembali ke katalog
        </Link>
        <p className="text-sm text-teks-lembut">{produk.kategori}</p>
        <h1 className="text-3xl font-extrabold leading-tight tracking-tight">{produk.nama}</h1>
        <HargaProduk produk={produk} ukuran="besar" />
        <p className="max-w-prose leading-relaxed text-teks-lembut">{produk.deskripsi}</p>
        <TombolWhatsApp produk={produk} />
      </div>
    </article>
  );
}
