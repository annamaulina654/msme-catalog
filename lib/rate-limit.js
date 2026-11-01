// K-12: pembatas percobaan sederhana (rate limit) untuk login dan ganti password.
//
// Catatan: data disimpan di memori server. Di Vercel, setiap instance punya memori
// sendiri dan bisa dimulai ulang, jadi ini penghambat yang efektif untuk tebak-tebakan
// password biasa, tetapi bukan penjaga mutlak. Untuk penjaga mutlak, simpan hitungan
// di database atau layanan seperti Upstash Redis.

const catatan = new Map();

/**
 * Hitung satu percobaan untuk `kunci`.
 * Mengembalikan { diizinkan: true } atau { diizinkan: false, tungguDetik }.
 */
export function cekBatas(kunci, { maks = 5, jendelaMs = 15 * 60 * 1000 } = {}) {
  const sekarang = Date.now();

  // Bersihkan catatan lama supaya memori tidak membengkak.
  if (catatan.size > 1000) {
    for (const [k, v] of catatan) {
      if (v.reset <= sekarang) catatan.delete(k);
    }
  }

  const ada = catatan.get(kunci);

  if (!ada || ada.reset <= sekarang) {
    catatan.set(kunci, { jumlah: 1, reset: sekarang + jendelaMs });
    return { diizinkan: true };
  }

  ada.jumlah += 1;

  if (ada.jumlah > maks) {
    return { diizinkan: false, tungguDetik: Math.ceil((ada.reset - sekarang) / 1000) };
  }

  return { diizinkan: true };
}

/** Hapus hitungan, dipakai setelah login berhasil. */
export function resetBatas(kunci) {
  catatan.delete(kunci);
}

/** Teks "coba lagi dalam N menit" yang ramah dibaca. */
export function teksTunggu(tungguDetik) {
  const menit = Math.max(1, Math.ceil(tungguDetik / 60));
  return `Terlalu banyak percobaan. Coba lagi dalam ${menit} menit.`;
}
