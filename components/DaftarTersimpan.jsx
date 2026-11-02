"use client";

import { useEffect, useMemo, useState } from "react";
import { muatProduk } from "@/app/aksi-publik";
import DaftarProduk from "@/components/DaftarProduk";
import Tombol from "@/components/Tombol";
import { KUNCI, tulisDaftar, useDaftarTersimpan } from "@/components/penyimpanan";

// Memuat produk dari daftar id di browser (favorit atau terakhir dilihat).
function useProdukTersimpan(kunci, batas) {
  const [ids] = useDaftarTersimpan(kunci);
  const [produk, setProduk] = useState(null);
  const [gagal, setGagal] = useState(false);
  const kunciId = useMemo(() => (ids ?? []).slice(0, batas).join(","), [ids, batas]);

  useEffect(() => {
    if (ids === null) return;
    const daftar = ids.slice(0, batas);
    if (daftar.length === 0) {
      setProduk([]);
      return;
    }
    let batal = false;
    muatProduk(daftar)
      .then((hasil) => {
        if (!batal) {
          setProduk(hasil);
          setGagal(false);
        }
      })
      .catch(() => {
        if (!batal) setGagal(true);
      });
    return () => {
      batal = true;
    };
  }, [kunciId]); // eslint-disable-line react-hooks/exhaustive-deps

  return { memuat: ids === null || (produk === null && !gagal), gagal, produk: produk ?? [] };
}

// US-24: tampilan yang hanya berisi produk favorit.
export function DaftarFavorit() {
  const { memuat, gagal, produk } = useProdukTersimpan(KUNCI.favorit, 100);

  if (memuat) return <p className="py-8 text-teks-lembut">Memuat favorit...</p>;
  if (gagal) return <p className="py-8 text-bahaya">Favorit belum bisa dimuat. Silakan muat ulang halaman.</p>;

  if (produk.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4 py-8">
        <p className="text-teks-lembut">
          Belum ada favorit. Buka halaman produk lalu tekan "Simpan ke favorit".
        </p>
        <Tombol href="/">Lihat produk</Tombol>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <DaftarProduk produk={produk} />
      <div>
        <button
          type="button"
          onClick={() => {
            if (window.confirm("Hapus semua favorit?")) tulisDaftar(KUNCI.favorit, []);
          }}
          className="text-sm text-teks-lembut underline underline-offset-4 hover:text-bahaya"
        >
          Kosongkan favorit
        </button>
      </div>
    </div>
  );
}

// US-36: bagian "Terakhir dilihat" di beranda. Tidak muncul sama sekali kalau masih kosong.
export default function TerakhirDilihat() {
  const { memuat, gagal, produk } = useProdukTersimpan(KUNCI.dilihat, 6);

  if (memuat || gagal || produk.length === 0) return null;

  return (
    <section aria-labelledby="judul-dilihat" className="mb-10 flex flex-col gap-4">
      <h2 id="judul-dilihat" className="text-xl font-bold">
        Terakhir dilihat
      </h2>
      <DaftarProduk produk={produk} />
    </section>
  );
}
