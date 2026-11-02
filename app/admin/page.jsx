import { redirect } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import Paginasi from "@/components/Paginasi";
import TabelProduk from "@/components/TabelProduk";
import Tombol from "@/components/Tombol";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const UKURAN_HALAMAN = 10;

function ambilParam(sp, kunci) {
  const nilai = sp?.[kunci];
  return String(Array.isArray(nilai) ? nilai[0] : (nilai ?? ""));
}

// Karakter khusus pola LIKE dibuat biasa supaya pencarian "50%" tidak cocok ke semuanya.
const amankanLike = (teks) => teks.replace(/[\\%_]/g, (c) => `\\${c}`);

export default async function HalamanAdmin({ searchParams }) {
  const sp = await searchParams;
  const q = ambilParam(sp, "q").trim().slice(0, 60);
  const halMentah = Number.parseInt(ambilParam(sp, "hal"), 10);
  const hal = Number.isInteger(halMentah) && halMentah > 0 && halMentah < 100000 ? halMentah : 1;

  const supabase = await createAdminClient();
  let ringkasan = null;
  let terlaris = { data: [], error: false };
  let daftarProduk = [];
  let total = 0;
  let pesanError = null;

  try {
    // US-30 dan US-41: ringkasan toko dan produk terlaris, dihitung dari database.
    const [semua, hasilTerlaris] = await Promise.all([
      supabase.from("produk").select("kategori, aktif, stok"),
      supabase.rpc("produk_terlaris", { batas: 5 }),
    ]);

    if (!semua.error) {
      const baris = semua.data ?? [];
      const perKategori = new Map();
      for (const p of baris) {
        const nama = p.kategori || "Tanpa kategori";
        perKategori.set(nama, (perKategori.get(nama) ?? 0) + 1);
      }
      ringkasan = {
        total: baris.length,
        aktif: baris.filter((p) => p.aktif !== false).length,
        habis: baris.filter((p) => typeof p.stok === "number" && p.stok <= 0).length,
        perKategori: [...perKategori.entries()].sort((a, b) => b[1] - a[1]),
      };
    } else {
      console.error("Gagal memuat ringkasan admin, kode:", semua.error.code ?? "tidak-diketahui");
    }

    terlaris = hasilTerlaris.error
      ? { data: [], error: true }
      : { data: hasilTerlaris.data ?? [], error: false };

    // US-33: pencarian dan paginasi dilakukan di query database.
    let query = supabase
      .from("produk")
      .select("*", { count: "exact" })
      .order("urutan", { ascending: true })
      .order("id", { ascending: true });
    if (q) query = query.ilike("nama", `%${amankanLike(q)}%`);

    const dari = (hal - 1) * UKURAN_HALAMAN;
    const { data, error, count } = await query.range(dari, dari + UKURAN_HALAMAN - 1);

    if (error) {
      if (error.code === "PGRST103") {
        redirect(q ? `/admin?q=${encodeURIComponent(q)}` : "/admin");
      }
      console.error("Gagal memuat daftar produk admin, kode:", error.code ?? "tidak-diketahui");
      pesanError = "Daftar produk belum bisa dimuat. Silakan coba lagi beberapa saat lagi.";
    } else {
      daftarProduk = data ?? [];
      total = count ?? 0;
    }
  } catch (err) {
    // redirect() melempar error khusus Next.js yang harus diteruskan.
    if (err?.digest?.startsWith?.("NEXT_REDIRECT")) throw err;
    console.error("Gagal memuat halaman admin, jenis error:", err?.name ?? "tidak-diketahui");
    pesanError = "Daftar produk belum bisa dimuat. Silakan coba lagi beberapa saat lagi.";
  }

  const totalHalaman = Math.max(1, Math.ceil(total / UKURAN_HALAMAN));

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />

      {/* US-30: ringkasan */}
      <section aria-label="Ringkasan toko" className="grid gap-4 sm:grid-cols-3">
        {[
          ["Total produk", ringkasan?.total],
          ["Produk aktif", ringkasan?.aktif],
          ["Stok habis", ringkasan?.habis],
        ].map(([label, nilai]) => (
          <div key={label} className="rounded-2xl border border-garis bg-permukaan p-4">
            <p className="text-sm text-teks-lembut">{label}</p>
            <p className="mt-1 text-3xl font-extrabold">{nilai ?? "-"}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section aria-labelledby="judul-kategori" className="rounded-2xl border border-garis p-4">
          <h2 id="judul-kategori" className="font-bold">
            Produk per kategori
          </h2>
          {ringkasan?.perKategori?.length ? (
            <ul className="mt-3 flex flex-col gap-1.5 text-sm">
              {ringkasan.perKategori.map(([nama, jumlah]) => (
                <li key={nama} className="flex justify-between gap-3">
                  <span>{nama}</span>
                  <span className="font-semibold">{jumlah}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-teks-lembut">Belum ada data kategori.</p>
          )}
        </section>

        <section aria-labelledby="judul-terlaris" className="rounded-2xl border border-garis p-4">
          <h2 id="judul-terlaris" className="font-bold">
            5 produk paling sering dipesan
          </h2>
          {terlaris.error ? (
            <p className="mt-3 text-sm text-teks-lembut">
              Data belum bisa dimuat. Pastikan skrip docs/migrasi-bonus-2.sql sudah dijalankan.
            </p>
          ) : terlaris.data.length === 0 ? (
            <p className="mt-3 text-sm text-teks-lembut">
              Belum ada data. Angka muncul setelah pengunjung menekan tombol pesan WhatsApp.
            </p>
          ) : (
            <ol className="mt-3 flex list-decimal flex-col gap-1.5 pl-5 text-sm">
              {terlaris.data.map((p) => (
                <li key={p.produk_id}>
                  <span className="flex justify-between gap-3">
                    <span>{p.nama}</span>
                    <span className="font-semibold">{p.jumlah} klik</span>
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Produk</h1>
        <div className="flex flex-wrap gap-2">
          {/* US-35: ekspor semua produk ke CSV */}
          <Tombol href="/admin/ekspor" unduh varian="garis">
            Ekspor CSV
          </Tombol>
          <Tombol href="/admin/produk/baru">Tambah produk</Tombol>
        </div>
      </div>

      {/* US-33: pencarian lewat query database; kata kunci dan halaman tersimpan di URL */}
      <form action="/admin" method="get" className="flex max-w-md gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Cari nama produk"
          aria-label="Cari nama produk"
          maxLength={60}
          className="w-full min-w-0 rounded-lg border border-garis bg-latar px-3 py-2 text-base text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
        />
        <Tombol type="submit" varian="garis">
          Cari
        </Tombol>
        {q && (
          <Tombol href="/admin" varian="garis">
            Reset
          </Tombol>
        )}
      </form>

      {pesanError ? (
        <div className="rounded-xl border border-garis bg-permukaan p-6 text-center text-bahaya">{pesanError}</div>
      ) : daftarProduk.length === 0 ? (
        <p className="py-12 text-center text-teks-lembut">
          {q ? `Tidak ada produk yang cocok dengan "${q}".` : "Belum ada produk"}
        </p>
      ) : (
        <>
          <TabelProduk daftarProduk={daftarProduk} bolehGeser={!q} />
          <p className="text-sm text-teks-lembut">
            {total} produk{q ? ` cocok dengan "${q}"` : ""} · halaman {Math.min(hal, totalHalaman)} dari {totalHalaman}
          </p>
          <Paginasi basePath="/admin" params={{ q }} halaman={hal} totalHalaman={totalHalaman} />
        </>
      )}
    </div>
  );
}
