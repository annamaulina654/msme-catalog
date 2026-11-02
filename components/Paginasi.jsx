import Link from "next/link";

// Susun alamat halaman dengan parameter yang sudah ada (kata kunci, kategori, urutan), tanpa nilai kosong.
function bangunUrl(basePath, params, hal) {
  const qs = new URLSearchParams();
  for (const [kunci, nilai] of Object.entries(params)) {
    if (nilai) qs.set(kunci, nilai);
  }
  if (hal > 1) qs.set("hal", String(hal));
  const teks = qs.toString();
  return teks ? `${basePath}?${teks}` : basePath;
}

const KELAS_DASAR =
  "inline-flex min-w-10 items-center justify-center rounded-lg border px-3 py-2 text-sm font-semibold";

// US-16 dan US-33: navigasi antar halaman. `params` jangan berisi "hal".
export default function Paginasi({ basePath, params = {}, halaman, totalHalaman }) {
  if (totalHalaman <= 1) return null;

  const awal = Math.max(1, halaman - 2);
  const akhir = Math.min(totalHalaman, halaman + 2);
  const nomor = [];
  for (let n = awal; n <= akhir; n++) nomor.push(n);

  return (
    <nav aria-label="Navigasi halaman" className="flex flex-wrap items-center justify-center gap-2 pt-2">
      {halaman > 1 && (
        <Link
          href={bangunUrl(basePath, params, halaman - 1)}
          className={`${KELAS_DASAR} border-garis hover:border-utama hover:text-tautan`}
        >
          Sebelumnya
        </Link>
      )}

      {awal > 1 && (
        <>
          <Link href={bangunUrl(basePath, params, 1)} className={`${KELAS_DASAR} border-garis hover:border-utama`}>
            1
          </Link>
          {awal > 2 && <span className="px-1 text-teks-lembut">…</span>}
        </>
      )}

      {nomor.map((n) =>
        n === halaman ? (
          <span key={n} aria-current="page" className={`${KELAS_DASAR} border-utama bg-utama text-white`}>
            {n}
          </span>
        ) : (
          <Link key={n} href={bangunUrl(basePath, params, n)} className={`${KELAS_DASAR} border-garis hover:border-utama`}>
            {n}
          </Link>
        )
      )}

      {akhir < totalHalaman && (
        <>
          {akhir < totalHalaman - 1 && <span className="px-1 text-teks-lembut">…</span>}
          <Link
            href={bangunUrl(basePath, params, totalHalaman)}
            className={`${KELAS_DASAR} border-garis hover:border-utama`}
          >
            {totalHalaman}
          </Link>
        </>
      )}

      {halaman < totalHalaman && (
        <Link
          href={bangunUrl(basePath, params, halaman + 1)}
          className={`${KELAS_DASAR} border-garis hover:border-utama hover:text-tautan`}
        >
          Berikutnya
        </Link>
      )}
    </nav>
  );
}
