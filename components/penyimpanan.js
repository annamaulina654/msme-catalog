"use client";

import { useCallback, useEffect, useState } from "react";

// Penyimpanan daftar kecil di browser (localStorage) untuk keranjang, favorit, terakhir dilihat,
// dan pilihan perbandingan. Semua akses dibungkus try/catch karena penyimpanan bisa diblokir
// (mode privat, setelan browser). Perubahan diumumkan lewat event supaya semua komponen ikut segar.

const EVENT = "penyimpanan-berubah";

export const KUNCI = {
  keranjang: "keranjang",
  favorit: "favorit",
  dilihat: "dilihat",
  bandingkan: "bandingkan",
};

export function bacaDaftar(kunci) {
  try {
    const mentah = localStorage.getItem(kunci);
    const json = mentah ? JSON.parse(mentah) : [];
    return Array.isArray(json) ? json : [];
  } catch {
    return [];
  }
}

export function tulisDaftar(kunci, nilai) {
  try {
    localStorage.setItem(kunci, JSON.stringify(nilai));
  } catch {
    // Penyimpanan diblokir: perubahan hanya berlaku selama halaman terbuka.
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { kunci } }));
}

// `daftar` bernilai null sampai data terbaca di browser, supaya tampilan server dan browser sama saat pertama dimuat.
export function useDaftarTersimpan(kunci) {
  const [daftar, setDaftar] = useState(null);

  useEffect(() => {
    const muat = () => setDaftar(bacaDaftar(kunci));
    muat();
    window.addEventListener(EVENT, muat);
    window.addEventListener("storage", muat);
    return () => {
      window.removeEventListener(EVENT, muat);
      window.removeEventListener("storage", muat);
    };
  }, [kunci]);

  const simpan = useCallback((nilai) => tulisDaftar(kunci, nilai), [kunci]);
  return [daftar, simpan];
}

// ===== Keranjang: [{ id, varian, jumlah }] =====================================
export const MAKS_ITEM_KERANJANG = 30;
export const MAKS_JUMLAH = 99;

export function tambahKeKeranjang({ id, varian = null, jumlah = 1 }) {
  const daftar = bacaDaftar(KUNCI.keranjang);
  const ada = daftar.find((x) => x.id === id && (x.varian ?? null) === (varian ?? null));

  if (ada) {
    ada.jumlah = Math.min(MAKS_JUMLAH, ada.jumlah + jumlah);
  } else {
    if (daftar.length >= MAKS_ITEM_KERANJANG) return { error: `Keranjang penuh (maksimal ${MAKS_ITEM_KERANJANG} item).` };
    daftar.push({ id, varian: varian ?? null, jumlah: Math.min(MAKS_JUMLAH, jumlah) });
  }

  tulisDaftar(KUNCI.keranjang, daftar);
  return { ok: true };
}
