// US-13: service worker minimal supaya katalog bisa dipasang ke layar utama HP.
// Sengaja TIDAK menyimpan halaman di cache: harga, stok, dan halaman admin harus selalu segar.
// Kalau jaringan putus saat membuka halaman, tampil pesan sederhana.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

const HALAMAN_OFFLINE =
  '<!doctype html><html lang="id"><head><meta charset="utf-8">' +
  '<meta name="viewport" content="width=device-width,initial-scale=1"><title>Tidak ada koneksi</title>' +
  '<style>body{font-family:system-ui,sans-serif;max-width:32rem;margin:4rem auto;padding:0 1rem;line-height:1.5}</style>' +
  "</head><body><h1>Tidak ada koneksi</h1>" +
  "<p>Katalog butuh internet untuk menampilkan produk terbaru. Periksa koneksi Anda, lalu muat ulang halaman.</p>" +
  "</body></html>";

self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;

  event.respondWith(
    fetch(event.request).catch(
      () => new Response(HALAMAN_OFFLINE, { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } })
    )
  );
});
