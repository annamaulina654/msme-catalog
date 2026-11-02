import { ambilPengaturan } from "@/lib/pengaturan";

// US-13: web app manifest. Next.js otomatis menautkannya di <head> halaman.
// Ikon ada di public/icons dan dirujuk di sini.
export default async function manifest() {
  const { nama, tagline } = await ambilPengaturan();

  return {
    name: nama,
    short_name: nama.length > 12 ? nama.slice(0, 12).trim() : nama,
    description: tagline,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    lang: "id",
    background_color: "#ffffff",
    theme_color: "#1f6b4f",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
