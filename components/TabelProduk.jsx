import { formatRupiah } from "@/lib/format";
import { adaDiskon, hargaAkhir, stokHabis } from "@/lib/harga";
import Tombol from "@/components/Tombol";
import TombolHapus from "@/components/TombolHapus";

export default function TabelProduk({ daftarProduk }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-garis">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-permukaan text-teks-lembut">
          <tr>
            <th className="px-4 py-3 font-semibold">Produk</th>
            <th className="px-4 py-3 font-semibold">Kategori</th>
            <th className="px-4 py-3 font-semibold">Harga</th>
            <th className="px-4 py-3 font-semibold">Stok</th>
            <th className="px-4 py-3 font-semibold">
              <span className="sr-only">Aksi</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {daftarProduk.map((produk) => (
            <tr key={produk.id} className="border-t border-garis">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <img src={produk.foto_url} alt="" className="h-10 w-10 rounded-md object-cover" />
                  <div className="flex flex-col">
                    <span className="font-semibold">{produk.nama}</span>
                    {produk.badge && (
                      <span className="text-xs capitalize text-teks-lembut">{produk.badge}</span>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-teks-lembut">{produk.kategori}</td>
              <td className="px-4 py-3">
                {formatRupiah(hargaAkhir(produk))}
                {adaDiskon(produk) && (
                  <s className="ml-2 text-xs text-teks-lembut">{formatRupiah(produk.harga)}</s>
                )}
              </td>
              <td className="px-4 py-3">
                {stokHabis(produk) ? (
                  <span className="font-semibold text-bahaya">Habis</span>
                ) : (
                  (produk.stok ?? "-")
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-start justify-end gap-2">
                  <Tombol href={`/admin/produk/${produk.id}/ubah`} varian="garis">
                    Ubah
                  </Tombol>
                  <TombolHapus id={produk.id} nama={produk.nama} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
