import { notFound } from "next/navigation";
import Link from "next/link";
import NavAdmin from "@/components/NavAdmin";
import FormVarian from "@/components/FormVarian";
import TombolAksi from "@/components/TombolAksi";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatRupiah } from "@/lib/format";
import { idProduk } from "@/lib/validasi-produk";
import { tambahVarian, hapusVarian } from "@/app/admin/aksi-konten";

export const dynamic = "force-dynamic";

// US-48: kelola varian harga per ukuran untuk satu produk.
export default async function HalamanVarian({ params }) {
  const { id: idMentah } = await params;
  const id = idProduk(idMentah);
  if (!id) notFound();

  let produk = null;
  let daftar = [];
  let pesanError = null;

  try {
    const supabase = await createAdminClient();
    const { data, error } = await supabase.from("produk").select("id, nama, harga").eq("id", id).maybeSingle();
    if (error) {
      console.error("Gagal memuat produk untuk varian, kode:", error.code ?? "tidak-diketahui");
      pesanError = "Data belum bisa dimuat. Silakan coba lagi beberapa saat lagi.";
    }
    produk = data ?? null;

    if (produk) {
      const { data: varian, error: errorVarian } = await supabase
        .from("varian")
        .select("id, nama, harga")
        .eq("produk_id", id)
        .order("urutan", { ascending: true })
        .order("id", { ascending: true });
      if (errorVarian) {
        console.error("Gagal memuat varian admin, kode:", errorVarian.code ?? "tidak-diketahui");
        pesanError = "Varian belum bisa dimuat. Pastikan skrip docs/migrasi-bonus-2.sql sudah dijalankan.";
      }
      daftar = varian ?? [];
    }
  } catch (err) {
    console.error("Gagal memuat halaman varian, jenis error:", err?.name ?? "tidak-diketahui");
    pesanError = "Data belum bisa dimuat. Silakan coba lagi beberapa saat lagi.";
  }

  if (!produk && !pesanError) notFound();

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div>
        <Link href="/admin" className="text-sm text-teks-lembut underline underline-offset-4 hover:text-tautan">
          Kembali ke daftar produk
        </Link>
        <h1 className="mt-2 text-2xl font-extrabold">Varian: {produk?.nama}</h1>
        <p className="mt-1 text-sm text-teks-lembut">
          Varian dipakai untuk ukuran atau kemasan dengan harga berbeda. Kalau produk punya varian, pengunjung memilih
          salah satunya sebelum memesan. Harga di sini menggantikan harga produk.
        </p>
      </div>

      {pesanError ? (
        <div className="rounded-xl border border-garis bg-permukaan p-6 text-center text-bahaya">{pesanError}</div>
      ) : (
        <>
          <FormVarian aksi={tambahVarian.bind(null, id)} />

          {daftar.length === 0 ? (
            <p className="text-teks-lembut">Belum ada varian. Produk dijual dengan harga {formatRupiah(produk.harga)}.</p>
          ) : (
            <ul className="flex max-w-xl flex-col divide-y divide-garis rounded-2xl border border-garis">
              {daftar.map((v) => (
                <li key={v.id} className="flex items-start justify-between gap-3 p-4">
                  <div>
                    <p className="font-semibold">{v.nama}</p>
                    <p className="text-sm text-teks-lembut">{formatRupiah(v.harga)}</p>
                  </div>
                  <TombolAksi
                    aksi={hapusVarian}
                    nilai={{ id: v.id }}
                    label="Hapus"
                    labelProses="Menghapus..."
                    varian="bahaya"
                    konfirmasi={`Hapus varian "${v.nama}"?`}
                  />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
