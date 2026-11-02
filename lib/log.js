// US-45: catat siapa melakukan apa. Dipanggil setelah aksi admin berhasil.
// Kegagalan mencatat log tidak boleh menggagalkan aksi utamanya.
export async function catatLog(sesi, aksi, detail) {
  try {
    await sesi.supabase.from("log_aktivitas").insert({
      admin_email: sesi.user?.email ?? "tidak-diketahui",
      aksi,
      detail: detail ? String(detail).slice(0, 300) : null,
    });
  } catch {
    // Abaikan.
  }
}
