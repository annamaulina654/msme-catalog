"use client";

import { useEffect } from "react";

// US-13: daftarkan service worker (hanya di situs yang sudah online, bukan saat npm run dev).
export default function DaftarkanSw() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Tidak masalah kalau gagal: situs tetap berfungsi tanpa service worker.
    });
  }, []);

  return null;
}
