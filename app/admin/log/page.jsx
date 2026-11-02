import NavAdmin from "@/components/NavAdmin";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatTanggalWaktu } from "@/lib/format";

export const dynamic = "force-dynamic";

// US-45: 50 aktivitas admin terakhir. Dilindungi proxy.js dan RLS (hanya admin yang login yang bisa membaca).
export default async function HalamanLog() {
  let daftar = [];
  let pesanError = null;

  try {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from("log_aktivitas")
      .select("id, admin_email, aksi, detail, created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Gagal memuat log aktivitas, kode:", error.code ?? "tidak-diketahui");
      pesanError = "Log belum bisa dimuat. Pastikan skrip docs/migrasi-bonus-2.sql sudah dijalankan.";
    } else {
      daftar = data ?? [];
    }
  } catch (err) {
    console.error("Gagal memuat log aktivitas, jenis error:", err?.name ?? "tidak-diketahui");
    pesanError = "Log belum bisa dimuat. Silakan coba lagi beberapa saat lagi.";
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div>
        <h1 className="text-2xl font-extrabold">Log aktivitas</h1>
        <p className="mt-1 text-sm text-teks-lembut">50 perubahan terakhir: siapa, melakukan apa, dan kapan.</p>
      </div>

      {pesanError ? (
        <div className="rounded-xl border border-garis bg-permukaan p-6 text-center text-bahaya">{pesanError}</div>
      ) : daftar.length === 0 ? (
        <p className="py-12 text-center text-teks-lembut">Belum ada aktivitas tercatat</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-garis">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="bg-permukaan text-teks-lembut">
              <tr>
                <th className="px-4 py-3 font-semibold">Waktu</th>
                <th className="px-4 py-3 font-semibold">Admin</th>
                <th className="px-4 py-3 font-semibold">Aksi</th>
                <th className="px-4 py-3 font-semibold">Detail</th>
              </tr>
            </thead>
            <tbody>
              {daftar.map((l) => (
                <tr key={l.id} className="border-t border-garis align-top">
                  <td className="whitespace-nowrap px-4 py-3 text-teks-lembut">{formatTanggalWaktu(l.created_at)}</td>
                  <td className="px-4 py-3">{l.admin_email}</td>
                  <td className="px-4 py-3 font-semibold">{l.aksi}</td>
                  <td className="px-4 py-3 text-teks-lembut">{l.detail ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
