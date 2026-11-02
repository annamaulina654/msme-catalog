import { headers } from "next/headers";

// Alamat IP pengunjung, HANYA untuk pembatasan kiriman di memori server (rate limit).
// Tidak pernah disimpan ke database (US-40: tanpa data pribadi).
export async function ambilIp() {
  const daftarHeader = await headers();
  const diteruskan = daftarHeader.get("x-forwarded-for");
  if (diteruskan) return diteruskan.split(",")[0].trim();
  return daftarHeader.get("x-real-ip") || "tidak-dikenal";
}
