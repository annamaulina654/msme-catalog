import Link from "next/link";
import { notFound } from "next/navigation";
import AksiProduk from "@/components/AksiProduk";
import BadgeProduk from "@/components/BadgeProduk";
import CatatDilihat from "@/components/CatatDilihat";
import DaftarProduk from "@/components/DaftarProduk";
import FormUlasan from "@/components/FormUlasan";
import GaleriFoto from "@/components/GaleriFoto";
import HargaProduk from "@/components/HargaProduk";
import TanyaProduk from "@/components/TanyaProduk";
import { ambilProduk } from "@/lib/produk";
import { ambilTerkait, ambilUlasan, ambilVarian } from "@/lib/katalog";
import { ambilPengaturan } from "@/lib/pengaturan";
import { formatTanggalWaktu } from "@/lib/format";
import { slugify } from "@/lib/slug";
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
  const [produk, toko] = await Promise.all([ambilProduk(id), ambilPengaturan()]);

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

function Bintang({ nilai }) {
  const bulat = Math.round(nilai);
  return (
    <span aria-hidden="true" className="text-harga">
      {"★".repeat(bulat)}
      {"☆".repeat(5 - bulat)}
    </span>
  );
}

export default async function HalamanDetailProduk({ params }) {
  const { id } = await params;
  const produk = await ambilProduk(id);

  if (!produk) {
    notFound();
  }

  const [varian, ulasan, terkait, toko] = await Promise.all([
    ambilVarian(produk.id),
    ambilUlasan(produk.id),
    ambilTerkait(produk),
    ambilPengaturan(),
  ]);

  const habis = stokHabis(produk);
  const slugKategori = produk.kategori ? slugify(produk.kategori) : "";
  // US-18: foto utama lebih dulu, lalu foto tambahan.
  const foto = [produk.foto_url, ...(Array.isArray(produk.galeri) ? produk.galeri : [])];

  return (
    <div className="py-8 md:py-12">
      <CatatDilihat id={produk.id} />

      <article className="grid gap-8 md:grid-cols-2">
        <div className="relative">
          <GaleriFoto foto={foto} nama={produk.nama} redup={habis} />
          <BadgeProduk produk={produk} className="absolute left-3 top-3" />
        </div>
        <div className="flex flex-col gap-4">
          <Link href="/" className="text-sm text-teks-lembut underline underline-offset-4 hover:text-tautan">
            Kembali ke katalog
          </Link>
          {produk.kategori &&
            (slugKategori ? (
              // US-49: nama kategori tertaut ke halaman kategori.
              <Link
                href={`/kategori/${slugKategori}`}
                className="self-start text-sm text-teks-lembut underline underline-offset-4 hover:text-tautan"
              >
                {produk.kategori}
              </Link>
            ) : (
              <p className="text-sm text-teks-lembut">{produk.kategori}</p>
            ))}
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight">{produk.nama}</h1>

          {ulasan.jumlah > 0 && (
            <a href="#ulasan" className="flex items-center gap-2 self-start text-sm hover:text-tautan">
              <Bintang nilai={ulasan.rata} />
              <span className="font-semibold">{ulasan.rata.toFixed(1)}</span>
              <span className="text-teks-lembut">({ulasan.jumlah} ulasan)</span>
            </a>
          )}

          {varian.length === 0 && <HargaProduk produk={produk} ukuran="besar" />}
          <p className="max-w-prose whitespace-pre-line leading-relaxed text-teks-lembut">{produk.deskripsi}</p>

          <AksiProduk produk={produk} varian={varian} nomor={toko.nomorWhatsApp} />
        </div>
      </article>

      <section aria-labelledby="judul-tanya" className="mt-12 flex flex-col gap-3">
        <h2 id="judul-tanya" className="text-xl font-bold">
          Ada pertanyaan?
        </h2>
        <TanyaProduk produkId={produk.id} />
      </section>

      <section id="ulasan" aria-labelledby="judul-ulasan" className="mt-12 flex flex-col gap-6">
        <div>
          <h2 id="judul-ulasan" className="text-xl font-bold">
            Ulasan pembeli
          </h2>
          {ulasan.jumlah > 0 ? (
            <p className="mt-1 flex items-center gap-2 text-sm">
              <Bintang nilai={ulasan.rata} />
              <span className="font-semibold">{ulasan.rata.toFixed(1)} dari 5</span>
              <span className="text-teks-lembut">({ulasan.jumlah} ulasan)</span>
            </p>
          ) : (
            <p className="mt-1 text-sm text-teks-lembut">Belum ada ulasan. Jadilah yang pertama.</p>
          )}
        </div>

        {ulasan.daftar.length > 0 && (
          <ul className="flex max-w-2xl flex-col divide-y divide-garis rounded-2xl border border-garis">
            {ulasan.daftar.map((u) => (
              <li key={u.id} className="p-4">
                <p className="text-sm">
                  <span className="font-semibold">{u.nama}</span>
                  <span className="text-teks-lembut"> · </span>
                  <Bintang nilai={u.rating} />
                  <span className="sr-only">{u.rating} dari 5</span>
                  <span className="text-teks-lembut"> · {formatTanggalWaktu(u.created_at)}</span>
                </p>
                <p className="mt-1 whitespace-pre-line break-words">{u.komentar}</p>
              </li>
            ))}
          </ul>
        )}

        <div>
          <h3 className="mb-3 font-bold">Tulis ulasan</h3>
          <FormUlasan produkId={produk.id} />
        </div>
      </section>

      {terkait.length > 0 && (
        <section aria-labelledby="judul-terkait" className="mt-12 flex flex-col gap-4">
          <h2 id="judul-terkait" className="text-xl font-bold">
            Produk terkait
          </h2>
          <DaftarProduk produk={terkait} />
        </section>
      )}
    </div>
  );
}
