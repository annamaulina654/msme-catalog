import Link from "next/link";
import BadgeProduk from "@/components/BadgeProduk";
import HargaProduk from "@/components/HargaProduk";
import { stokHabis } from "@/lib/harga";

export default function KartuProduk({ produk }) {
  const habis = stokHabis(produk);

  return (
    <Link
      href={`/produk/${produk.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-garis bg-latar"
    >
      <div className="relative">
        <img
          src={produk.foto_url}
          alt={produk.nama}
          className={`aspect-square w-full bg-permukaan object-cover ${habis ? "opacity-50" : ""}`}
        />
        <BadgeProduk produk={produk} className="absolute left-2 top-2" />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <p className="text-xs text-teks-lembut">{produk.kategori}</p>
        <h3 className="font-semibold leading-snug group-hover:text-tautan">{produk.nama}</h3>
        <HargaProduk produk={produk} />
      </div>
    </Link>
  );
}
