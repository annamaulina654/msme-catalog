"use client";

import { KUNCI, useDaftarTersimpan } from "@/components/penyimpanan";

// US-24: tandai produk sebagai favorit. Disimpan di browser dan bertahan setelah halaman dimuat ulang.
// Tanpa `className`: tombol bertulisan penuh (halaman detail).
// Dengan `className` (misalnya "absolute right-2 top-2" di kartu): tombol ikon kecil.
export default function TombolFavorit({ id, nama = "produk ini", className }) {
  const [daftar, simpan] = useDaftarTersimpan(KUNCI.favorit);
  const aktif = (daftar ?? []).includes(id);

  function ganti() {
    const sekarang = daftar ?? [];
    simpan(aktif ? sekarang.filter((x) => x !== id) : [...sekarang.filter((x) => x !== id), id].slice(-100));
  }

  if (className) {
    return (
      <button
        type="button"
        onClick={ganti}
        aria-pressed={aktif}
        aria-label={aktif ? `Hapus ${nama} dari favorit` : `Simpan ${nama} ke favorit`}
        className={`${className} flex h-9 w-9 items-center justify-center rounded-full border border-garis bg-latar text-lg shadow-sm hover:border-utama ${aktif ? "text-bahaya" : "text-teks-lembut"}`}
      >
        <span aria-hidden="true">{aktif ? "♥" : "♡"}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={ganti}
      aria-pressed={aktif}
      className="inline-flex items-center gap-1.5 rounded-lg border border-garis px-3 py-2 text-sm font-semibold hover:border-utama hover:text-tautan"
    >
      <span aria-hidden="true">{aktif ? "♥" : "♡"}</span>
      {aktif ? "Favorit" : "Simpan ke favorit"}
    </button>
  );
}
