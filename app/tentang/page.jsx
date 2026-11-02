import Tombol from "@/components/Tombol";
import { ambilPengaturan } from "@/lib/pengaturan";
import { linkWhatsApp } from "@/lib/pesan-wa";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const p = await ambilPengaturan();
  return { title: "Tentang kami", description: `Profil, alamat, jam buka, dan kontak ${p.nama}.` };
}

// US-22: profil toko, alamat, jam buka, dan kontak. Datanya dari pengaturan toko (US-43).
export default async function HalamanTentang() {
  const p = await ambilPengaturan();
  const nomorTampil = `+${String(p.nomorWhatsApp).replace(/\D/g, "")}`;

  return (
    <div className="flex max-w-2xl flex-col gap-8 py-8 md:py-12">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Tentang {p.nama}</h1>
        <p className="mt-3 text-lg text-teks-lembut">{p.tagline}</p>
      </div>

      {p.profil && <p className="whitespace-pre-line leading-relaxed">{p.profil}</p>}

      <dl className="grid gap-4 rounded-2xl border border-garis bg-permukaan p-5 sm:grid-cols-[8rem_1fr]">
        <dt className="font-semibold">Alamat</dt>
        <dd>{p.alamat}</dd>
        <dt className="font-semibold">Jam buka</dt>
        <dd>{p.jamBuka}</dd>
        <dt className="font-semibold">WhatsApp</dt>
        <dd>{nomorTampil}</dd>
      </dl>

      <div>
        <a
          href={linkWhatsApp(p.nomorWhatsApp, `Halo ${p.nama}, saya ingin bertanya.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-lg bg-utama px-5 py-3 font-semibold text-white hover:bg-utama-gelap"
        >
          Hubungi lewat WhatsApp
        </a>
        <Tombol href="/" varian="garis" className="ml-3">
          Lihat produk
        </Tombol>
      </div>
    </div>
  );
}
