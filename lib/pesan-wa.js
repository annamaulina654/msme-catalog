import { formatRupiah } from "@/lib/format";

// Bentuk link wa.me dari nomor dan teks pesan. Aman dipakai di server maupun browser.
export function linkWhatsApp(nomor, pesan) {
  const angka = String(nomor ?? "").replace(/\D/g, "");
  return `https://wa.me/${angka}?text=${encodeURIComponent(pesan)}`;
}

// Satu produk (US-12 dan US-48): jumlah dan varian ikut tertulis di pesan.
export function pesanSatuProduk({ nama, varian, jumlah, hargaSatuan }) {
  const namaLengkap = varian ? `${nama} (${varian})` : nama;
  const total = hargaSatuan * jumlah;
  const rincian = jumlah > 1 ? ` @ ${formatRupiah(hargaSatuan)}, total ${formatRupiah(total)}` : ` seharga ${formatRupiah(hargaSatuan)}`;
  return `Halo, saya ingin memesan ${jumlah} x ${namaLengkap}${rincian}.`;
}

// Keranjang (US-21): seluruh isi keranjang dalam satu pesan.
export function pesanKeranjang(item) {
  const baris = item.map((barang, i) => {
    const namaLengkap = barang.varian ? `${barang.nama} (${barang.varian})` : barang.nama;
    return `${i + 1}. ${namaLengkap}: ${barang.jumlah} x ${formatRupiah(barang.harga)} = ${formatRupiah(barang.harga * barang.jumlah)}`;
  });
  const total = item.reduce((jumlah, barang) => jumlah + barang.harga * barang.jumlah, 0);
  return ["Halo, saya ingin memesan:", ...baris, `Total: ${formatRupiah(total)}`].join("\n");
}
