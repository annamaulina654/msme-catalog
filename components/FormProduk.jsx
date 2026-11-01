"use client";

import { useActionState } from "react";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";

// Dipakai untuk tambah produk (US-08) dan ubah produk (US-09).
// `aksi` adalah Server Action dari halaman induk; pengecekan login dan validasi
// dilakukan di server (app/admin/actions.js), bukan di sini.
// Nama field sama dengan kolom tabel "produk".
export default function FormProduk({ produk = {}, labelTombol, aksi }) {
  const [state, formAction, isPending] = useActionState(aksi, null);

  // Setelah gagal validasi, tampilkan lagi apa yang tadi diketik pengguna.
  const nilai = state?.nilai ?? produk;

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      {state?.error && (
        <div
          role="alert"
          className="rounded-lg border border-garis bg-permukaan p-3 text-sm text-bahaya"
        >
          {state.error}
        </div>
      )}

      <Input label="Nama produk" name="nama" defaultValue={nilai.nama ?? ""} maxLength={120} required />
      <Input
        label="Harga (Rp)"
        name="harga"
        type="number"
        min="0"
        step="1"
        inputMode="numeric"
        defaultValue={nilai.harga ?? ""}
        required
      />
      {/* US-20: harga diskon opsional. Kalau diisi, harga normal tampil dicoret. */}
      <Input
        label="Harga diskon (Rp), kosongkan kalau tidak ada"
        name="harga_diskon"
        type="number"
        min="0"
        step="1"
        inputMode="numeric"
        defaultValue={nilai.harga_diskon ?? ""}
      />
      {/* US-19: stok 0 berarti habis, tombol pesan dinonaktifkan. */}
      <Input
        label="Stok (isi 0 kalau habis)"
        name="stok"
        type="number"
        min="0"
        step="1"
        inputMode="numeric"
        defaultValue={nilai.stok ?? 10}
        required
      />
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Badge
        <select
          name="badge"
          defaultValue={nilai.badge ?? ""}
          className="w-full rounded-lg border border-garis bg-latar px-3 py-2.5 text-base text-teks focus:border-utama focus:outline-none"
        >
          <option value="">Tanpa badge</option>
          <option value="baru">Baru</option>
          <option value="terlaris">Terlaris</option>
        </select>
      </label>
      <Input label="Kategori" name="kategori" defaultValue={nilai.kategori ?? ""} maxLength={60} />
      <Input
        label="Link foto"
        name="foto_url"
        placeholder="https://... atau /produk/nama-file.svg"
        defaultValue={nilai.foto_url ?? ""}
        maxLength={500}
      />
      <Input
        label="Deskripsi"
        name="deskripsi"
        textarea
        defaultValue={nilai.deskripsi ?? ""}
        maxLength={2000}
      />
      <div className="flex gap-3">
        <Tombol type="submit" disabled={isPending}>
          {isPending ? "Menyimpan..." : labelTombol}
        </Tombol>
        <Tombol href="/admin" varian="garis">
          Batal
        </Tombol>
      </div>
    </form>
  );
}
