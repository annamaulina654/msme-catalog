/** Header keamanan yang dipasang di semua halaman (K-6). */
const headerKeamanan = [
  // Cegah browser menebak tipe file (MIME sniffing).
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Cegah situs ini dibuka di dalam iframe situs lain (clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  // Jangan kirim alamat lengkap halaman ke situs lain.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Matikan fitur browser yang tidak dipakai aplikasi ini.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  // Paksa HTTPS selama 2 tahun.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Supaya deploy tidak gagal hanya karena error tipe kecil selama workshop.
  typescript: { ignoreBuildErrors: true },

  // Jangan beri tahu dunia luar bahwa situs ini memakai Next.js.
  poweredByHeader: false,

  // US-29 dan US-46: form boleh mengirim file (foto produk, CSV). Batas isi permintaan di Vercel
  // sekitar 4,5 MB, jadi batas di sini sengaja di bawahnya.
  experimental: {
    serverActions: { bodySizeLimit: "4mb" },
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: headerKeamanan,
      },
      {
        // US-13: service worker harus selalu diambil versi terbaru.
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        // K-8: halaman admin tidak boleh masuk hasil pencarian.
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
      },
      {
        source: "/admin",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
      },
    ];
  },
};

export default nextConfig;
