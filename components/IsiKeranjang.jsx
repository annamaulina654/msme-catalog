"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { muatProduk } from "@/app/aksi-publik";
import Tombol from "@/components/Tombol";
import { formatRupiah } from "@/lib/format";
import { hargaAkhir, stokHabis } from "@/lib/harga";
import { linkWhatsApp, pesanKeranjang } from "@/lib/pesan-wa";
import { KUNCI, MAKS_JUMLAH, tulisDaftar, useDaftarTersimpan } from "@/components/penyimpanan";

// US-21: keranjang. Browser hanya menyimpan id, varian, dan jumlah. Nama, harga, dan stok diambil segar dari
// server setiap kali halaman dibuka, jadi harga yang dikirim ke WhatsApp selalu harga terbaru.
export default function IsiKeranjang({ nomorWa }) {
  const [tersimpan] = useDaftarTersimpan(KUNCI.keranjang);
  const [produk, setProduk] = useState(null);
  const [gagal, setGagal] = useState(false);

  const kunciId = useMemo(() => (tersimpan ?? []).map((x) => x.id).join(","), [tersimpan]);

  useEffect(() => {
    if (tersimpan === null) return;
    const ids = [...new Set(tersimpan.map((x) => x.id))];
    if (ids.length === 0) {
      setProduk([]);
      return;
    }
    let batal = false;
    muatProduk(ids)
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
    // Hanya dimuat ulang saat daftar produk di keranjang berubah, bukan saat jumlah berubah.
  }, [kunciId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (tersimpan === null || (produk === null && !gagal)) {
    return <p className="py-8 text-teks-lembut">Memuat keranjang...</p>;
  }
  if (gagal) {
    return <p className="py-8 text-bahaya">Keranjang belum bisa dimuat. Silakan muat ulang halaman.</p>;
  }

  const peta = new Map((produk ?? []).map((p) => [p.id, p]));

  // Gabungkan isi keranjang dengan data terbaru. Item yang produknya sudah tidak ada ditandai.
  const baris = tersimpan.map((item) => {
    const p = peta.get(item.id);
    if (!p) return { item, hilang: true };
    const v = item.varian ? p.varian.find((x) => x.id === item.varian) : null;
    const tidakAda = item.varian && !v; // varian sudah dihapus
    const harga = v ? v.harga : hargaAkhir(p);
    return { item, p, v, harga, habis: stokHabis(p) || Boolean(tidakAda), hilang: false };
  });

  const bisaDipesan = baris.filter((b) => !b.hilang && !b.habis);
  const total = bisaDipesan.reduce((n, b) => n + b.harga * b.item.jumlah, 0);

  function simpanBaru(daftarBaru) {
    tulisDaftar(KUNCI.keranjang, daftarBaru);
  }
  const sama = (a, b) => a.id === b.id && (a.varian ?? null) === (b.varian ?? null);

  function ubahJumlah(item, jumlah) {
    const baru = Math.min(MAKS_JUMLAH, Math.max(1, jumlah));
    simpanBaru(tersimpan.map((x) => (sama(x, item) ? { ...x, jumlah: baru } : x)));
  }
  function hapus(item) {
    simpanBaru(tersimpan.filter((x) => !sama(x, item)));
  }

  if (tersimpan.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4 py-8">
        <p className="text-teks-lembut">Keranjang masih kosong.</p>
        <Tombol href="/">Lihat produk</Tombol>
      </div>
    );
  }

  const pesan = pesanKeranjang(
    bisaDipesan.map((b) => ({
      nama: b.p.nama,
      varian: b.v?.nama ?? null,
      jumlah: b.item.jumlah,
      harga: b.harga,
    }))
  );

  return (
    <div className="flex flex-col gap-6">
      <ul className="flex flex-col divide-y divide-garis rounded-2xl border border-garis">
        {baris.map((b) => (
          <li key={`${b.item.id}-${b.item.varian ?? 0}`} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
            {b.hilang ? (
              <p className="flex-1 text-sm text-teks-lembut">Produk ini sudah tidak tersedia.</p>
            ) : (
              <div className="flex flex-1 items-center gap-3">
                <img src={b.p.foto_url} alt="" className="h-16 w-16 rounded-lg object-cover" />
                <div>
                  <Link href={`/produk/${b.p.id}`} className="font-semibold hover:text-tautan">
                    {b.p.nama}
                  </Link>
                  {b.v && <p className="text-sm text-teks-lembut">{b.v.nama}</p>}
                  <p className="text-sm text-teks-lembut">
                    {formatRupiah(b.harga)}
                    {b.habis && <span className="ml-2 font-semibold text-bahaya">Stok habis, tidak ikut dipesan</span>}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              {!b.hilang && (
                <div className="flex items-center gap-1" role="group" aria-label="Jumlah">
                  <button
                    type="button"
                    onClick={() => ubahJumlah(b.item, b.item.jumlah - 1)}
                    disabled={b.item.jumlah <= 1}
                    aria-label="Kurangi jumlah"
                    className="h-9 w-9 rounded-lg border border-garis font-bold hover:border-utama disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-semibold" aria-live="polite">
                    {b.item.jumlah}
                  </span>
                  <button
                    type="button"
                    onClick={() => ubahJumlah(b.item, b.item.jumlah + 1)}
                    disabled={b.item.jumlah >= MAKS_JUMLAH}
                    aria-label="Tambah jumlah"
                    className="h-9 w-9 rounded-lg border border-garis font-bold hover:border-utama disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              )}
              {!b.hilang && !b.habis && (
                <p className="w-28 text-right font-bold">{formatRupiah(b.harga * b.item.jumlah)}</p>
              )}
              <button
                type="button"
                onClick={() => hapus(b.item)}
                className="text-sm text-teks-lembut underline underline-offset-4 hover:text-bahaya"
              >
                Hapus
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-4 rounded-2xl border border-garis bg-permukaan p-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-lg">
          Total <span className="font-extrabold">{formatRupiah(total)}</span>
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Kosongkan seluruh keranjang?")) simpanBaru([]);
            }}
            className="rounded-lg border border-garis px-4 py-2.5 text-sm font-semibold hover:border-bahaya hover:text-bahaya"
          >
            Kosongkan
          </button>
          {bisaDipesan.length > 0 ? (
            <a
              href={linkWhatsApp(nomorWa, pesan)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg bg-utama px-5 py-2.5 font-semibold text-white hover:bg-utama-gelap"
            >
              Pesan semua via WhatsApp
            </a>
          ) : (
            <span className="inline-flex items-center rounded-lg border border-garis px-5 py-2.5 font-semibold text-teks-lembut">
              Tidak ada barang yang bisa dipesan
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
