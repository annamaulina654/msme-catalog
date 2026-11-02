"use client";

import { useActionState } from "react";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { simpanBanner } from "@/app/admin/aksi-konten";

// US-42: buat atau ubah banner promo. Kalau `banner` diberikan, form berisi data lama dan menyimpan perubahan.
export default function FormBanner({ banner }) {
  const [state, formAction, isPending] = useActionState(simpanBanner, null);
  const errors = state?.errors ?? {};
  const nilai = state?.nilai ?? banner ?? {};

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      {state?.error && (
        <div role="alert" className="rounded-lg border border-garis bg-permukaan p-3 text-sm text-bahaya">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div role="status" className="rounded-lg border border-garis bg-permukaan p-3 text-sm font-medium text-tautan">
          {state.success}
        </div>
      )}

      {banner?.id && <input type="hidden" name="id" value={banner.id} />}

      <Input label="Judul" name="judul" defaultValue={nilai.judul ?? ""} maxLength={80} required error={errors.judul} />
      <Input label="Teks pendukung" name="teks" textarea defaultValue={nilai.teks ?? ""} maxLength={200} error={errors.teks} />
      <Input
        label="Tautan saat banner diklik (opsional)"
        name="tautan"
        placeholder="/kategori/camilan atau https://..."
        defaultValue={nilai.tautan ?? ""}
        maxLength={300}
        error={errors.tautan}
      />
      <Input
        label="Unggah gambar (JPG, PNG, atau WebP, maks 1,5 MB)"
        name="gambar_file"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        error={errors.gambar_file}
      />
      <Input
        label="Atau link gambar"
        name="gambar_url"
        placeholder="https://... atau /foto/..."
        defaultValue={nilai.gambar_url ?? ""}
        maxLength={500}
        error={errors.gambar_url}
      />
      <label className="flex items-center gap-2 text-sm font-semibold">
        <input type="checkbox" name="aktif" defaultChecked={Boolean(nilai.aktif)} className="h-4 w-4" />
        Tampilkan di beranda
      </label>

      <div className="flex gap-3">
        <Tombol type="submit" disabled={isPending}>
          {isPending ? "Menyimpan..." : banner?.id ? "Simpan perubahan" : "Buat banner"}
        </Tombol>
        {banner?.id && (
          <Tombol href="/admin/banner" varian="garis">
            Batal
          </Tombol>
        )}
      </div>
    </form>
  );
}
