import Link from "next/link";

const gaya = {
  utama: "bg-utama text-white hover:bg-utama-gelap",
  garis: "border border-garis bg-latar text-teks hover:border-utama hover:text-tautan",
  bahaya: "border border-garis bg-latar text-bahaya hover:border-bahaya",
};

// `unduh` mengubah tautan menjadi unduhan file biasa (tanpa prefetch Next.js), dipakai untuk ekspor CSV.
export default function Tombol({ href, unduh = false, varian = "utama", className = "", children, ...props }) {
  const kelas = `inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${gaya[varian]} ${className}`;

  if (href && unduh) {
    return (
      <a href={href} download className={kelas}>
        {children}
      </a>
    );
  }

  if (href) {
    return (
      <Link href={href} className={kelas}>
        {children}
      </Link>
    );
  }

  return (
    <button className={kelas} {...props}>
      {children}
    </button>
  );
}
