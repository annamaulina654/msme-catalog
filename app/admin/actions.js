"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { cekBatas, resetBatas, teksTunggu } from "@/lib/rate-limit";
import { validasiProduk, idProduk, PESAN_PERIKSA_ISIAN } from "@/lib/validasi-produk";
import { ambilSesiAdmin, PESAN_BELUM_LOGIN } from "@/lib/sesi-admin";
import { catatLog } from "@/lib/log";
import { unggahFoto } from "@/lib/foto";
import { tanyaGemini } from "@/lib/ai";

const PESAN_GAGAL_SIMPAN = "Gagal menyimpan produk. Coba lagi beberapa saat lagi.";

async function ambilIp() {
  const daftarHeader = await headers();
  const diteruskan = daftarHeader.get("x-forwarded-for");
  if (diteruskan) return diteruskan.split(",")[0].trim();
  return daftarHeader.get("x-real-ip") || "tidak-dikenal";
}

// Daftar nama kategori dari tabel kategori (US-31). Kosong kalau tabel belum ada atau belum terisi,
// dan validasi kategori dilewati.
async function ambilNamaKategori(supabase) {
  try {
    const { data } = await supabase.from("kategori").select("nama");
    return (data ?? []).map((k) => k.nama);
  } catch {
    return [];
  }
}

function segarkan() {
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function login(prevState, formData) {
  const data = formData instanceof FormData ? formData : prevState;
  const email = data?.get?.("email")?.toString()?.trim() || "";
  const password = data?.get?.("password")?.toString() || "";

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  // K-12: batasi percobaan login. Per alamat IP + email (5x) dan per IP saja (20x)
  // dalam 15 menit.
  const ip = await ambilIp();
  const kunciEmail = `login:${ip}:${email.toLowerCase()}`;
  const kunciIp = `login-ip:${ip}`;

  const batasEmail = cekBatas(kunciEmail, { maks: 5 });
  const batasIp = cekBatas(kunciIp, { maks: 20 });
  if (!batasEmail.diizinkan || !batasIp.diizinkan) {
    return { error: teksTunggu(Math.max(batasEmail.tungguDetik ?? 0, batasIp.tungguDetik ?? 0)) };
  }

  let errorToReturn = null;
  try {
    const supabase = await createAdminClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // K-9: jangan teruskan pesan mentah dari Supabase ke pengunjung.
      errorToReturn =
        error.code === "invalid_credentials" || error.message === "Invalid login credentials"
          ? "Email atau password salah."
          : "Login gagal. Coba lagi beberapa saat lagi.";
    }
  } catch {
    errorToReturn = "Terjadi kesalahan saat memproses login. Coba lagi beberapa saat lagi.";
  }

  if (errorToReturn) {
    return { error: errorToReturn };
  }

  resetBatas(kunciEmail);
  redirect("/admin");
}

export async function logout() {
  try {
    const supabase = await createAdminClient();
    await supabase.auth.signOut();
  } catch {
    // Abaikan jika sudah tidak ada sesi aktif
  }

  redirect("/admin/login");
}

export async function gantiPassword(prevState, formData) {
  const data = formData instanceof FormData ? formData : prevState;
  const passwordBaru = data?.get?.("password_baru")?.toString() || "";
  const konfirmasiPassword = data?.get?.("konfirmasi_password")?.toString() || "";

  if (!passwordBaru || passwordBaru.length < 8) {
    return { error: "Password baru minimal 8 karakter." };
  }

  if (passwordBaru !== konfirmasiPassword) {
    return { error: "Password baru dan konfirmasi password tidak cocok." };
  }

  try {
    const supabase = await createAdminClient();

    // Pastikan admin sedang login sebelum mengubah password
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: PESAN_BELUM_LOGIN };
    }

    // K-12: batasi ganti password, 5x per 15 menit per akun.
    const batas = cekBatas(`password:${user.id}`, { maks: 5 });
    if (!batas.diizinkan) {
      return { error: teksTunggu(batas.tungguDetik) };
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: passwordBaru,
    });

    if (updateError) {
      // K-9: pesan dibuat sendiri, bukan diteruskan mentah dari Supabase.
      if (updateError.code === "same_password") {
        return { error: "Password baru harus berbeda dari password lama." };
      }
      if (updateError.code === "weak_password") {
        return { error: "Password terlalu lemah. Gunakan kombinasi yang lebih panjang." };
      }
      return { error: "Gagal mengganti password. Coba lagi beberapa saat lagi." };
    }

    await catatLog({ supabase, user }, "Ganti password", null);
    return { success: "Password berhasil diganti." };
  } catch {
    return { error: "Terjadi kesalahan saat mengganti password. Coba lagi beberapa saat lagi." };
  }
}

