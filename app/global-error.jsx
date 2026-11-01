"use client";

// K-9: cadangan terakhir kalau layout utama sendiri yang error.
// Tidak menampilkan detail error apa pun ke pengunjung.
export default function GlobalError({ error, reset }) {
  return (
    <html lang="id">
      <body style={{ fontFamily: "sans-serif", padding: "4rem 1rem", maxWidth: "40rem", margin: "0 auto" }}>
        <h1>Terjadi kesalahan</h1>
        <p>Situs belum bisa dibuka. Silakan coba lagi beberapa saat lagi.</p>
        {error?.digest && <p style={{ fontSize: "0.75rem" }}>Kode kesalahan: {error.digest}</p>}
        <button type="button" onClick={() => reset()}>
          Coba lagi
        </button>
      </body>
    </html>
  );
}
