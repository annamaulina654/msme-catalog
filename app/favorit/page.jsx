import DaftarFavorit from "@/components/DaftarFavorit";

export const metadata = {
  title: "Favorit",
  robots: { index: false, follow: true },
};

// US-24: halaman favorit. Daftar favorit disimpan di browser pengunjung.
export default function HalamanFavorit() {
  return (
    <div className="flex flex-col gap-6 py-8 md:py-12">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Favorit</h1>
        <p className="mt-1 text-sm text-teks-lembut">Disimpan di browser ini, jadi tidak perlu login.</p>
      </div>
      <DaftarFavorit />
    </div>
  );
}
