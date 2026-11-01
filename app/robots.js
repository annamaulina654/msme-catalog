import { urlSitus } from "@/lib/situs";

// K-8 dan US-27: robots.txt. Halaman admin ditandai noindex di header dan metadata,
// dan juga dilarang di sini. Sitemap ditunjuk supaya mesin pencari menemukan semua produk.
export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin"],
      },
    ],
    sitemap: `${urlSitus()}/sitemap.xml`,
  };
}