// Siapkan data produk dari form: validasi, lalu unggah foto (US-29) kalau ada.
// Mengembalikan { data } kalau siap disimpan, atau { balasan } berisi respons error untuk form.
async function siapkanDataProduk(sesi, formData) {
  const kategoriBoleh = await ambilNamaKategori(sesi.supabase);
  const hasil = validasiProduk(formData, { kategoriBoleh });
  const errors = { ...hasil.errors };

  if (Object.keys(errors).length > 0) {
    return { balasan: { error: PESAN_PERIKSA_ISIAN, errors, nilai: hasil.nilai } };
  }

  const data = { ...hasil.data };

  // US-29: foto utama dari komputer menggantikan link foto.
  const foto = await unggahFoto(formData.get("foto_file"));
  if (foto.error) errors.foto_file = foto.error;
  else if (foto.url) data.foto_url = foto.url;

  // US-18: satu foto tambahan dari komputer ditambahkan ke galeri.
  const tambahan = await unggahFoto(formData.get("galeri_file"));
  if (tambahan.error) errors.galeri_file = tambahan.error;
  else if (tambahan.url) data.galeri = [...data.galeri, tambahan.url].slice(0, 8);

  if (Object.keys(errors).length > 0) {
    return { balasan: { error: PESAN_PERIKSA_ISIAN, errors, nilai: hasil.nilai } };
  }

  return { data, nilai: hasil.nilai };
}

// US-08: tambah produk.
export async function tambahProduk(prevState, formData) {
  const sesi = await ambilSesiAdmin();
  if (!sesi) {
    return { error: PESAN_BELUM_LOGIN };
  }

  const siap = await siapkanDataProduk(sesi, formData);
  if (siap.balasan) return siap.balasan;

  try {
    // US-47: produk baru ditaruh paling akhir.
    const { data: terakhir } = await sesi.supabase
      .from("produk")
      .select("urutan")
      .order("urutan", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: baru, error } = await sesi.supabase
      .from("produk")
      .insert({ ...siap.data, urutan: (terakhir?.urutan ?? -1) + 1 })
      .select("id")
      .single();

    if (error) {
      console.error("Gagal menambah produk, kode:", error.code ?? "tidak-diketahui");
      return { error: PESAN_GAGAL_SIMPAN, nilai: siap.nilai };
    }

    await catatLog(sesi, "Tambah produk", `${siap.data.nama} (#${baru?.id})`);
  } catch (err) {
    console.error("Gagal menambah produk, jenis error:", err?.name ?? "tidak-diketahui");
    return { error: PESAN_GAGAL_SIMPAN, nilai: siap.nilai };
  }

  segarkan();
  redirect("/admin");
}

