import { formatRupiah } from "@/lib/format";
import { adaDiskon, hargaAkhir, stokHabis } from "@/lib/harga";
import { aturAktif, geserUrutan } from "@/app/admin/actions";
import Tombol from "@/components/Tombol";
import TombolAksi from "@/components/TombolAksi";
import TombolHapus from "@/components/TombolHapus";

// `bolehGeser`: tombol naik/turun hanya masuk akal saat daftar tidak sedang disaring (US-47).
export default function TabelProduk({ daftarProduk, bolehGeser = false }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-garis">
      <table className="w-full min-w-[720px] text-left text-sm">
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
            <tr key={produk.id} className={`border-t border-garis ${produk.aktif === false ? "opacity-60" : ""}`}>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <img src={produk.foto_url} alt="" className="h-10 w-10 rounded-md object-cover" />
                  <div className="flex flex-col">
                    <span className="font-semibold">{produk.nama}</span>
                    <span className="flex gap-2 text-xs text-teks-lembut">
                      {produk.aktif === false && <span className="font-semibold text-bahaya">Nonaktif</span>}
                      {produk.badge && <span className="capitalize">{produk.badge}</span>}
                    </span>
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
                <div className="flex flex-wrap items-start justify-end gap-2">
                  {bolehGeser && (
                    <>
                      <TombolAksi
                        aksi={geserUrutan}
                        nilai={{ id: produk.id, arah: "naik" }}
                        label="↑"
                        labelProses="…"
                        ariaLabel={`Naikkan ${produk.nama}`}
                      />
                      <TombolAksi
                        aksi={geserUrutan}
                        nilai={{ id: produk.id, arah: "turun" }}
                        label="↓"
                        labelProses="…"
                        ariaLabel={`Turunkan ${produk.nama}`}
                      />
                    </>
                  )}
                  <Tombol href={`/admin/produk/${produk.id}/ubah`} varian="garis">
                    Ubah
                  </Tombol>
                  <Tombol href={`/admin/produk/${produk.id}/varian`} varian="garis">
                    Varian
                  </Tombol>
                  <TombolAksi
                    aksi={aturAktif}
                    nilai={{ id: produk.id, aktif: produk.aktif === false }}
                    label={produk.aktif === false ? "Aktifkan" : "Nonaktifkan"}
                  />
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
