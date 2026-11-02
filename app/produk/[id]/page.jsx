import Link from "next/link";
import { notFound } from "next/navigation";
import BadgeProduk from "@/components/BadgeProduk";
import CatatDilihat from "@/components/CatatDilihat";
import DaftarProduk from "@/components/DaftarProduk";
import GaleriFoto from "@/components/GaleriFoto";
import HargaProduk from "@/components/HargaProduk";
import PanelPesan from "@/components/PanelPesan";
import TanyaAI from "@/components/TanyaAI";
import TombolBagikan from "@/components/TombolBagikan";
import TombolBandingkan from "@/components/TombolBandingkan";
import TombolFavorit from "@/components/TombolFavorit";
import UlasanProduk from "@/components/UlasanProduk";
import { ambilKategori, ambilTerkait, ambilUlasan, ambilVarian } from "@/lib/katalog";
import { ambilPengaturan } from "@/lib/pengaturan";
import { ambilProduk } from "@/lib/produk";
import { stokHabis } from "@/lib/harga";

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

  const { nama: namaToko } = await ambilPengaturan();
  const deskripsi = ringkas(produk.deskripsi) || `${produk.nama} di ${namaToko}`;
  const gambar = produk.foto_url ? [{ url: produk.foto_url, alt: produk.nama }] : undefined;
  const alamat = `/produk/${produk.id}`;

  return {
    title: produk.nama,
    description: deskripsi,
    alternates: { canonical: alamat },
    openGraph: {
      siteName: namaToko,
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
  // Produk nonaktif atau tidak ada: "tidak ditemukan" (US-02 dan US-32).
  const produk = await ambilProduk(id);

  if (!produk) {
    notFound();
  }

  const [pengaturan, varian, ulasan, terkait, daftarKategori] = await Promise.all([
    ambilPengaturan(),
    ambilVarian(produk.id),
    ambilUlasan(produk.id),
    ambilTerkait(produk),
    ambilKategori(),
  ]);

  const habis = stokHabis(produk);
  // US-49: nama kategori tertaut ke halaman kategori kalau kategorinya terdaftar.
  const kategori = daftarKategori.find((k) => k.nama === produk.kategori);

  return (
    <div className="flex flex-col gap-12 py-8 md:py-12">
      <CatatDilihat id={produk.id} />

      <article className="grid gap-8 md:grid-cols-2">
        <div className="relative">
          <GaleriFoto fotoUtama={produk.foto_url} galeri={produk.galeri ?? []} nama={produk.nama} redup={habis} />
          <BadgeProduk produk={produk} className="absolute left-3 top-3" />
        </div>

        <div className="flex flex-col gap-4">
          <Link href="/" className="text-sm text-teks-lembut underline underline-offset-4 hover:text-tautan">
            Kembali ke katalog
          </Link>
          {produk.kategori &&
            (kategori ? (
              <Link
                href={`/kategori/${kategori.slug}`}
                className="self-start text-sm text-teks-lembut underline underline-offset-4 hover:text-tautan"
              >
                {produk.kategori}
              </Link>
            ) : (
              <p className="text-sm text-teks-lembut">{produk.kategori}</p>
            ))}
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight">{produk.nama}</h1>
          {/* Kalau produk punya varian, harga ditampilkan di panel pesan mengikuti varian yang dipilih. */}
          {varian.length === 0 && <HargaProduk produk={produk} ukuran="besar" />}
          <p className="max-w-prose whitespace-pre-line leading-relaxed text-teks-lembut">{produk.deskripsi}</p>

          <PanelPesan produk={produk} varian={varian} nomorWa={pengaturan.nomorWhatsApp} />

          <div className="flex flex-wrap items-start gap-3 border-t border-garis pt-4">
            <TombolFavorit id={produk.id} />
            <TombolBandingkan id={produk.id} />
            <TombolBagikan judul={produk.nama} />
          </div>
        </div>
      </article>

      <TanyaAI produkId={produk.id} />

      <UlasanProduk produkId={produk.id} ulasan={ulasan} />

      {terkait.length > 0 && (
        <section aria-labelledby="judul-terkait" className="flex flex-col gap-4">
          <h2 id="judul-terkait" className="text-xl font-bold">
            Produk terkait
          </h2>
          <DaftarProduk produk={terkait} />
        </section>
      )}
    </div>
  );
}
