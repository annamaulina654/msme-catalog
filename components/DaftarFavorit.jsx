"use client";

import { useEffect, useState } from "react";
import DaftarProduk from "@/components/DaftarProduk";
import Tombol from "@/components/Tombol";
import { useDaftarLokal } from "@/lib/lokal";
import { ambilProdukUntukDaftar } from "@/app/aksi-publik";

// US-24: tampilan yang hanya berisi produk favorit. Datanya diambil dari server berdasarkan id di browser.
export default function DaftarFavorit() {
  const ids = useDaftarLokal("favorit");
  const [produk, setProduk] = useState(null);
  const [gagal, setGagal] = useState(false);
  const kunci = ids ? ids.join(",") : null;

  useEffect(() => {
    if (kunci === null) return undefined;
    if (kunci === "") {
      setProduk([]);
      return undefined;
    }
    let batal = false;
    setGagal(false);
    ambilProdukUntukDaftar(kunci.split(",").map(Number))
      .then((hasil) => {
        if (!batal) setProduk(hasil);
      })
      .catch(() => {
        if (!batal) setGagal(true);
      });
    return () => {
      batal = true;
    };
  }, [kunci]);

  if (gagal) {
    return (
      <div className="rounded-xl border border-garis bg-permukaan p-6 text-center text-bahaya">
        Favorit belum bisa dimuat. Muat ulang halaman ini.
      </div>
    );
  }

  if (produk === null) {
    return <p className="py-12 text-center text-teks-lembut">Memuat favorit...</p>;
  }

  if (produk.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4 py-8">
        <p className="text-teks-lembut">Belum ada produk favorit. Tekan ikon hati pada produk untuk menyimpannya di sini.</p>
        <Tombol href="/">Lihat produk</Tombol>
      </div>
    );
  }

  return <DaftarProduk produk={produk} />;
}
