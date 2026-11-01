// Validasi data produk di server. Dipakai oleh aksi tambah dan ubah produk.
// Bukan file "use server", jadi boleh mengekspor fungsi biasa.

const MAKS_HARGA = 1_000_000_000;
const MAKS_STOK = 1_000_000;
const BADGE_BOLEH = ["baru", "terlaris"];

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
    stok: ambil("stok").trim(),
    harga_diskon: ambil("harga_diskon").trim(),
    badge: ambil("badge").trim(),
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

  // US-19: stok wajib diisi (0 berarti habis). Dibuat wajib supaya stok tidak terisi tanpa sengaja.
  if (!/^\d+$/.test(nilai.stok) || Number(nilai.stok) > MAKS_STOK) {
    return { nilai, error: "Stok harus berupa angka bulat 0 atau lebih." };
  }
  const stok = Number(nilai.stok);

  // US-20: harga diskon (boleh kosong) harus lebih kecil dari harga normal.
  let hargaDiskon = null;
  if (nilai.harga_diskon !== "") {
    if (!/^\d+$/.test(nilai.harga_diskon)) {
      return { nilai, error: "Harga diskon harus berupa angka bulat, tanpa titik atau koma." };
    }
    hargaDiskon = Number(nilai.harga_diskon);
    if (hargaDiskon >= harga) {
      return { nilai, error: "Harga diskon harus lebih kecil dari harga normal." };
    }
  }

  // US-20: badge hanya boleh kosong, "baru", atau "terlaris".
  if (nilai.badge !== "" && !BADGE_BOLEH.includes(nilai.badge)) {
    return { nilai, error: "Badge harus dipilih dari daftar." };
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
      stok,
      harga_diskon: hargaDiskon,
      badge: nilai.badge || null,
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
