import { createClient } from "@/lib/supabase/server";

// US-29: sajikan foto dari Supabase Storage lewat server ini, jadi browser tidak perlu
// (dan tidak boleh) menghubungi supabase.co secara langsung.
const JENIS = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };

export async function GET(request, { params }) {
  const { nama } = await params;

  // Hanya nama file yang dibuat aplikasi ini (UUID + ekstensi) yang dilayani.
  const cocok = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$/.exec(nama ?? "");
  if (!cocok) {
    return new Response("Foto tidak ditemukan", { status: 404 });
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase.storage.from("foto-produk").download(nama);

    if (error || !data) {
      return new Response("Foto tidak ditemukan", { status: 404 });
    }

    return new Response(await data.arrayBuffer(), {
      headers: {
        "Content-Type": JENIS[cocok[1]],
        // Nama file unik dan tidak pernah ditimpa, jadi aman disimpan lama di cache.
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Foto belum bisa dimuat", { status: 502 });
  }
}
