"use client";

import { useState } from "react";

// US-23: bagikan lewat Web Share API (HP), atau salin link ke clipboard (komputer).
export default function TombolBagikan({ judul }) {
  const [pesan, setPesan] = useState("");

  async function bagikan() {
    const url = window.location.href;
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title: judul, url });
        setPesan("Terima kasih sudah membagikan.");
        return;
      }
      await navigator.clipboard.writeText(url);
      setPesan("Link tersalin");
    } catch (err) {
      if (err?.name === "AbortError") return; // pengunjung menutup jendela bagikan
      try {
        await navigator.clipboard.writeText(url);
        setPesan("Link tersalin");
      } catch {
        setPesan("Tidak bisa menyalin otomatis. Salin dari kolom alamat browser.");
      }
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={bagikan}
        className="inline-flex items-center justify-center rounded-lg border border-garis bg-latar px-4 py-2.5 text-sm font-semibold text-teks hover:border-utama hover:text-tautan"
      >
        Bagikan
      </button>
      <p role="status" className="text-xs text-teks-lembut">
        {pesan}
      </p>
    </div>
  );
}
