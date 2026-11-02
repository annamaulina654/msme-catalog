// US-13: service worker minimal supaya katalog bisa dipasang sebagai aplikasi.
// Halaman sengaja TIDAK disimpan di cache: isi katalog dan admin selalu harus yang terbaru.
// Saat tidak ada internet, pengunjung melihat pesan "offline" yang jelas.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;

  event.respondWith(
    fetch(event.request).catch(
      () =>
        new Response(
          "<!doctype html><html lang=\"id\"><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">" +
            "<title>Offline</title><body style=\"font-family:sans-serif;max-width:32rem;margin:4rem auto;padding:0 1rem\">" +
            "<h1>Anda sedang offline</h1><p>Sambungkan ke internet, lalu muat ulang halaman ini.</p></body></html>",
          { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } }
        )
    )
  );
});
