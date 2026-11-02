// Penyimpanan di browser (localStorage) untuk keranjang, favorit, terakhir dilihat, dan perbandingan.
// Hanya dipakai dari komponen client. Semua pembacaan dibungkus try/catch karena penyimpanan bisa
// kosong atau diblokir (jendela pribadi, pengaturan browser).
import { useEffect, useState } from "react";

const PERISTIWA = "lokal-berubah";

export function bacaDaftar(kunci) {
  try {
    const hasil = JSON.parse(window.localStorage.getItem(kunci) || "[]");
    return Array.isArray(hasil) ? hasil : [];
  } catch {
    return [];
  }
}

export function tulisDaftar(kunci, nilai) {
  try {
    window.localStorage.setItem(kunci, JSON.stringify(nilai));
  } catch {
    // Penyimpanan diblokir: perubahan tidak diingat, tetapi halaman tetap berjalan.
  }
  window.dispatchEvent(new Event(PERISTIWA));
}

// Daftar id produk (bilangan bulat positif, tanpa duplikat).
export function bacaIds(kunci) {
  const ids = bacaDaftar(kunci)
    .map(Number)
    .filter((n) => Number.isInteger(n) && n > 0);
  return [...new Set(ids)];
}

// Isi keranjang: { id, varianId, jumlah }. Item yang rusak dibuang.
export function bacaKeranjang() {
  return bacaDaftar("keranjang")
    .map((x) => ({
      id: Number(x?.id),
      varianId: x?.varianId === null || x?.varianId === undefined ? null : Number(x.varianId),
      jumlah: Number(x?.jumlah),
    }))
    .filter(
      (x) =>
        Number.isInteger(x.id) &&
        x.id > 0 &&
        (x.varianId === null || (Number.isInteger(x.varianId) && x.varianId > 0)) &&
        Number.isInteger(x.jumlah) &&
        x.jumlah >= 1 &&
        x.jumlah <= 99
    )
    .slice(0, 30);
}

export function sama(a, b) {
  return a.id === b.id && (a.varianId ?? null) === (b.varianId ?? null);
}

// Hook: nilai daftar dari localStorage. `null` sebelum halaman selesai dimuat di browser
// (supaya tampilan server dan browser sama), lalu diperbarui setiap ada perubahan.
export function useDaftarLokal(kunci, pembaca = bacaIds) {
  const [daftar, setDaftar] = useState(null);

  useEffect(() => {
    const muat = () => setDaftar(pembaca(kunci));
    muat();
    window.addEventListener(PERISTIWA, muat);
    window.addEventListener("storage", muat);
    return () => {
      window.removeEventListener(PERISTIWA, muat);
      window.removeEventListener("storage", muat);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kunci]);

  return daftar;
}
