import NavAdmin from "@/components/NavAdmin";
import FormAkun from "@/components/FormAkun";
import TombolAksi from "@/components/TombolAksi";
import { ambilSesiAdmin } from "@/lib/sesi-admin";
import { createClient } from "@/lib/supabase/server";
import { formatTanggalWaktu } from "@/lib/format";
import { aturBlokAdmin, hapusAdmin } from "@/app/admin/aksi-lain";

export const dynamic = "force-dynamic";

// US-44: daftar dan pengelolaan akun admin. Daftar diambil lewat Auth Admin API di server.
export default async function HalamanAkun() {
  const sesi = await ambilSesiAdmin();
  let daftar = [];
  let pesanError = null;

  try {
    const admin = createClient();
    const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 100 });
    if (error) {
      console.error("Gagal memuat akun admin, kode:", error.code ?? error.status ?? "tidak-diketahui");
      pesanError = "Daftar admin belum bisa dimuat. Silakan coba lagi beberapa saat lagi.";
    } else {
      daftar = (data?.users ?? []).sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)));
    }
  } catch (err) {
    console.error("Gagal memuat akun admin, jenis error:", err?.name ?? "tidak-diketahui");
    pesanError = "Daftar admin belum bisa dimuat. Silakan coba lagi beberapa saat lagi.";
  }

  const dinonaktifkan = (u) => Boolean(u.banned_until) && new Date(u.banned_until) > new Date();

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div>
        <h1 className="text-2xl font-extrabold">Akun admin</h1>
        <p className="mt-1 text-sm text-teks-lembut">
          Semua akun di sini bisa masuk ke halaman admin. Anda tidak bisa menonaktifkan atau menghapus akun Anda sendiri.
        </p>
      </div>

      <FormAkun />

      {pesanError ? (
        <div className="rounded-xl border border-garis bg-permukaan p-6 text-center text-bahaya">{pesanError}</div>
      ) : (
        <ul className="flex max-w-3xl flex-col divide-y divide-garis rounded-2xl border border-garis">
          {daftar.map((u) => {
            const saya = u.id === sesi?.user?.id;
            const nonaktif = dinonaktifkan(u);
            return (
              <li key={u.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start">
                <div className="flex-1">
                  <p className="font-semibold">
                    {u.email}
                    {saya && <span className="ml-2 text-xs font-normal text-teks-lembut">(Anda)</span>}
                    {nonaktif && <span className="ml-2 text-xs font-semibold text-bahaya">Nonaktif</span>}
                  </p>
                  <p className="text-xs text-teks-lembut">
                    Dibuat {formatTanggalWaktu(u.created_at)} · terakhir masuk {formatTanggalWaktu(u.last_sign_in_at)}
                  </p>
                </div>
                {!saya && (
                  <div className="flex gap-2">
                    <TombolAksi
                      aksi={aturBlokAdmin}
                      nilai={{ id: u.id, blokir: !nonaktif }}
                      label={nonaktif ? "Aktifkan" : "Nonaktifkan"}
                      konfirmasi={nonaktif ? undefined : `Nonaktifkan ${u.email}? Akun ini tidak bisa masuk lagi.`}
                    />
                    <TombolAksi
                      aksi={hapusAdmin}
                      nilai={{ id: u.id }}
                      label="Hapus"
                      labelProses="Menghapus..."
                      varian="bahaya"
                      konfirmasi={`Hapus akun ${u.email}? Tindakan ini tidak bisa dibatalkan.`}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