// US-09: ubah produk. `id` diisi lewat bind() di halaman, lalu diperiksa ulang di sini.
export async function ubahProduk(id, prevState, formData) {
  const sesi = await ambilSesiAdmin();
  if (!sesi) {
    return { error: PESAN_BELUM_LOGIN };
  }

  const idValid = idProduk(id);
  if (!idValid) {
    return { error: "Produk tidak ditemukan." };
  }

  const siap = await siapkanDataProduk(sesi, formData);
  if (siap.balasan) return siap.balasan;

  try {
    // select("id") supaya ketahuan kalau tidak ada baris yang berubah (id salah atau sudah dihapus).
    const { data: terubah, error } = await sesi.supabase
      .from("produk")
      .update(siap.data)
      .eq("id", idValid)
      .select("id");

    if (error) {
      console.error("Gagal mengubah produk, kode:", error.code ?? "tidak-diketahui");
      return { error: PESAN_GAGAL_SIMPAN, nilai: siap.nilai };
    }
    if (!terubah || terubah.length === 0) {
      return { error: "Produk tidak ditemukan atau sudah dihapus.", nilai: siap.nilai };
    }

    await catatLog(sesi, "Ubah produk", `${siap.data.nama} (#${idValid})`);
  } catch (err) {
    console.error("Gagal mengubah produk, jenis error:", err?.name ?? "tidak-diketahui");
    return { error: PESAN_GAGAL_SIMPAN, nilai: siap.nilai };
  }

  segarkan();
  revalidatePath(`/produk/${idValid}`);
  redirect("/admin");
}

// US-10: hapus produk. Konfirmasi ditanyakan di browser (components/TombolHapus.jsx);
// pemeriksaan login yang sebenarnya tetap di sini, di server.
export async function hapusProduk(prevState, formData) {
  const sesi = await ambilSesiAdmin();
  if (!sesi) {
    return { error: PESAN_BELUM_LOGIN };
  }

  const id = idProduk(formData?.get?.("id"));
  if (!id) {
    return { error: "Produk tidak ditemukan." };
  }

  try {
    const { data: terhapus, error } = await sesi.supabase
      .from("produk")
      .delete()
      .eq("id", id)
      .select("id, nama");

    if (error) {
      console.error("Gagal menghapus produk, kode:", error.code ?? "tidak-diketahui");
      return { error: "Gagal menghapus produk. Coba lagi beberapa saat lagi." };
    }
    if (!terhapus || terhapus.length === 0) {
      return { error: "Produk tidak ditemukan atau sudah dihapus." };
    }

    await catatLog(sesi, "Hapus produk", `${terhapus[0].nama} (#${id})`);
  } catch (err) {
    console.error("Gagal menghapus produk, jenis error:", err?.name ?? "tidak-diketahui");
    return { error: "Gagal menghapus produk. Coba lagi beberapa saat lagi." };
  }

  segarkan();
  return { success: "Produk dihapus." };
}

// US-32: aktifkan atau nonaktifkan produk tanpa menghapusnya.
export async function aturAktif(prevState, formData) {
  const sesi = await ambilSesiAdmin();
  if (!sesi) {
    return { error: PESAN_BELUM_LOGIN };
  }

  const id = idProduk(formData?.get?.("id"));
  const aktif = formData?.get?.("aktif")?.toString() === "true";
  if (!id) {
    return { error: "Produk tidak ditemukan." };
  }

  try {
    const { data, error } = await sesi.supabase
      .from("produk")
      .update({ aktif })
      .eq("id", id)
      .select("id, nama");

    if (error) {
      console.error("Gagal mengubah status produk, kode:", error.code ?? "tidak-diketahui");
      return { error: "Gagal mengubah status produk." };
    }
    if (!data || data.length === 0) {
      return { error: "Produk tidak ditemukan." };
    }

    await catatLog(sesi, aktif ? "Aktifkan produk" : "Nonaktifkan produk", `${data[0].nama} (#${id})`);
  } catch (err) {
    console.error("Gagal mengubah status produk, jenis error:", err?.name ?? "tidak-diketahui");
    return { error: "Gagal mengubah status produk." };
  }

  segarkan();
  revalidatePath(`/produk/${id}`);
  return { success: aktif ? "Produk diaktifkan." : "Produk dinonaktifkan." };
}

