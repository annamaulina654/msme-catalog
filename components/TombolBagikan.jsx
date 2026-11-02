"use client";

import { useState } from "react";

// US-23: bagikan atau salin link produk. Memakai Web Share API kalau ada, kalau tidak menyalin ke clipboard.
export default function TombolBagikan({ judul }) {
  const [pesan, setPesan] = useState("");

  async function bagikan() {
    const alamat = window.location.href;
    setPesan("");

    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title: judul, url: alamat });
        setPesan("Link dibagikan");
        return;
      }
    } catch (err) {
      // Pengguna menutup jendela bagikan: bukan error.
      if (err?.name === "AbortError") return;
    }

    try {
      await navigator.clipboard.writeText(alamat);
      setPesan("Link tersalin");
    } catch {
      setPesan("Gagal menyalin. Salin alamat dari bilah alamat browser.");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={bagikan}
        className="inline-flex items-center rounded-lg border border-garis px-3 py-2 text-sm font-semibold hover:border-utama hover:text-tautan"
      >
        Bagikan link
      </button>
      <span role="status" aria-live="polite" className="text-sm text-teks-lembut">
        {pesan}
      </span>
    </div>
  );
}
