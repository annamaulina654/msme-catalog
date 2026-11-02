import Link from "next/link";
import { ambilPengaturan } from "@/lib/pengaturan";

export default async function Footer() {
  const p = await ambilPengaturan();

  return (
    <footer className="mt-16 border-t border-garis bg-permukaan">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-8 text-sm text-teks-lembut sm:flex-row sm:justify-between">
        <div>
          <p className="font-bold text-teks">{p.nama}</p>
          <p>{p.alamat}</p>
          <p>{p.jamBuka}</p>
        </div>
        <div className="flex flex-col gap-1 self-start">
          <Link href="/tentang" className="underline underline-offset-4 hover:text-tautan">
            Tentang dan kontak
          </Link>
          <Link href="/admin" className="underline underline-offset-4 hover:text-tautan">
            Masuk sebagai admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
