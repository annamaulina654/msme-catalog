"use client";

import Link from "next/link";
import { bacaKeranjang, useDaftarLokal } from "@/lib/lokal";

// US-21: tautan keranjang di header dengan jumlah barang.
export default function IkonKeranjang() {
  const isi = useDaftarLokal("keranjang", bacaKeranjang);
  const jumlah = (isi ?? []).reduce((n, x) => n + x.jumlah, 0);

  return (
    <Link href="/keranjang" className="font-semibold hover:text-tautan">
      Keranjang
      {jumlah > 0 && (
        <span className="ml-1.5 rounded-full bg-utama px-2 py-0.5 text-xs text-white" aria-label={`${jumlah} barang`}>
          {jumlah}
        </span>
      )}
    </Link>
  );
}
