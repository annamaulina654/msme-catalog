"use client";

import { useEffect } from "react";
import { KUNCI, bacaDaftar, tulisDaftar } from "@/components/penyimpanan";

const BATAS = 12;

// US-36: simpan id produk yang baru dibuka di browser, terbaru di depan, dengan batas jumlah.
export default function CatatDilihat({ id }) {
  useEffect(() => {
    const lama = bacaDaftar(KUNCI.dilihat).filter((x) => x !== id);
    tulisDaftar(KUNCI.dilihat, [id, ...lama].slice(0, BATAS));
  }, [id]);

  return null;
}
