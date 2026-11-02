"use client";

import { useEffect, useState } from "react";
import KartuProduk from "@/components/KartuProduk";
import { useDaftarLokal } from "@/lib/lokal";
import { ambilProdukUntukDaftar } from "@/app/aksi-publik";

// US-36: produk yang baru dibuka. Tidak tampil sama sekali kalau masih kosong.
export default function TerakhirDilihat() {
  const ids = useDaftarLokal("terakhir");
  const [produk, setProduk] = useState([]);
  const kunci = ids ? ids.join(",") : "";

  useEffect(() => {
    if (!kunci) {
      setProduk([]);
      return undefined;
    }
    let batal = false;
    ambilProdukUntukDaftar(kunci.split(",").map(Number))
      .then((hasil) => {
        if (!batal) setProduk(hasil.slice(0, 4));
      })
      .catch(() => {
        if (!batal) setProduk([]);
      });
    return () => {
      batal = true;
    };
  }, [kunci]);

  if (produk.length === 0) return null;

  return (
    <section aria-labelledby="judul-terakhir" className="mb-10 flex flex-col gap-4">
      <h2 id="judul-terakhir" className="text-xl font-bold">
        Terakhir dilihat
      </h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {produk.map((p) => (
          <KartuProduk key={p.id} produk={p} />
        ))}
      </div>
    </section>
  );
}
