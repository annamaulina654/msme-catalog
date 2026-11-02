import IsiKeranjang from "@/components/IsiKeranjang";
import { ambilPengaturan } from "@/lib/pengaturan";

export const dynamic = "force-dynamic";
export const metadata = { title: "Keranjang", robots: { index: false, follow: true } };

// US-21: keranjang belanja. Nomor WhatsApp dari pengaturan toko (US-43).
export default async function HalamanKeranjang() {
  const { nomorWhatsApp } = await ambilPengaturan();

  return (
    <div className="flex flex-col gap-6 py-8 md:py-12">
      <h1 className="text-3xl font-extrabold tracking-tight">Keranjang</h1>
      <IsiKeranjang nomorWa={nomorWhatsApp} />
    </div>
  );
}
