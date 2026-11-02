import Link from "next/link";
import { logout } from "@/app/admin/actions";

const MENU = [
  { href: "/admin", label: "Produk" },
  { href: "/admin/kategori", label: "Kategori" },
  { href: "/admin/banner", label: "Banner" },
  { href: "/admin/ulasan", label: "Ulasan" },
  { href: "/admin/impor", label: "Impor CSV" },
  { href: "/admin/pengaturan", label: "Pengaturan toko" },
  { href: "/admin/akun", label: "Akun admin" },
  { href: "/admin/log", label: "Log aktivitas" },
  { href: "/admin/password", label: "Ganti password" },
];

export default function NavAdmin() {
  return (
    <nav
      aria-label="Menu admin"
      className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-garis pb-4 text-sm"
    >
      {MENU.map((item) => (
        <Link key={item.href} href={item.href} className="font-semibold hover:text-tautan">
          {item.label}
        </Link>
      ))}
      <form action={logout} className="ml-auto">
        <button type="submit" className="text-teks-lembut hover:text-bahaya">
          Keluar
        </button>
      </form>
    </nav>
  );
}
