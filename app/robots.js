// K-8: robots.txt. Halaman admin ditandai noindex di header dan metadata,
// dan juga dilarang di sini supaya pengunjung otomatis tidak menjelajahinya.
export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin"],
      },
    ],
  };
}
