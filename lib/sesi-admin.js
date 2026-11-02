import { createAdminClient } from "@/lib/supabase/admin";

// Setiap aksi atau endpoint admin wajib memanggil ini lebih dulu.
// Mengembalikan { supabase, user } (koneksi sesi admin, RLS tetap berlaku)
// atau null kalau belum login.
export async function ambilSesiAdmin() {
  try {
    const supabase = await createAdminClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) return null;
    return { supabase, user };
  } catch {
    return null;
  }
}

export const PESAN_BELUM_LOGIN = "Anda harus login terlebih dahulu.";

// Daftar nama kategori untuk pilihan di form (US-31). Kosong kalau tabel belum ada atau belum terisi.
export async function ambilDaftarKategoriAdmin(supabase) {
  try {
    const { data } = await supabase.from("kategori").select("nama").order("nama", { ascending: true });
    return (data ?? []).map((k) => k.nama);
  } catch {
    return [];
  }
}
