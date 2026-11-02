"use client";

import Tombol from "@/components/Tombol";
import { tulisDaftar, useDaftarLokal } from "@/lib/lokal";

// US-37: tampil di /bandingkan kalau alamatnya belum berisi dua produk. Membaca pilihan dari browser.
export default function PilihanBanding() {
  const pilihan = useDaftarLokal("banding");

  if (pilihan === null) {
    return <p className="py-12 text-center text-teks-lembut">Memuat pilihan...</p>;
  }

  if (pilihan.length >= 2) {
    return (
      <div className="flex flex-col items-start gap-4 py-8">
        <p className="text-teks-lembut">Anda sudah memilih 2 produk untuk dibandingkan.</p>
        <div className="flex flex-wrap gap-3">
          <Tombol href={`/bandingkan?a=${pilihan[0]}&b=${pilihan[1]}`}>Bandingkan sekarang</Tombol>
          <Tombol type="button" varian="garis" onClick={() => tulisDaftar("banding", [])}>
            Ulangi pilihan
          </Tombol>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-4 py-8">
      <p className="text-teks-lembut">
        {pilihan.length === 1
          ? "Anda baru memilih 1 produk. Pilih 1 produk lagi lewat tombol Bandingkan di halaman produk."
          : "Belum ada produk yang dipilih. Buka halaman produk lalu tekan tombol Bandingkan pada dua produk."}
      </p>
      <Tombol href="/">Lihat produk</Tombol>
    </div>
  );
}
