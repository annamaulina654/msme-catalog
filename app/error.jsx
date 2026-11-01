"use client";

import Tombol from "@/components/Tombol";

// K-9: halaman error umum. Sengaja TIDAK menampilkan error.message atau stack trace;
// di production Next.js hanya memberi kode "digest" yang bisa dicari di log Vercel.
export default function HalamanError({ error, reset }) {
  return (
    <div className="flex flex-col items-start gap-4 py-16">
      <h1 className="text-2xl font-extrabold">Terjadi kesalahan</h1>
      <p className="text-teks-lembut">
        Halaman ini belum bisa dibuka. Silakan coba lagi beberapa saat lagi.
      </p>
      {error?.digest && (
        <p className="text-xs text-teks-lembut">Kode kesalahan: {error.digest}</p>
      )}
      <div className="flex gap-3">
        <Tombol type="button" onClick={() => reset()}>
          Coba lagi
        </Tombol>
        <Tombol href="/" varian="garis">
          Ke beranda
        </Tombol>
      </div>
    </div>
  );
}
