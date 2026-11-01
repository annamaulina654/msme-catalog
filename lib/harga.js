// Aturan harga dan stok produk, dipakai di kartu, halaman detail, dan tombol WhatsApp.
// Aman dipakai walau kolom baru (stok, harga_diskon) belum ada di database: nilai
// yang tidak ada dianggap "tidak ada diskon" dan "stok tersedia".

export function stokHabis(produk) {
  return typeof produk?.stok === "number" && produk.stok <= 0;
}

export function adaDiskon(produk) {
  return (
    Number.isInteger(produk?.harga_diskon) &&
    produk.harga_diskon >= 0 &&
    produk.harga_diskon < produk.harga
  );
}

// Harga yang harus dibayar pembeli.
export function hargaAkhir(produk) {
  return adaDiskon(produk) ? produk.harga_diskon : produk.harga;
}
