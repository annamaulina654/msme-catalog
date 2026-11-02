import IsiKeranjang from "@/components/IsiKeranjang";
import { ambilPengaturan } from "@/lib/pengaturan";

export const dynamic = "force-dynamic";
export const metadata = { title: "Keranjang" };

// US-21: keranjang belanja. Seluruh isinya dikirim dalam satu pesan WhatsApp ke nomor toko.
export default async function HalamanKeranjang() {
  const p = await ambilPengaturan();

  return (
    <div className="flex flex-col gap-6 py-8 md:py-12">
      <h1 className="text-3xl font-extrabold tracking-tight">Keranjang</h1>
      <IsiKeranjang nomor={p.nomorWhatsApp} />
    </div>
  );
}
