import { randomUUID } from "node:crypto";
import { createClient } from "@/lib/supabase/server";

// US-29: unggah foto ke Supabase Storage dari server. Kunci rahasia tidak pernah ke browser.
// Pemanggil WAJIB sudah memeriksa bahwa admin login.

export const BATAS_FOTO = 1_572_864; // 1,5 MB (batas isi permintaan di Vercel sekitar 4,5 MB)
const EKSTENSI = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

// Kenali jenis gambar dari isi file (bukan dari nama atau tipe yang dikirim browser).
function kenaliJenis(b) {
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  if (
    b.length >= 12 &&
    b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
    b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50
  ) {
    return "image/webp";
  }
  return null;
}

// Mengembalikan { kosong: true } kalau tidak ada file, { error } kalau ditolak,
// atau { url } berisi alamat foto di aplikasi ini (/foto/...).
export async function unggahFoto(file) {
  if (!file || typeof file === "string" || typeof file.arrayBuffer !== "function" || file.size === 0) {
    return { kosong: true };
  }

  if (file.size > BATAS_FOTO) {
    return { error: "Ukuran foto maksimal 1,5 MB." };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const jenis = kenaliJenis(bytes);
  if (!jenis) {
    return { error: "File harus berupa gambar JPG, PNG, atau WebP." };
  }

  const nama = `${randomUUID()}.${EKSTENSI[jenis]}`;

  try {
    const supabase = createClient();
    const { error } = await supabase.storage
      .from("foto-produk")
      .upload(nama, bytes, { contentType: jenis, upsert: false });

    if (error) {
      console.error("Gagal mengunggah foto, kode:", error.statusCode ?? error.name ?? "tidak-diketahui");
      return { error: "Foto belum bisa diunggah. Coba lagi beberapa saat lagi." };
    }
  } catch (err) {
    console.error("Gagal mengunggah foto, jenis error:", err?.name ?? "tidak-diketahui");
    return { error: "Foto belum bisa diunggah. Coba lagi beberapa saat lagi." };
  }

  return { url: `/foto/${nama}` };
}
