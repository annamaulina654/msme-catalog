"use client";

import Link from "next/link";
import { KUNCI, tulisDaftar, useDaftarTersimpan } from "@/components/penyimpanan";
import Tombol from "@/components/Tombol";

// US-37: tampil di /bandingkan kalau belum ada dua produk di alamat. Membaca pilihan dari browser.
export default function PilihanBandingkan() {
  const [pilihan] = useDaftarTersimpan(KUNCI.bandingkan);

  if (pilihan === null) return <p className="py-8 text-teks-lembut">Memuat pilihan...</p>;

  if (pilihan.length === 2) {
    return (
      <div className="flex flex-col items-start gap-4 py-4">
        <p>Anda sudah memilih 2 produk.</p>
        <div className="flex gap-3">
          <Tombol href={`/bandingkan?a=${pilihan[0]}&b=${pilihan[1]}`}>Lihat perbandingan</Tombol>
          <button
            type="button"
            onClick={() => tulisDaftar(KUNCI.bandingkan, [])}
            className="rounded-lg border border-garis px-4 py-2.5 text-sm font-semibold hover:border-bahaya hover:text-bahaya"
          >
            Ulangi pilihan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-4 py-4">
      <p className="text-teks-lembut">
        {pilihan.length === 1
          ? "Satu produk sudah dipilih. Pilih satu lagi untuk mulai membandingkan."
          : "Buka halaman produk lalu tekan tombol Bandingkan pada dua produk."}
      </p>
      <Link href="/" className="text-sm font-semibold underline underline-offset-4 hover:text-tautan">
        Lihat semua produk
      </Link>
    </div>
  );
}
