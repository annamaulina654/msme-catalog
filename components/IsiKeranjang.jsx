"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Tombol from "@/components/Tombol";
import { formatRupiah } from "@/lib/format";
import { linkWhatsApp, pesanKeranjang } from "@/lib/pesan-wa";
import { bacaKeranjang, sama, tulisDaftar, useDaftarLokal } from "@/lib/lokal";
import { catatKlikWa, rincianKeranjang } from "@/app/aksi-publik";

// US-21: keranjang. Isinya (id, varian, jumlah) disimpan di browser; nama dan harga selalu diambil
// ulang dari server supaya total benar walau harga berubah.
export default function IsiKeranjang({ nomor }) {
  const isi = useDaftarLokal("keranjang", bacaKeranjang);
  const [rincian, setRincian] = useState(null);
  const [gagal, setGagal] = useState(false);
  const kunci = useMemo(() => (isi ? isi.map((x) => `${x.id}:${x.varianId ?? 0}`).join(",") : null), [isi]);

  useEffect(() => {
    if (isi === null) return undefined;
    if (isi.length === 0) {
      setRincian([]);
      return undefined;
    }
    let batal = false;
    setGagal(false);
    rincianKeranjang(isi)
      .then((hasil) => {
        if (!batal) setRincian(hasil.item);
      })
      .catch(() => {
        if (!batal) setGagal(true);
      });
    return () => {
      batal = true;
    };
    // Hanya diambil ulang kalau susunan barang berubah, bukan saat jumlah berubah.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kunci]);

  const baris = useMemo(() => {
    if (!isi || !rincian) return [];
    return isi
      .map((x) => {
        const r = rincian.find((y) => sama(y, x));
        return r ? { ...r, jumlah: x.jumlah } : null;
      })
      .filter(Boolean);
  }, [isi, rincian]);

  // Barang yang sudah tidak ada atau nonaktif dibuang dari keranjang.
  useEffect(() => {
    if (!isi || !rincian || isi.length === 0) return;
    const masihAda = isi.filter((x) => rincian.some((y) => sama(y, x)));
    if (masihAda.length !== isi.length) tulisDaftar("keranjang", masihAda);
  }, [isi, rincian]);

  const adaHabis = baris.some((b) => b.habis);
  const bisaDipesan = baris.filter((b) => !b.habis);
  const total = bisaDipesan.reduce((n, b) => n + b.harga * b.jumlah, 0);

  function ubahJumlah(item, jumlahBaru) {
    const maks = typeof item.stok === "number" && item.stok > 0 ? Math.min(99, item.stok) : 99;
    const jumlah = Math.min(maks, Math.max(1, jumlahBaru));
    tulisDaftar(
      "keranjang",
      bacaKeranjang().map((x) => (sama(x, item) ? { ...x, jumlah } : x))
    );
  }

  function hapus(item) {
    tulisDaftar(
      "keranjang",
      bacaKeranjang().filter((x) => !sama(x, item))
    );
  }

  function kosongkan() {
    tulisDaftar("keranjang", []);
  }

  if (isi === null || (isi.length > 0 && rincian === null && !gagal)) {
    return <p className="py-12 text-center text-teks-lembut">Memuat keranjang...</p>;
  }

  if (gagal) {
    return (
      <div className="rounded-xl border border-garis bg-permukaan p-6 text-center text-bahaya">
        Keranjang belum bisa dimuat. Muat ulang halaman ini.
      </div>
    );
  }

  if (baris.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4 py-8">
        <p className="text-teks-lembut">Keranjang masih kosong.</p>
        <Tombol href="/">Lihat produk</Tombol>
      </div>
    );
  }

  const pesan = pesanKeranjang(
    bisaDipesan.map((b) => ({ nama: b.nama, varian: b.varianNama, jumlah: b.jumlah, harga: b.harga }))
  );

  return (
    <div className="flex max-w-3xl flex-col gap-5">
      <ul className="flex flex-col divide-y divide-garis rounded-2xl border border-garis">
        {baris.map((b) => (
          <li key={`${b.id}:${b.varianId ?? 0}`} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
            <img src={b.foto_url} alt="" className={`h-16 w-16 rounded-lg object-cover ${b.habis ? "opacity-50" : ""}`} />
            <div className="flex-1">
              <Link href={`/produk/${b.id}`} className="font-semibold hover:text-tautan">
                {b.nama}
              </Link>
              {b.varianNama && <p className="text-sm text-teks-lembut">{b.varianNama}</p>}
              <p className="text-sm text-teks-lembut">
                {formatRupiah(b.harga)}
                {b.habis && <span className="ml-2 font-semibold text-bahaya">Stok habis, tidak ikut dipesan</span>}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => ubahJumlah(b, b.jumlah - 1)}
                disabled={b.jumlah <= 1}
                aria-label={`Kurangi jumlah ${b.nama}`}
                className="h-9 w-9 rounded-lg border border-garis font-bold disabled:opacity-40"
              >
                −
              </button>
              <span className="w-8 text-center font-semibold" aria-live="polite">
                {b.jumlah}
              </span>
              <button
                type="button"
                onClick={() => ubahJumlah(b, b.jumlah + 1)}
                aria-label={`Tambah jumlah ${b.nama}`}
                className="h-9 w-9 rounded-lg border border-garis font-bold"
              >
                +
              </button>
            </div>
            <p className="w-28 text-right font-semibold">{formatRupiah(b.harga * b.jumlah)}</p>
            <button
              type="button"
              onClick={() => hapus(b)}
              className="text-sm text-teks-lembut underline underline-offset-4 hover:text-bahaya"
              aria-label={`Hapus ${b.nama} dari keranjang`}
            >
              Hapus
            </button>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between rounded-2xl border border-garis bg-permukaan p-4">
        <span className="font-semibold">Total{adaHabis ? " (tanpa barang yang habis)" : ""}</span>
        <span className="text-2xl font-extrabold">{formatRupiah(total)}</span>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        {bisaDipesan.length > 0 ? (
          <a
            href={linkWhatsApp(nomor, pesan)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              catatKlikWa(bisaDipesan.map((b) => b.id)).catch(() => {});
            }}
            className="inline-flex items-center justify-center rounded-lg bg-utama px-5 py-3 font-semibold text-white hover:bg-utama-gelap"
          >
            Pesan semua via WhatsApp
          </a>
        ) : (
          <p className="text-sm text-bahaya">Semua barang di keranjang sedang habis.</p>
        )}
        <Tombol type="button" varian="garis" onClick={kosongkan}>
          Kosongkan keranjang
        </Tombol>
      </div>
    </div>
  );
}
