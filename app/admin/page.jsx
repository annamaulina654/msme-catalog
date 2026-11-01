import NavAdmin from "@/components/NavAdmin";
import TabelProduk from "@/components/TabelProduk";
import Tombol from "@/components/Tombol";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function HalamanAdmin() {
  // US-07: daftar produk diambil dari database lewat sesi admin (RLS tetap berlaku).
  let daftarProduk = [];
  let pesanError = null;

  try {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from("produk")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("Gagal memuat daftar produk admin, kode:", error.code ?? "tidak-diketahui");
      pesanError = "Daftar produk belum bisa dimuat. Silakan coba lagi beberapa saat lagi.";
    } else {
      daftarProduk = data || [];
    }
  } catch (err) {
    console.error("Gagal memuat daftar produk admin, jenis error:", err?.name ?? "tidak-diketahui");
    pesanError = "Daftar produk belum bisa dimuat. Silakan coba lagi beberapa saat lagi.";
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Produk</h1>
        <Tombol href="/admin/produk/baru">Tambah produk</Tombol>
      </div>

      {pesanError ? (
        <div className="rounded-xl border border-garis bg-permukaan p-6 text-center text-bahaya">
          {pesanError}
        </div>
      ) : daftarProduk.length === 0 ? (
        <p className="py-12 text-center text-teks-lembut">Belum ada produk</p>
      ) : (
        <TabelProduk daftarProduk={daftarProduk} />
      )}
    </div>
  );
}
