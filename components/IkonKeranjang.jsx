"use client";

import Link from "next/link";
import { KUNCI, useDaftarTersimpan } from "@/components/penyimpanan";

// US-21: tautan ke keranjang dengan jumlah barang. Angka dibaca dari browser setelah halaman termuat.
export default function IkonKeranjang() {
  const [daftar] = useDaftarTersimpan(KUNCI.keranjang);
  const jumlah = (daftar ?? []).reduce((n, x) => n + (Number(x.jumlah) || 0), 0);

  return (
    <Link href="/keranjang" className="font-semibold hover:text-tautan" aria-label={`Keranjang, ${jumlah} barang`}>
      Keranjang{jumlah > 0 ? ` (${jumlah})` : ""}
    </Link>
  );
}
