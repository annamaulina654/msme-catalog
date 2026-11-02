// US-43: nomor WhatsApp. Terima 0857..., +62 857..., atau 62857...; simpan sebagai 62857... (hanya angka).
// Mengembalikan null kalau nomor tidak valid.
export function normalisasiNomorWa(teks) {
  let angka = String(teks ?? "").replace(/[\s\-().+]/g, "");
  if (!/^\d+$/.test(angka)) return null;
  if (angka.startsWith("0")) angka = `62${angka.slice(1)}`;
  if (!angka.startsWith("62")) return null;
  if (angka.length < 10 || angka.length > 15) return null;
  return angka;
}
