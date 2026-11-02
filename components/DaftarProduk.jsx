import KartuProduk from "@/components/KartuProduk";

// Grid kartu produk yang dipakai di beranda, halaman kategori, favorit, dan terakhir dilihat.
export default function DaftarProduk({ produk }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
      {produk.map((p) => (
        <KartuProduk key={p.id} produk={p} />
      ))}
    </div>
  );
}
