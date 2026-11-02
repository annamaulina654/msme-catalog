import Tombol from "@/components/Tombol";
import { PILIHAN_URUTAN } from "@/lib/katalog";

const KELAS_KOLOM =
  "w-full min-w-0 rounded-lg border border-garis bg-latar px-3 py-2 text-base text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none";

// US-11 dan US-15: pencarian, filter kategori, dan urutan. Memakai form GET biasa,
// jadi tidak butuh JavaScript dan semua pilihan tersimpan di alamat halaman.
export default function FilterKatalog({ aksi = "/", q = "", kategori = "", urut = "", daftarKategori = [], sembunyikanKategori = false }) {
  const adaFilter = Boolean(q || kategori || urut);

  return (
    <form action={aksi} method="get" className="flex flex-col gap-3 sm:flex-row sm:items-end" role="search">
      <label className="flex flex-1 flex-col gap-1 text-sm font-semibold">
        Cari produk
        <input type="search" name="q" defaultValue={q} placeholder="Nama produk" maxLength={60} className={KELAS_KOLOM} />
      </label>

      {!sembunyikanKategori && (
        <label className="flex flex-col gap-1 text-sm font-semibold sm:w-44">
          Kategori
          <select name="kategori" defaultValue={kategori} className={KELAS_KOLOM}>
            <option value="">Semua kategori</option>
            {daftarKategori.map((k) => (
              <option key={k.id ?? k.nama} value={k.nama}>
                {k.nama}
              </option>
            ))}
          </select>
        </label>
      )}

      <label className="flex flex-col gap-1 text-sm font-semibold sm:w-40">
        Urutkan
        <select name="urut" defaultValue={urut} className={KELAS_KOLOM}>
          {PILIHAN_URUTAN.map((p) => (
            <option key={p.nilai} value={p.nilai}>
              {p.label}
            </option>
          ))}
        </select>
      </label>

      <div className="flex gap-2">
        <Tombol type="submit">Terapkan</Tombol>
        {adaFilter && (
          <Tombol href={aksi} varian="garis">
            Reset
          </Tombol>
        )}
      </div>
    </form>
  );
}
