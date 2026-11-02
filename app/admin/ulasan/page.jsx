import Link from "next/link";
import NavAdmin from "@/components/NavAdmin";
import TombolAksi from "@/components/TombolAksi";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatTanggalWaktu } from "@/lib/format";
import { aturTampilUlasan, hapusUlasan } from "@/app/admin/aksi-lain";

export const dynamic = "force-dynamic";

// US-39: moderasi ulasan. Ulasan yang disembunyikan tidak tampil dan tidak dihitung di rata-rata rating.
export default async function HalamanUlasanAdmin() {
  let daftar = [];
  let pesanError = null;

  try {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from("ulasan")
      .select("id, produk_id, nama, rating, komentar, tampil, created_at, produk:produk_id(nama)")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Gagal memuat ulasan admin, kode:", error.code ?? "tidak-diketahui");
      pesanError = "Ulasan belum bisa dimuat. Pastikan skrip docs/migrasi-bonus-2.sql sudah dijalankan.";
    } else {
      daftar = data ?? [];
    }
  } catch (err) {
    console.error("Gagal memuat ulasan admin, jenis error:", err?.name ?? "tidak-diketahui");
    pesanError = "Ulasan belum bisa dimuat. Silakan coba lagi beberapa saat lagi.";
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div>
        <h1 className="text-2xl font-extrabold">Ulasan</h1>
        <p className="mt-1 text-sm text-teks-lembut">100 ulasan terbaru dari pengunjung.</p>
      </div>

      {pesanError ? (
        <div className="rounded-xl border border-garis bg-permukaan p-6 text-center text-bahaya">{pesanError}</div>
      ) : daftar.length === 0 ? (
        <p className="py-12 text-center text-teks-lembut">Belum ada ulasan</p>
      ) : (
        <ul className="flex max-w-3xl flex-col divide-y divide-garis rounded-2xl border border-garis">
          {daftar.map((u) => (
            <li key={u.id} className={`flex flex-col gap-3 p-4 sm:flex-row sm:items-start ${u.tampil ? "" : "opacity-60"}`}>
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-semibold">{u.nama}</span>
                  <span className="text-teks-lembut">
                    {" "}
                    · {"★".repeat(u.rating)}
                    {"☆".repeat(5 - u.rating)} · {formatTanggalWaktu(u.created_at)}
                  </span>
                </p>
                <p className="mt-1 whitespace-pre-line break-words">{u.komentar}</p>
                <p className="mt-1 text-xs text-teks-lembut">
                  Untuk{" "}
                  <Link href={`/produk/${u.produk_id}`} className="underline underline-offset-4 hover:text-tautan">
                    {u.produk?.nama ?? `produk #${u.produk_id}`}
                  </Link>
                  {!u.tampil && <span className="ml-2 font-semibold text-bahaya">Disembunyikan</span>}
                </p>
              </div>
              <div className="flex gap-2">
                <TombolAksi
                  aksi={aturTampilUlasan}
                  nilai={{ id: u.id, tampil: !u.tampil }}
                  label={u.tampil ? "Sembunyikan" : "Tampilkan"}
                />
                <TombolAksi
                  aksi={hapusUlasan}
                  nilai={{ id: u.id }}
                  label="Hapus"
                  labelProses="Menghapus..."
                  varian="bahaya"
                  konfirmasi="Hapus ulasan ini? Tindakan ini tidak bisa dibatalkan."
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
