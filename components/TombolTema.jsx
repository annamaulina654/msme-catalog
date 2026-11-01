"use client";

import { useEffect, useState } from "react";

// US-25: tombol pindah mode terang dan gelap. Pilihan disimpan di browser (localStorage).
export default function TombolTema() {
  const [tema, setTema] = useState(null);

  // Baca tema yang sudah dipasang public/tema.js setelah halaman tampil.
  useEffect(() => {
    setTema(document.documentElement.getAttribute("data-tema") === "gelap" ? "gelap" : "terang");
  }, []);

  function ganti() {
    const berikutnya = tema === "gelap" ? "terang" : "gelap";
    document.documentElement.setAttribute("data-tema", berikutnya);
    try {
      localStorage.setItem("tema", berikutnya);
    } catch {
      // Penyimpanan diblokir: tema tetap berganti, hanya tidak diingat.
    }
    setTema(berikutnya);
  }

  const gelap = tema === "gelap";

  return (
    <button
      type="button"
      onClick={ganti}
      aria-pressed={gelap}
      className="rounded-lg border border-garis px-3 py-1.5 text-sm font-semibold text-teks hover:border-utama hover:text-tautan"
    >
      {tema === null ? "Ganti tema" : gelap ? "Mode terang" : "Mode gelap"}
    </button>
  );
}
