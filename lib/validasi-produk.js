// Validasi data produk di server. Dipakai oleh aksi tambah dan ubah produk, serta impor CSV.
// Bukan file "use server", jadi boleh mengekspor fungsi biasa.

const MAKS_HARGA = 1_000_000_000;
const MAKS_STOK = 1_000_000;
const BADGE_BOLEH = ["baru", "terlaris"];
export const MAKS_GALERI = 6;

// Alamat foto: file lokal (/produk/..., /foto/...) atau alamat https.
// Menolak javascript:, data:, dan "//" tanpa protokol. Mengembalikan pesan error atau null.
export function cekAlamatFoto(alamat) {
  if (alamat.length > 500) return "Link foto terlalu panjang.";
  const lokal = alamat.startsWith("/") && !alamat.startsWith("//");
  const aman = alamat.startsWith("https://");
  if (!lokal && !aman) {
    return "Link foto harus diawali https:// atau / (contoh: /produk/kopi.svg).";
  }
  return null;
}

/**
 * Baca dan periksa isian form produk (US-34: pesan error per field).
 * Mengembalikan { nilai, errors, data }.
 *  - nilai: isian pengguna apa adanya (supaya form tidak kosong lagi setelah gagal)
 *  - errors: objek { namaField: pesan }; kosong kalau semua valid
 *  - data: hanya ada kalau valid, siap disimpan ke database
 * `kategoriBoleh` (opsional): daftar nama kategori yang diizinkan dari tabel kategori.
 */
export function validasiProduk(formData, { kategoriBoleh = null } = {}) {
  const ambil = (nama) => formData?.get?.(nama)?.toString() ?? "";

  const nilai = {
    nama: ambil("nama").trim(),
    harga: ambil("harga").trim(),
    kategori: ambil("kategori").trim(),
    foto_url: ambil("foto_url").trim(),
    deskripsi: ambil("deskripsi").trim(),
    stok: ambil("stok").trim(),
    harga_diskon: ambil("harga_diskon").trim(),
    badge: ambil("badge").trim(),
    galeri: ambil("galeri").trim(),
  };

  const errors = {};

  if (!nilai.nama) errors.nama = "Nama produk wajib diisi.";
  else if (nilai.nama.length > 120) errors.nama = "Nama produk maksimal 120 karakter.";

  let harga = null;
  if (!/^\d+$/.test(nilai.harga)) {
    errors.harga = "Harga harus berupa angka bulat, tanpa titik atau koma.";
  } else {
    harga = Number(nilai.harga);
    if (harga > MAKS_HARGA) errors.harga = "Harga terlalu besar.";
  }

  // US-20: harga diskon (boleh kosong) harus lebih kecil dari harga normal.
  let hargaDiskon = null;
  if (nilai.harga_diskon !== "") {
    if (!/^\d+$/.test(nilai.harga_diskon)) {
      errors.harga_diskon = "Harga diskon harus berupa angka bulat, tanpa titik atau koma.";
    } else {
      hargaDiskon = Number(nilai.harga_diskon);
      if (harga !== null && !errors.harga && hargaDiskon >= harga) {
        errors.harga_diskon = "Harga diskon harus lebih kecil dari harga normal.";
      }
    }
  }

  // US-19: stok wajib diisi (0 berarti habis).
  let stok = null;
  if (!/^\d+$/.test(nilai.stok) || Number(nilai.stok) > MAKS_STOK) {
    errors.stok = "Stok harus berupa angka bulat 0 atau lebih.";
  } else {
    stok = Number(nilai.stok);
  }

  // US-20: badge hanya boleh kosong, "baru", atau "terlaris".
  if (nilai.badge !== "" && !BADGE_BOLEH.includes(nilai.badge)) {
    errors.badge = "Badge harus dipilih dari daftar.";
  }

  if (nilai.kategori.length > 60) {
    errors.kategori = "Kategori maksimal 60 karakter.";
  } else if (
    nilai.kategori &&
    Array.isArray(kategoriBoleh) &&
    kategoriBoleh.length > 0 &&
    !kategoriBoleh.includes(nilai.kategori)
  ) {
    errors.kategori = "Pilih kategori dari daftar. Tambah kategori baru di menu Kategori.";
  }

  if (nilai.foto_url) {
    const pesan = cekAlamatFoto(nilai.foto_url);
    if (pesan) errors.foto_url = pesan;
  }

  // US-18: foto tambahan untuk galeri, satu link per baris.
  const galeri = nilai.galeri
    .split(/\r?\n/)
    .map((baris) => baris.trim())
    .filter(Boolean);
  if (galeri.length > MAKS_GALERI) {
    errors.galeri = `Foto tambahan maksimal ${MAKS_GALERI}.`;
  } else {
    const salah = galeri.map(cekAlamatFoto).find(Boolean);
    if (salah) errors.galeri = salah;
  }

  if (nilai.deskripsi.length > 2000) errors.deskripsi = "Deskripsi maksimal 2000 karakter.";

  if (Object.keys(errors).length > 0) {
    return { nilai, errors };
  }

  return {
    nilai,
    errors,
    data: {
      nama: nilai.nama,
      harga,
      kategori: nilai.kategori || null,
      foto_url: nilai.foto_url || null,
      deskripsi: nilai.deskripsi || null,
      stok,
      harga_diskon: hargaDiskon,
      badge: nilai.badge || null,
      galeri,
    },
  };
}

// Ringkasan umum yang tampil di atas form kalau ada error per field.
export const PESAN_PERIKSA_ISIAN = "Periksa kembali isian yang ditandai merah di bawah.";

/** Ubah id dari URL atau form menjadi angka bulat positif, atau null kalau tidak valid. */
export function idProduk(nilai) {
  const teks = String(nilai ?? "").trim();
  if (!/^\d{1,15}$/.test(teks)) return null;
  const angka = Number(teks);
  return angka > 0 ? angka : null;
}
