import Link from "next/link";

// US-42: banner promo di beranda. Tautan hanya dipakai kalau berupa alamat dalam situs (/) atau https.
export default function BannerPromo({ banner }) {
  if (!banner) return null;

  const tautanAman =
    banner.tautan && ((banner.tautan.startsWith("/") && !banner.tautan.startsWith("//")) || banner.tautan.startsWith("https://"))
      ? banner.tautan
      : null;

  const isi = (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-garis bg-harga-latar sm:flex-row">
      {banner.gambar_url && (
        <img src={banner.gambar_url} alt="" className="h-40 w-full object-cover sm:h-auto sm:w-56" />
      )}
      <div className="flex flex-col justify-center gap-1 p-5">
        <p className="text-xl font-extrabold text-harga">{banner.judul}</p>
        {banner.teks && <p className="text-harga">{banner.teks}</p>}
      </div>
    </div>
  );

  if (!tautanAman) {
    return <section aria-label="Promo">{isi}</section>;
  }

  const dalamSitus = tautanAman.startsWith("/");
  return (
    <section aria-label="Promo">
      {dalamSitus ? (
        <Link href={tautanAman} className="block">
          {isi}
        </Link>
      ) : (
        <a href={tautanAman} target="_blank" rel="noopener noreferrer" className="block">
          {isi}
        </a>
      )}
    </section>
  );
}
