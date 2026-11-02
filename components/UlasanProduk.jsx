import FormUlasan from "@/components/FormUlasan";
import { formatTanggalWaktu } from "@/lib/format";

function Bintang({ nilai }) {
  const bulat = Math.round(nilai);
  return (
    <span aria-hidden="true" className="text-harga">
      {"★".repeat(bulat)}
      {"☆".repeat(5 - bulat)}
    </span>
  );
}

// US-38: rata-rata rating, daftar ulasan yang tampil, dan form ulasan. Ulasan yang disembunyikan admin
// tidak dikirim ke sini sama sekali, jadi tidak dihitung di rata-rata (US-39).
export default function UlasanProduk({ produkId, ulasan }) {
  return (
    <section aria-labelledby="judul-ulasan" className="flex max-w-2xl flex-col gap-5">
      <div>
        <h2 id="judul-ulasan" className="text-xl font-bold">
          Ulasan pembeli
        </h2>
        {ulasan.jumlah > 0 ? (
          <p className="mt-1 text-sm text-teks-lembut">
            <Bintang nilai={ulasan.rata} />{" "}
            <span className="font-semibold text-teks">{ulasan.rata.toFixed(1)}</span> dari 5 · {ulasan.jumlah} ulasan
          </p>
        ) : (
          <p className="mt-1 text-sm text-teks-lembut">Belum ada ulasan. Jadilah yang pertama.</p>
        )}
      </div>

      {ulasan.daftar.length > 0 && (
        <ul className="flex flex-col divide-y divide-garis rounded-2xl border border-garis">
          {ulasan.daftar.map((u) => (
            <li key={u.id} className="p-4">
              <p className="text-sm">
                <span className="font-semibold">{u.nama}</span>{" "}
                <Bintang nilai={u.rating} />
                <span className="sr-only">Rating {u.rating} dari 5</span>
                <span className="text-teks-lembut"> · {formatTanggalWaktu(u.created_at)}</span>
              </p>
              <p className="mt-1 whitespace-pre-line break-words">{u.komentar}</p>
            </li>
          ))}
        </ul>
      )}

      <div>
        <h3 className="mb-3 font-bold">Tulis ulasan</h3>
        <FormUlasan produkId={produkId} />
      </div>
    </section>
  );
}
