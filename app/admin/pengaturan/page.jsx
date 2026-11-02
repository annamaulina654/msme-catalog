import NavAdmin from "@/components/NavAdmin";
import FormPengaturan from "@/components/FormPengaturan";
import { ambilPengaturan } from "@/lib/pengaturan";

export const dynamic = "force-dynamic";

// US-43: pengaturan toko. Nilai kosong memakai lib/toko.js sebagai cadangan.
export default async function HalamanPengaturan() {
  const p = await ambilPengaturan();

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div>
        <h1 className="text-2xl font-extrabold">Pengaturan toko</h1>
        <p className="mt-1 text-sm text-teks-lembut">
          Perubahan langsung dipakai di header, footer, halaman Tentang, dan tombol pesan WhatsApp.
        </p>
      </div>
      <FormPengaturan
        awal={{
          nama: p.nama,
          tagline: p.tagline,
          nomor_whatsapp: p.nomorWhatsApp,
          alamat: p.alamat,
          jam_buka: p.jamBuka,
          profil: p.profil,
        }}
      />
    </div>
  );
}
