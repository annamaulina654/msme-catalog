"use client";

import { useState } from "react";

// US-18: foto utama dan gambar kecil. Produk dengan satu foto tampil biasa tanpa gambar kecil.
export default function GaleriFoto({ fotoUtama, galeri = [], nama, redup = false }) {
  const semua = [fotoUtama, ...galeri].filter(Boolean);
  const [terpilih, setTerpilih] = useState(0);
  const aktif = semua[Math.min(terpilih, Math.max(semua.length - 1, 0))];

  return (
    <div className="flex flex-col gap-3">
      <img
        src={aktif}
        alt={nama}
        className={`aspect-square w-full rounded-2xl border border-garis bg-permukaan object-cover ${redup ? "opacity-50" : ""}`}
      />
      {semua.length > 1 && (
        <ul className="grid grid-cols-5 gap-2" aria-label="Pilih foto">
          {semua.map((url, i) => (
            <li key={`${url}-${i}`}>
              <button
                type="button"
                onClick={() => setTerpilih(i)}
                aria-label={`Foto ${i + 1} dari ${semua.length}`}
                aria-current={i === terpilih ? "true" : undefined}
                className={`block w-full overflow-hidden rounded-lg border-2 ${i === terpilih ? "border-utama" : "border-garis"}`}
              >
                <img src={url} alt="" className="aspect-square w-full bg-permukaan object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
