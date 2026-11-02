import NavAdmin from "@/components/NavAdmin";
import FormKategori from "@/components/FormKategori";
import TombolAksi from "@/components/TombolAksi";
import { createAdminClient } from "@/lib/supabase/admin";
import { tambahKategori, ubahKategori, hapusKategori } from "@/app/admin/aksi-konten";

export const dynamic = "force-dynamic";

// US-31: kelola kategori. Semua aksi memeriksa login di server.
export default async function HalamanKategori() {
  let daftar = [];
  let jumlahPerKategori = new Map();
  let pesanError = null;

  try {
    const supabase = await createAdminClient();
    const [{ data: kategori, error }, { data: produk }] = await Promise.all([
      supabase.from("kategori").select("id, nama, slug").order("nama", { ascending: true }),
      supabase.from("produk").select("kategori"),
    ]);

    if (error) {
      console.error("Gagal memuat kategori admin, kode:", error.code ?? "tidak-diketahui");
      pesanError = "Daftar kategori belum bisa dimuat. Pastikan skrip docs/migrasi-bonus-2.sql sudah dijalankan.";
    } else {
      daftar = kategori ?? [];
      for (const p of produk ?? []) {
        if (p.kategori) jumlahPerKategori.set(p.kategori, (jumlahPerKategori.get(p.kategori) ?? 0) + 1);
      }
    }
  } catch (err) {
    console.error("Gagal memuat kategori admin, jenis error:", err?.name ?? "tidak-diketahui");
    pesanError = "Daftar kategori belum bisa dimuat. Silakan coba lagi beberapa saat lagi.";
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div>
        <h1 className="text-2xl font-extrabold">Kategori</h1>
        <p className="mt-1 text-sm text-teks-lembut">
          Kategori dipakai di form produk dan halaman kategori. Kategori yang masih dipakai produk tidak bisa dihapus.
        </p>
      </div>

      <section className="max-w-xl" aria-label="Tambah kategori">
        <FormKategori aksi={tambahKategori} label="Tambah" placeholder="Nama kategori baru" />
      </section>

      {pesanError ? (
        <div className="rounded-xl border border-garis bg-permukaan p-6 text-center text-bahaya">{pesanError}</div>
      ) : daftar.length === 0 ? (
        <p className="py-8 text-center text-teks-lembut">Belum ada kategori</p>
      ) : (
        <ul className="flex max-w-2xl flex-col divide-y divide-garis rounded-2xl border border-garis">
          {daftar.map((k) => {
            const dipakai = jumlahPerKategori.get(k.nama) ?? 0;
            return (
              <li key={k.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-start">
                <div className="flex-1">
                  <FormKategori aksi={ubahKategori} id={k.id} nilaiAwal={k.nama} label="Simpan" />
                  <p className="mt-1 text-xs text-teks-lembut">
                    {dipakai} produk · alamat /kategori/{k.slug}
                  </p>
                </div>
                <TombolAksi
                  aksi={hapusKategori}
                  nilai={{ id: k.id }}
                  label="Hapus"
                  labelProses="Menghapus..."
                  varian="bahaya"
                  konfirmasi={`Hapus kategori "${k.nama}"?`}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
