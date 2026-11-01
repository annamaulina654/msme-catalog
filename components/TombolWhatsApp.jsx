import { toko } from "@/lib/toko";
import { formatRupiah } from "@/lib/format";
import { hargaAkhir, stokHabis } from "@/lib/harga";

export default function TombolWhatsApp({ produk }) {
  // US-19: produk yang habis tidak bisa dipesan.
  if (stokHabis(produk)) {
    return (
      <button
        type="button"
        disabled
        aria-disabled="true"
        className="inline-flex w-full cursor-not-allowed items-center justify-center rounded-lg border border-garis bg-permukaan px-5 py-3 font-semibold text-teks-lembut sm:w-auto"
      >
        Stok habis
      </button>
    );
  }

  const nomor = toko.nomorWhatsApp.replace(/\D/g, "");
  // US-20: pesan berisi harga yang benar-benar dibayar (sudah termasuk diskon).
  const pesan = `Halo, saya ingin memesan ${produk.nama} seharga ${formatRupiah(hargaAkhir(produk))}.`;
  const linkWhatsApp = `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`;

  return (
    <a
      href={linkWhatsApp}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex w-full items-center justify-center rounded-lg bg-utama px-5 py-3 font-semibold text-white hover:bg-utama-gelap sm:w-auto"
    >
      Pesan via WhatsApp
    </a>
  );
}
