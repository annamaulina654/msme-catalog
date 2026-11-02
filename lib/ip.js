import { headers } from "next/headers";

// Alamat IP pengunjung, hanya untuk pembatasan kiriman di memori server (lib/rate-limit.js).
// Tidak pernah disimpan ke database.
export async function ambilIp() {
  const daftarHeader = await headers();
  const diteruskan = daftarHeader.get("x-forwarded-for");
  if (diteruskan) return diteruskan.split(",")[0].trim();
  return daftarHeader.get("x-real-ip") || "tidak-dikenal";
}
