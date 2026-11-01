import { formatRupiah } from "@/lib/format";
import { adaDiskon, hargaAkhir } from "@/lib/harga";

// US-20: tampilkan harga. Kalau ada diskon, harga normal tampil dicoret.
export default function HargaProduk({ produk, ukuran = "kecil" }) {
  const kelasUkuran =
    ukuran === "besar"
      ? "mt-0 px-3 py-1 text-xl"
      : "mt-auto px-2 py-0.5 text-sm";

  return (
    <p
      className={`inline-flex flex-wrap items-baseline gap-x-2 self-start rounded-md bg-harga-latar font-bold text-harga ${kelasUkuran}`}
    >
      <span>{formatRupiah(hargaAkhir(produk))}</span>
      {adaDiskon(produk) && (
        <s className="text-[0.75em] font-normal opacity-80">
          <span className="sr-only">Harga normal </span>
          {formatRupiah(produk.harga)}
        </s>
      )}
    </p>
  );
}
