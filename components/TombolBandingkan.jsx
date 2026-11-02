"use client";

import Link from "next/link";
import { useState } from "react";
import { KUNCI, useDaftarTersimpan } from "@/components/penyimpanan";

// US-37: pilih dua produk untuk dibandingkan. Memilih yang ketiga menggantikan pilihan paling lama.
export default function TombolBandingkan({ id }) {
  const [daftar, simpan] = useDaftarTersimpan(KUNCI.bandingkan);
  const [pesan, setPesan] = useState("");
  const pilihan = daftar ?? [];
  const dipilih = pilihan.includes(id);

  function ganti() {
    if (dipilih) {
      simpan(pilihan.filter((x) => x !== id));
      setPesan("");
      return;
    }
    if (pilihan.length >= 2) {
      simpan([pilihan[1], id]);
      setPesan("Maksimal 2 produk. Pilihan paling lama diganti.");
    } else {
      simpan([...pilihan, id]);
      setPesan("");
    }
  }

  const siap = pilihan.length === 2;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={ganti}
          aria-pressed={dipilih}
          className="inline-flex items-center rounded-lg border border-garis px-3 py-2 text-sm font-semibold hover:border-utama hover:text-tautan"
        >
          {dipilih ? "Batal bandingkan" : "Bandingkan"}
        </button>
        {siap && (
          <Link
            href={`/bandingkan?a=${pilihan[0]}&b=${pilihan[1]}`}
            className="text-sm font-semibold underline underline-offset-4 hover:text-tautan"
          >
            Lihat perbandingan (2 produk)
          </Link>
        )}
      </div>
      {pesan && (
        <p role="status" className="text-xs text-teks-lembut">
          {pesan}
        </p>
      )}
    </div>
  );
}
