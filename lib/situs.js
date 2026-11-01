// Alamat dasar situs, dipakai untuk metadata, Open Graph, dan sitemap.
// Urutan: SITE_URL (opsional, isi sendiri di Vercel) -> alamat produksi Vercel -> localhost.
// Keduanya hanya dibaca di server dan tidak dikirim ke browser.
export function urlSitus() {
  const eksplisit = process.env.SITE_URL;
  const produksi = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const mentah = eksplisit || (produksi ? `https://${produksi}` : "http://localhost:3000");

  try {
    return new URL(mentah).origin;
  } catch {
    return "http://localhost:3000";
  }
}
