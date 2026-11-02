"use client";

import { useState } from "react";
import Link from "next/link";
import TombolFavorit from "@/components/TombolFavorit";
import TombolBanding from "@/components/TombolBanding";
import TombolBagikan from "@/components/TombolBagikan";
import { formatRupiah } from "@/lib/format";
import { hargaAkhir, stokHabis } from "@/lib/harga";
import { linkWhatsApp, pesanSatuProduk } from "@/lib/pesan-wa";
import { bacaKeranjang, sama, tulisDaftar } from "@/lib/lokal";
import { catatKlikWa } from "@/app/aksi-publik";

const KELAS_TOMBOL_UTAMA =
  "inline-flex w-full items-center justify-center rounded-lg bg-utama px-5 py-3 font-semibold text-white hover:bg-utama-gelap sm:w-auto";
const KELAS_TOMBOL_GARIS =
  "inline-flex w-full items-center justify-center rounded-lg border border-garis bg-latar px-5 py-3 font-semibold text-teks hover:border-utama hover:text-tautan sm:w-auto";

// US-12 (jumlah dan varian), US-19 (stok habis), US-21 (keranjang), US-40 (catat klik), US-48 (harga varian).
export default function AksiProduk({ produk, varian = [], nomor }) {
  const habis = stokHabis(produk);
  const maks = typeof produk.stok === "number" && produk.stok > 0 ? Math.min(99, produk.stok) : 99;

  const [varianId, setVarianId] = useState(varian[0]?.id ?? null);
  const [jumlah, setJumlah] = useState(1);
  const [pesan, setPesan] = useState("");

  const terpilih = varian.find((v) => v.id === varianId) ?? null;
  const hargaSatuan = terpilih ? terpilih.harga : hargaAkhir(produk);

  function aturJumlah(nilai) {
    const angka = Number.parseInt(nilai, 10);
    if (!Number.isInteger(angka)) return setJumlah(1);
    setJumlah(Math.min(maks, Math.max(1, angka)));
  }

  function tambahKeKeranjang() {
    const item = { id: produk.id, varianId: terpilih?.id ?? null, jumlah };
    const lama = bacaKeranjang();
    const ada = lama.find((x) => sama(x, item));
    const baru = ada
      ? lama.map((x) => (sama(x, item) ? { ...x, jumlah: Math.min(maks, x.jumlah + jumlah) } : x))
      : [...lama, item];
    tulisDaftar("keranjang", baru.slice(0, 30));
    setPesan("Ditambahkan ke keranjang.");
  }

  const pesanWa = pesanSatuProduk({ nama: produk.nama, varian: terpilih?.nama, jumlah, hargaSatuan });
  const hrefWa = linkWhatsApp(nomor, pesanWa);

  return (
    <div className="flex flex-col gap-5">
      {varian.length > 0 && (
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-semibold">Pilih ukuran atau varian</legend>
          <div className="flex flex-wrap gap-2">
            {varian.map((v) => (
              <label
                key={v.id}
                className={`cursor-pointer rounded-lg border px-4 py-2 text-sm font-semibold ${
                  v.id === varianId ? "border-utama bg-permukaan text-tautan" : "border-garis"
                }`}
              >
                <input
                  type="radio"
                  name="varian"
                  value={v.id}
                  checked={v.id === varianId}
                  onChange={() => setVarianId(v.id)}
                  className="sr-only"
                />
                {v.nama} · {formatRupiah(v.harga)}
              </label>
            ))}
          </div>
          <p className="self-start rounded-md bg-harga-latar px-3 py-1 text-xl font-bold text-harga">
            {formatRupiah(hargaSatuan)}
          </p>
        </fieldset>
      )}

      {!habis && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="jumlah" className="text-sm font-semibold">
            Jumlah
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => aturJumlah(jumlah - 1)}
              disabled={jumlah <= 1}
              aria-label="Kurangi jumlah"
              className="h-10 w-10 rounded-lg border border-garis text-lg font-bold disabled:opacity-40"
            >
              −
            </button>
            <input
              id="jumlah"
              type="number"
              inputMode="numeric"
              min={1}
              max={maks}
              value={jumlah}
              onChange={(e) => aturJumlah(e.target.value)}
              className="h-10 w-20 rounded-lg border border-garis bg-latar px-2 text-center text-base text-teks focus:border-utama focus:outline-none"
            />
            <button
              type="button"
              onClick={() => aturJumlah(jumlah + 1)}
              disabled={jumlah >= maks}
              aria-label="Tambah jumlah"
              className="h-10 w-10 rounded-lg border border-garis text-lg font-bold disabled:opacity-40"
            >
              +
            </button>
            {jumlah > 1 && <span className="text-sm text-teks-lembut">Total {formatRupiah(hargaSatuan * jumlah)}</span>}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {habis ? (
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="inline-flex w-full cursor-not-allowed items-center justify-center rounded-lg border border-garis bg-permukaan px-5 py-3 font-semibold text-teks-lembut sm:w-auto"
          >
            Stok habis
          </button>
        ) : (
          <>
            {/* US-40: klik dicatat tanpa menunggu hasilnya, jadi WhatsApp tetap langsung terbuka. */}
            <a
              href={hrefWa}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                catatKlikWa([produk.id]).catch(() => {});
              }}
              className={KELAS_TOMBOL_UTAMA}
            >
              Pesan via WhatsApp
            </a>
            <button type="button" onClick={tambahKeKeranjang} className={KELAS_TOMBOL_GARIS}>
              Tambah ke keranjang
            </button>
          </>
        )}
      </div>

      <p role="status" className="-mt-2 text-sm text-teks-lembut">
        {pesan}
        {pesan && (
          <>
            {" "}
            <Link href="/keranjang" className="font-semibold underline underline-offset-4 hover:text-tautan">
              Lihat keranjang
            </Link>
          </>
        )}
      </p>

      <div className="flex flex-wrap items-start gap-3">
        <TombolFavorit id={produk.id} nama={produk.nama} teks />
        <TombolBanding id={produk.id} />
        <TombolBagikan judul={produk.nama} />
      </div>
    </div>
  );
}
