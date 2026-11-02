"use client";

import { useState } from "react";

// US-18: foto utama dengan gambar kecil. Produk dengan satu foto tampil seperti biasa (tanpa gambar kecil).
export default function GaleriFoto({ foto, nama, redup = false }) {
  const daftar = [...new Set((foto ?? []).filter(Boolean))];
  const [indeks, setIndeks] = useState(0);
  const aktif = daftar[Math.min(indeks, daftar.length - 1)];

  if (daftar.length === 0) {
    return <div className="aspect-square w-full rounded-2xl border border-garis bg-permukaan" />;
  }

  return (
    <div className="flex flex-col gap-3">
      <img
        src={aktif}
        alt={nama}
        className={`aspect-square w-full rounded-2xl border border-garis bg-permukaan object-cover ${redup ? "opacity-50" : ""}`}
      />
      {daftar.length > 1 && (
        <ul className="grid grid-cols-5 gap-2" aria-label="Foto produk">
          {daftar.map((url, i) => (
            <li key={url}>
              <button
                type="button"
                onClick={() => setIndeks(i)}
                aria-label={`Tampilkan foto ${i + 1} dari ${daftar.length}`}
                aria-current={url === aktif}
                className={`block w-full overflow-hidden rounded-lg border-2 ${url === aktif ? "border-utama" : "border-garis"}`}
              >
                <img src={url} alt="" className="aspect-square w-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
