import Link from "next/link";
import { toko } from "@/lib/toko";
import TombolTema from "@/components/TombolTema";

export default function Header() {
  return (
    <header className="border-b border-garis bg-latar">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4">
        <Link href="/" className="text-lg font-extrabold tracking-tight text-tautan">
          {toko.nama}
        </Link>
        <TombolTema />
      </div>
    </header>
  );
}
