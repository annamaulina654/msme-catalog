import { ambilPengaturan } from "@/lib/pengaturan";

export const dynamic = "force-dynamic";

// US-13: web app manifest, supaya katalog bisa dipasang ke layar utama HP.
// Ikon ada di public/icons.
export default async function manifest() {
  const p = await ambilPengaturan();

  return {
    name: p.nama,
    short_name: p.nama.length > 12 ? p.nama.slice(0, 12).trim() : p.nama,
    description: p.tagline,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#1f6b4f",
    lang: "id",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
