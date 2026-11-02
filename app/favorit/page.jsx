import { DaftarFavorit } from "@/components/DaftarTersimpan";

export const metadata = { title: "Favorit", robots: { index: false, follow: true } };

// US-24: produk favorit, disimpan di browser pengunjung.
export default function HalamanFavorit() {
  return (
    <div className="flex flex-col gap-6 py-8 md:py-12">
      <h1 className="text-3xl font-extrabold tracking-tight">Favorit</h1>
      <p className="text-sm text-teks-lembut">Favorit tersimpan di browser ini, jadi tidak ikut ke perangkat lain.</p>
      <DaftarFavorit />
    </div>
  );
}
