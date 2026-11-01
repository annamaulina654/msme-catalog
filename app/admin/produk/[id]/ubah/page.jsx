import { notFound } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import FormProduk from "@/components/FormProduk";
import { createAdminClient } from "@/lib/supabase/admin";
import { idProduk } from "@/lib/validasi-produk";
import { ubahProduk } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

// US-09: ubah produk. Form terisi data lama dari database.
export default async function HalamanUbahProduk({ params }) {
  const { id: idMentah } = await params;
  const id = idProduk(idMentah);

  if (!id) {
    notFound();
  }

  let produk = null;
  try {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from("produk")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Gagal memuat produk untuk diubah, kode:", error.code ?? "tidak-diketahui");
    } else {
      produk = data;
    }
  } catch (err) {
    console.error("Gagal memuat produk untuk diubah, jenis error:", err?.name ?? "tidak-diketahui");
  }

  if (!produk) {
    notFound();
  }

  // Sisipkan id ke Server Action; id dicek ulang di server saat disimpan.
  const aksiUbah = ubahProduk.bind(null, id);

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <h1 className="text-2xl font-extrabold">Ubah produk</h1>
      <FormProduk produk={produk} aksi={aksiUbah} labelTombol="Simpan perubahan" />
    </div>
  );
}
