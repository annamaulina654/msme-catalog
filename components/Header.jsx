import Link from "next/link";
import { ambilPengaturan } from "@/lib/pengaturan";
import TombolTema from "@/components/TombolTema";
import IkonKeranjang from "@/components/IkonKeranjang";

const TAUTAN = [
  { href: "/tentang", label: "Tentang" },
  { href: "/favorit", label: "Favorit" },
  { href: "/bandingkan", label: "Bandingkan" },
];

export default async function Header() {
  const { nama } = await ambilPengaturan();

  return (
    <header className="border-b border-garis bg-latar">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-4">
        <Link href="/" className="text-lg font-extrabold tracking-tight text-tautan">
          {nama}
        </Link>
        <nav aria-label="Menu utama" className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          {TAUTAN.map((t) => (
            <Link key={t.href} href={t.href} className="font-semibold hover:text-tautan">
              {t.label}
            </Link>
          ))}
          <IkonKeranjang />
          <TombolTema />
        </nav>
      </div>
    </header>
  );
}
