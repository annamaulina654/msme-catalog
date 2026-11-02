"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { buatDeskripsiAI } from "@/app/admin/actions";

const KELAS_PILIHAN =
  "w-full rounded-lg border bg-latar px-3 py-2.5 text-base text-teks focus:border-utama focus:outline-none";

// Dipakai untuk tambah produk (US-08) dan ubah produk (US-09).
// `aksi` adalah Server Action dari halaman induk; pengecekan login dan validasi
// dilakukan di server (app/admin/actions.js), bukan di sini.
// `daftarKategori` berisi nama kategori dari tabel kategori (US-31).
export default function FormProduk({ produk = {}, labelTombol, aksi, daftarKategori = [] }) {
  const [state, formAction, isPending] = useActionState(aksi, null);
  const formRef = useRef(null);

  // Setelah gagal validasi, tampilkan lagi apa yang tadi diketik pengguna.
  const nilai = state?.nilai ?? produk;
  const errors = state?.errors ?? {};
  const galeriAwal = Array.isArray(nilai.galeri) ? nilai.galeri.join("\n") : (nilai.galeri ?? "");

  // US-14: deskripsi bisa diisi AI. Teks ditampung di state supaya bisa diisi dari hasil AI.
  const [deskripsi, setDeskripsi] = useState(nilai.deskripsi ?? "");
  const [pesanAi, setPesanAi] = useState("");
  const [aiBerjalan, mulaiAi] = useTransition();

  function buatDenganAi() {
    const data = new FormData(formRef.current);
    setPesanAi("");
    mulaiAi(async () => {
      const hasil = await buatDeskripsiAI(data.get("nama"), data.get("kategori"));
      if (hasil.error) {
        setPesanAi(hasil.error);
      } else {
        setDeskripsi(hasil.deskripsi);
        setPesanAi("Deskripsi dibuat AI. Periksa dan ubah dulu sebelum menyimpan.");
      }
    });
  }

  // Kategori lama yang tidak ada di daftar tetap muncul sebagai pilihan supaya tidak hilang.
  const pilihanKategori =
    nilai.kategori && !daftarKategori.includes(nilai.kategori)
      ? [nilai.kategori, ...daftarKategori]
      : daftarKategori;

  return (
    <form ref={formRef} action={formAction} className="flex max-w-xl flex-col gap-4">
      {state?.error && (
        <div
          role="alert"
          className="rounded-lg border border-garis bg-permukaan p-3 text-sm text-bahaya"
        >
          {state.error}
        </div>
      )}

      <Input
        label="Nama produk"
        name="nama"
        defaultValue={nilai.nama ?? ""}
        maxLength={120}
        required
        error={errors.nama}
      />
      <Input
        label="Harga (Rp)"
        name="harga"
        type="number"
        min="0"
        step="1"
        inputMode="numeric"
        defaultValue={nilai.harga ?? ""}
        required
        error={errors.harga}
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
        error={errors.harga_diskon}
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
        error={errors.stok}
      />
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Badge
        <select
          name="badge"
          defaultValue={nilai.badge ?? ""}
          className={`${KELAS_PILIHAN} ${errors.badge ? "border-bahaya" : "border-garis"}`}
        >
          <option value="">Tanpa badge</option>
          <option value="baru">Baru</option>
          <option value="terlaris">Terlaris</option>
        </select>
        {errors.badge && <span className="text-sm font-normal text-bahaya">{errors.badge}</span>}
      </label>

      {/* US-31: pilihan kategori berasal dari menu Kategori. */}
      {pilihanKategori.length > 0 ? (
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Kategori
          <select
            name="kategori"
            defaultValue={nilai.kategori ?? ""}
            className={`${KELAS_PILIHAN} ${errors.kategori ? "border-bahaya" : "border-garis"}`}
          >
            <option value="">Tanpa kategori</option>
            {pilihanKategori.map((nama) => (
              <option key={nama} value={nama}>
                {nama}
              </option>
            ))}
          </select>
          {errors.kategori && <span className="text-sm font-normal text-bahaya">{errors.kategori}</span>}
        </label>
      ) : (
        <Input
          label="Kategori"
          name="kategori"
          defaultValue={nilai.kategori ?? ""}
          maxLength={60}
          error={errors.kategori}
        />
      )}

      {/* US-29: foto dari komputer atau link. Foto yang diunggah menggantikan link. */}
      <Input
        label="Unggah foto utama (JPG, PNG, atau WebP, maks 1,5 MB)"
        name="foto_file"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        error={errors.foto_file}
      />
      <Input
        label="Atau link foto"
        name="foto_url"
        placeholder="https://... atau /produk/nama-file.svg"
        defaultValue={nilai.foto_url ?? ""}
        maxLength={500}
        error={errors.foto_url}
      />

      {/* US-18: galeri foto tambahan. */}
      <Input
        label="Foto tambahan untuk galeri (satu link per baris, maks 6)"
        name="galeri"
        textarea
        defaultValue={galeriAwal}
        error={errors.galeri}
      />
      <Input
        label="Tambah satu foto galeri dari komputer"
        name="galeri_file"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        error={errors.galeri_file}
      />

      <div className="flex flex-col gap-2">
        <Input
          label="Deskripsi"
          name="deskripsi"
          textarea
          value={deskripsi}
          onChange={(e) => setDeskripsi(e.target.value)}
          maxLength={2000}
          error={errors.deskripsi}
        />
        <div className="flex flex-wrap items-center gap-3">
          <Tombol type="button" varian="garis" onClick={buatDenganAi} disabled={aiBerjalan}>
            {aiBerjalan ? "AI sedang menulis..." : "Buat deskripsi dengan AI"}
          </Tombol>
          {pesanAi && (
            <p role="status" className="text-sm text-teks-lembut">
              {pesanAi}
            </p>
          )}
        </div>
      </div>

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
