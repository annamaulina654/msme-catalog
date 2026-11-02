import "./globals.css";
import { connection } from "next/server";
import { headers } from "next/headers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DaftarkanSw from "@/components/DaftarkanSw";
import { toko } from "@/lib/toko";
import { urlSitus } from "@/lib/situs";

// US-26: metadataBase membuat alamat relatif (misalnya foto produk) menjadi alamat lengkap
// di tag Open Graph.
export const metadata = {
  metadataBase: new URL(urlSitus()),
  title: {
    default: toko.nama,
    template: `%s | ${toko.nama}`,
  },
  description: toko.tagline,
  openGraph: {
    siteName: toko.nama,
    title: toko.nama,
    description: toko.tagline,
    locale: "id_ID",
    type: "website",
  },
};

// US-13: warna bilah alamat di HP mengikuti warna utama toko.
export const viewport = {
  themeColor: "#1f6b4f",
};

export default async function RootLayout({ children }) {
  // K-11: CSP memakai nonce yang berbeda di setiap permintaan, jadi semua halaman
  // harus dirender saat diminta (bukan dibuat statis saat build).
  await connection();
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    // suppressHydrationWarning: public/tema.js mengubah atribut data-tema sebelum React aktif.
    <html lang="id" suppressHydrationWarning>
      <head>
        {/* US-25: pasang tema sebelum halaman digambar. Nonce wajib karena CSP. */}
        <script src="/tema.js" nonce={nonce} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap"
        />
      </head>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <Header />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4">{children}</main>
        <Footer />
        <DaftarkanSw />
      </body>
    </html>
  );
}
