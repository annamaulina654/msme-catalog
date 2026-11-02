import NavAdmin from "@/components/NavAdmin";
import FormImpor from "@/components/FormImpor";
import Tombol from "@/components/Tombol";

export const dynamic = "force-dynamic";

// US-46: impor banyak produk sekaligus dari file CSV.
export default function HalamanImpor() {
  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div>
        <h1 className="text-2xl font-extrabold">Impor produk dari CSV</h1>
        <p className="mt-1 max-w-prose text-sm text-teks-lembut">
          Baris pertama berisi judul kolom. Kolom wajib: <code>nama</code> dan <code>harga</code>. Kolom lain yang
          dikenali: <code>kategori</code>, <code>foto_url</code>, <code>deskripsi</code>, <code>stok</code> (bawaan 10),{" "}
          <code>harga_diskon</code>, dan <code>badge</code> (baru atau terlaris). Baris yang salah dilaporkan beserta
          nomor barisnya, sedangkan baris yang benar tetap disimpan.
        </p>
      </div>

      <pre className="max-w-2xl overflow-x-auto rounded-xl border border-garis bg-permukaan p-4 text-xs">
{`nama,harga,kategori,stok,deskripsi
Kopi Arabika 200 g,65000,Minuman,20,"Disangrai medium, aroma buah"
Keripik Pisang,18000,Camilan,35,Renyah dan manis`}
      </pre>

      <div className="flex flex-wrap gap-2">
        <Tombol href="/admin/ekspor" unduh varian="garis">
          Unduh produk saat ini (bisa dijadikan contoh)
        </Tombol>
      </div>

      <FormImpor />
    </div>
  );
}
