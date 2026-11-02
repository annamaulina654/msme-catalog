"use client";

import { useEffect } from "react";
import { bacaIds, tulisDaftar } from "@/lib/lokal";

// US-36: catat produk yang sedang dibuka ke daftar "Terakhir dilihat" (maksimal 8, yang terbaru di depan).
export default function CatatDilihat({ id }) {
  useEffect(() => {
    const lama = bacaIds("terakhir").filter((x) => x !== id);
    tulisDaftar("terakhir", [id, ...lama].slice(0, 8));
  }, [id]);

  return null;
}
