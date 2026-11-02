// Ubah nama kategori menjadi slug untuk alamat halaman: "Kue kering" -> "kue-kering".
// Harus sama dengan cara slug dibuat di docs/migrasi-bonus-2.sql.
export function slugify(teks) {
  return String(teks ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