// US-47: naikkan atau turunkan urutan tampil produk.
export async function geserUrutan(prevState, formData) {
  const sesi = await ambilSesiAdmin();
  if (!sesi) {
    return { error: PESAN_BELUM_LOGIN };
  }

  const id = idProduk(formData?.get?.("id"));
  const arah = formData?.get?.("arah")?.toString();
  if (!id || (arah !== "naik" && arah !== "turun")) {
    return { error: "Permintaan tidak valid." };
  }

  try {
    const { data: semua, error } = await sesi.supabase
      .from("produk")
      .select("id, urutan")
      .order("urutan", { ascending: true })
      .order("id", { ascending: true });

    if (error || !semua) {
      console.error("Gagal membaca urutan, kode:", error?.code ?? "tidak-diketahui");
      return { error: "Gagal mengubah urutan." };
    }

    const posisi = semua.findIndex((p) => p.id === id);
    const tujuan = arah === "naik" ? posisi - 1 : posisi + 1;
    if (posisi < 0) return { error: "Produk tidak ditemukan." };
    if (tujuan < 0 || tujuan >= semua.length) return { success: "" };

    // Tukar posisi, lalu nomori ulang supaya tidak ada urutan kembar.
    const susunan = [...semua];
    [susunan[posisi], susunan[tujuan]] = [susunan[tujuan], susunan[posisi]];
    const urutanLama = new Map(semua.map((p) => [p.id, p.urutan]));
    const perubahan = susunan
      .map((p, i) => ({ id: p.id, urutan: i }))
      .filter((p) => urutanLama.get(p.id) !== p.urutan);

    const hasil = await Promise.all(
      perubahan.map((p) => sesi.supabase.from("produk").update({ urutan: p.urutan }).eq("id", p.id))
    );
    if (hasil.some((h) => h.error)) {
      console.error("Gagal menyimpan urutan");
      return { error: "Gagal mengubah urutan." };
    }

    await catatLog(sesi, "Ubah urutan produk", `#${id} ${arah}`);
  } catch (err) {
    console.error("Gagal mengubah urutan, jenis error:", err?.name ?? "tidak-diketahui");
    return { error: "Gagal mengubah urutan." };
  }

  segarkan();
  return { success: "Urutan diperbarui." };
}

// US-14: buat deskripsi dengan Gemini dari nama dan kategori. Dipanggil dari form admin,
// hasilnya mengisi kolom deskripsi dan baru disimpan kalau admin menekan Simpan.
export async function buatDeskripsiAI(nama, kategori) {
  const sesi = await ambilSesiAdmin();
  if (!sesi) {
    return { error: PESAN_BELUM_LOGIN };
  }

  const namaBersih = String(nama ?? "").trim().slice(0, 120);
  const kategoriBersih = String(kategori ?? "").trim().slice(0, 60);
  if (!namaBersih) {
    return { error: "Isi nama produk dulu supaya AI tahu apa yang ditulis." };
  }

  const batas = cekBatas(`ai-deskripsi:${sesi.user.id}`, { maks: 10, jendelaMs: 10 * 60 * 1000 });
  if (!batas.diizinkan) {
    return { error: teksTunggu(batas.tungguDetik) };
  }

  const hasil = await tanyaGemini({
    sistem:
      "Kamu penulis deskripsi produk untuk toko UMKM di Indonesia. Tulis 2 sampai 3 kalimat bahasa Indonesia " +
      "yang ramah, jujur, dan mudah dipahami. Gunakan hanya informasi dari nama dan kategori produk; jangan " +
      "mengarang bahan, ukuran, harga, klaim kesehatan, atau penghargaan. Jangan memakai tanda kutip, markdown, " +
      "daftar, atau emoji. Balas hanya dengan deskripsinya.",
    pengguna: `Nama produk: ${namaBersih}\nKategori: ${kategoriBersih || "-"}`,
    maksToken: 1024,
  });

  if (hasil.error) return { error: hasil.error };

  const deskripsi = hasil.teks.replace(/[*_`#>]/g, "").replace(/\s+/g, " ").trim().slice(0, 600);
  return { deskripsi };
}
