import NavAdmin from "@/components/NavAdmin";
import FormProduk from "@/components/FormProduk";
import { createAdminClient } from "@/lib/supabase/admin";
import { ambilDaftarKategoriAdmin } from "@/lib/sesi-admin";
import { tambahProduk } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

// US-08: tambah produk.
export default async function HalamanTambahProduk() {
  const supabase = await createAdminClient();
  const daftarKategori = await ambilDaftarKategoriAdmin(supabase);

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <h1 className="text-2xl font-extrabold">Tambah produk</h1>
      <FormProduk aksi={tambahProduk} labelTombol="Simpan produk" daftarKategori={daftarKategori} />
    </div>
  );
}
