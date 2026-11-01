import { stokHabis } from "@/lib/harga";

const DAFTAR_BADGE = {
  baru: { teks: "Baru", kelas: "bg-utama text-white" },
  terlaris: { teks: "Terlaris", kelas: "bg-harga text-harga-latar" },
};

// US-19 dan US-20: penanda "Habis", "Baru", atau "Terlaris" berdasarkan data produk.
export default function BadgeProduk({ produk, className = "" }) {
  const label = [];

  if (stokHabis(produk)) {
    label.push({ teks: "Habis", kelas: "bg-teks text-latar" });
  }
  if (produk?.badge && DAFTAR_BADGE[produk.badge]) {
    label.push(DAFTAR_BADGE[produk.badge]);
  }

  if (label.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {label.map((item) => (
        <span
          key={item.teks}
          className={`rounded-md px-2 py-0.5 text-xs font-bold shadow-sm ${item.kelas}`}
        >
          {item.teks}
        </span>
      ))}
    </div>
  );
}
