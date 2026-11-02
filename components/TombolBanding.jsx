"use client";

import { useState } from "react";
import Link from "next/link";
import { bacaIds, tulisDaftar, useDaftarLokal } from "@/lib/lokal";

// US-37: pilih produk untuk dibandingkan. Maksimal 2: memilih yang ketiga menggantikan pilihan terlama.
export default function TombolBanding({ id }) {
  const pilihan = useDaftarLokal("banding");
  const [pesan, setPesan] = useState("");
  const terpilih = Boolean(pilihan?.includes(id));

  function ganti() {
    const sekarang = bacaIds("banding");
    if (sekarang.includes(id)) {
      tulisDaftar("banding", sekarang.filter((x) => x !== id));
      setPesan("Dihapus dari perbandingan.");
      return;
    }
    let baru = [...sekarang, id];
    if (baru.length > 2) {
      baru = baru.slice(-2);
      setPesan("Maksimal 2 produk. Pilihan terlama diganti dengan produk ini.");
    } else {
      setPesan("Ditambahkan ke perbandingan.");
    }
    tulisDaftar("banding", baru);
  }

  const dua = pilihan?.length === 2;

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={ganti}
        aria-pressed={terpilih}
        className="inline-flex items-center justify-center rounded-lg border border-garis bg-latar px-4 py-2.5 text-sm font-semibold text-teks hover:border-utama hover:text-tautan"
      >
        {terpilih ? "Batal bandingkan" : "Bandingkan"}
      </button>
      <p role="status" className="text-xs text-teks-lembut">
        {pesan}
        {dua && (
          <>
            {pesan ? " " : ""}
            <Link href={`/bandingkan?a=${pilihan[0]}&b=${pilihan[1]}`} className="font-semibold underline underline-offset-4 hover:text-tautan">
              Lihat perbandingan
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
