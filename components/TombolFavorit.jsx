"use client";

import { bacaIds, tulisDaftar, useDaftarLokal } from "@/lib/lokal";

// US-24: tombol hati. Favorit disimpan di browser dan bertahan setelah halaman dimuat ulang.
// `teks` menampilkan label di samping ikon (dipakai di halaman detail).
export default function TombolFavorit({ id, nama, teks = false, className = "" }) {
  const favorit = useDaftarLokal("favorit");
  const aktif = Boolean(favorit?.includes(id));

  function ganti() {
    const sekarang = bacaIds("favorit");
    tulisDaftar("favorit", aktif ? sekarang.filter((x) => x !== id) : [id, ...sekarang].slice(0, 50));
  }

  const label = aktif ? `Hapus ${nama} dari favorit` : `Tambahkan ${nama} ke favorit`;

  return (
    <button
      type="button"
      onClick={ganti}
      aria-pressed={aktif}
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center gap-1.5 rounded-full border border-garis bg-latar px-3 py-1.5 text-sm font-semibold shadow-sm hover:border-utama ${aktif ? "text-bahaya" : "text-teks"} ${className}`}
    >
      <span aria-hidden="true">{aktif ? "♥" : "♡"}</span>
      {teks && <span>{aktif ? "Favorit" : "Simpan ke favorit"}</span>}
    </button>
  );
}
