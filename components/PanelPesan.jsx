"use client";

import Link from "next/link";
import { useState } from "react";
import { catatKlikWa } from "@/app/aksi-publik";
import { formatRupiah } from "@/lib/format";
import { hargaAkhir, stokHabis } from "@/lib/harga";
import { linkWhatsApp, pesanSatuProduk } from "@/lib/pesan-wa";
import { MAKS_JUMLAH, tambahKeKeranjang } from "@/components/penyimpanan";

// US-12, 19, 21, 40, 48: pilih varian dan jumlah, lalu pesan lewat WhatsApp atau tambah ke keranjang.
// Pilihan ikut tertulis di pesan WhatsApp. Klik tombol WhatsApp dicatat tanpa menghambat pembukaan WhatsApp.
export default function PanelPesan({ produk, varian = [], nomorWa }) {
  const [varianId, setVarianId] = useState(varian[0]?.id ?? null);
  const [jumlah, setJumlah] = useState(1);
  const [umpanBalik, setUmpanBalik] = useState({ teks: "", galat: false });

  const habis = stokHabis(produk);
  const terpilih = varian.find((v) => v.id === varianId) ?? null;
  const hargaSatuan = terpilih ? terpilih.harga : hargaAkhir(produk);
  const maks = Math.min(MAKS_JUMLAH, typeof produk.stok === "number" ? Math.max(produk.stok, 1) : MAKS_JUMLAH);
  const jumlahAman = Math.min(Math.max(jumlah, 1), maks);

  function ubahJumlah(teks) {
    const angka = Number.parseInt(teks, 10);
    setJumlah(Number.isInteger(angka) ? Math.min(Math.max(angka, 1), maks) : 1);
  }

  if (habis) {
    return (
      <button
        type="button"
        disabled
        aria-disabled="true"
        className="inline-flex w-full cursor-not-allowed items-center justify-center rounded-lg border border-garis bg-permukaan px-5 py-3 font-semibold text-teks-lembut sm:w-auto"
      >
        Stok habis
      </button>
    );
  }

  const pesan = pesanSatuProduk({
    nama: produk.nama,
    varian: terpilih?.nama ?? null,
    jumlah: jumlahAman,
    hargaSatuan,
  });
  const tautanWa = linkWhatsApp(nomorWa, pesan);

  function tambahKeranjang() {
    const hasil = tambahKeKeranjang({ id: produk.id, varian: terpilih?.id ?? null, jumlah: jumlahAman });
    setUmpanBalik(hasil.error ? { teks: hasil.error, galat: true } : { teks: "Ditambahkan ke keranjang.", galat: false });
  }

  return (
    <div className="flex flex-col gap-4">
      {varian.length > 0 && (
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Pilih ukuran
          <select
            value={varianId ?? ""}
            onChange={(e) => setVarianId(Number(e.target.value))}
            className="w-full max-w-xs rounded-lg border border-garis bg-latar px-3 py-2.5 text-base text-teks focus:border-utama focus:outline-none"
          >
            {varian.map((v) => (
              <option key={v.id} value={v.id}>
                {v.nama} - {formatRupiah(v.harga)}
              </option>
            ))}
          </select>
        </label>
      )}

      {varian.length > 0 && (
        <p className="self-start rounded-md bg-harga-latar px-3 py-1 text-xl font-bold text-harga">
          {formatRupiah(hargaSatuan)}
        </p>
      )}

      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Jumlah
          <input
            type="number"
            min="1"
            max={maks}
            step="1"
            inputMode="numeric"
            value={jumlahAman}
            onChange={(e) => ubahJumlah(e.target.value)}
            className="w-24 rounded-lg border border-garis bg-latar px-3 py-2.5 text-base text-teks focus:border-utama focus:outline-none"
          />
        </label>
        <p className="pb-2.5 text-sm text-teks-lembut">
          Total <span className="font-bold text-teks">{formatRupiah(hargaSatuan * jumlahAman)}</span>
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <a
          href={tautanWa}
          target="_blank"
          rel="noopener noreferrer"
          // Pencatatan klik tidak ditunggu, jadi WhatsApp tetap terbuka walau pencatatan gagal.
          onClick={() => {
            catatKlikWa(produk.id).catch(() => {});
          }}
          className="inline-flex w-full items-center justify-center rounded-lg bg-utama px-5 py-3 font-semibold text-white hover:bg-utama-gelap sm:w-auto"
        >
          Pesan via WhatsApp
        </a>
        <button
          type="button"
          onClick={tambahKeranjang}
          className="inline-flex w-full items-center justify-center rounded-lg border border-garis px-5 py-3 font-semibold hover:border-utama hover:text-tautan sm:w-auto"
        >
          Tambah ke keranjang
        </button>
      </div>

      {umpanBalik.teks && (
        <p role="status" className={`text-sm ${umpanBalik.galat ? "text-bahaya" : "text-teks-lembut"}`}>
          {umpanBalik.teks}{" "}
          {!umpanBalik.galat && (
            <Link href="/keranjang" className="font-semibold underline underline-offset-4 hover:text-tautan">
              Lihat keranjang
            </Link>
          )}
        </p>
      )}
    </div>
  );
}
