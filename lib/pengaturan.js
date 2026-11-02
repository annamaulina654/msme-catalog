import { cache } from "react";
import { toko } from "@/lib/toko";
import { createClient } from "@/lib/supabase/server";

// US-43: data toko dari database, dengan lib/toko.js sebagai cadangan untuk setiap kolom
// yang kosong atau kalau database belum bisa dibaca. Dibagi dalam satu permintaan.
export const ambilPengaturan = cache(async () => {
  const cadangan = {
    nama: toko.nama,
    tagline: toko.tagline,
    nomorWhatsApp: toko.nomorWhatsApp,
    alamat: toko.alamat,
    jamBuka: toko.jamBuka,
    profil: "",
  };

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("pengaturan_toko")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (error || !data) return cadangan;

    return {
      nama: data.nama || cadangan.nama,
      tagline: data.tagline || cadangan.tagline,
      nomorWhatsApp: data.nomor_whatsapp || cadangan.nomorWhatsApp,
      alamat: data.alamat || cadangan.alamat,
      jamBuka: data.jam_buka || cadangan.jamBuka,
      profil: data.profil || "",
    };
  } catch {
    return cadangan;
  }
});
