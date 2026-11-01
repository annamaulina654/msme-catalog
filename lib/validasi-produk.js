// Validasi data produk di server. Dipakai oleh aksi tambah dan ubah produk.
// Bukan file "use server", jadi boleh mengekspor fungsi biasa.

const MAKS_HARGA = 1_000_000_000;

/**
 * Baca dan periksa isian form produk.
 * Mengembalikan { nilai, error }. `nilai` selalu berisi isian pengguna
 * (supaya form tidak kosong lagi setelah gagal), `data` hanya ada kalau valid.
 */
export function validasiProduk(formData) {
  const ambil = (nama) => formData?.get?.(nama)?.toString() ?? "";

  const nilai = {
    nama: ambil("nama").trim(),
    harga: ambil("harga").trim(),
    kategori: ambil("kategori").trim(),
    foto_url: ambil("foto_url").trim(),
    deskripsi: ambil("deskripsi").trim(),
  };

  if (!nilai.nama) {
    return { nilai, error: "Nama produk wajib diisi." };
  }
  if (nilai.nama.length > 120) {
    return { nilai, error: "Nama produk maksimal 120 karakter." };
  }

  if (!/^\d+$/.test(nilai.harga)) {
    return { nilai, error: "Harga harus berupa angka bulat, tanpa titik atau koma." };
  }
  const harga = Number(nilai.harga);
  if (harga > MAKS_HARGA) {
    return { nilai, error: "Harga terlalu besar." };
  }

  if (nilai.kategori.length > 60) {
    return { nilai, error: "Kategori maksimal 60 karakter." };
  }

  if (nilai.foto_url) {
    if (nilai.foto_url.length > 500) {
      return { nilai, error: "Link foto terlalu panjang." };
    }
    // Hanya izinkan file lokal (/produk/...) atau alamat https.
    // Menolak javascript:, data:, dan alamat "//" tanpa protokol.
    const lokal = nilai.foto_url.startsWith("/") && !nilai.foto_url.startsWith("//");
    const aman = nilai.foto_url.startsWith("https://");
    if (!lokal && !aman) {
      return {
        nilai,
        error: "Link foto harus diawali https:// atau / (contoh: /produk/kopi.svg).",
      };
    }
  }

  if (nilai.deskripsi.length > 2000) {
    return { nilai, error: "Deskripsi maksimal 2000 karakter." };
  }

  return {
    nilai,
    data: {
      nama: nilai.nama,
      harga,
      kategori: nilai.kategori || null,
      foto_url: nilai.foto_url || null,
      deskripsi: nilai.deskripsi || null,
    },
  };
}

/** Ubah id dari URL atau form menjadi angka bulat positif, atau null kalau tidak valid. */
export function idProduk(nilai) {
  const teks = String(nilai ?? "").trim();
  if (!/^\d{1,15}$/.test(teks)) return null;
  const angka = Number(teks);
  return angka > 0 ? angka : null;
}
