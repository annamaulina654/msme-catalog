"use client";

import { useActionState } from "react";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { simpanPengaturan } from "@/app/admin/aksi-konten";

// US-43: ubah data toko tanpa mengedit kode. `awal` berisi nilai yang berlaku sekarang.
export default function FormPengaturan({ awal }) {
  const [state, formAction, isPending] = useActionState(simpanPengaturan, null);
  const errors = state?.errors ?? {};
  const nilai = state?.nilai ?? awal;

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

      <Input label="Nama toko" name="nama" defaultValue={nilai.nama ?? ""} maxLength={60} required error={errors.nama} />
      <Input label="Tagline" name="tagline" defaultValue={nilai.tagline ?? ""} maxLength={160} error={errors.tagline} />
      <Input
        label="Nomor WhatsApp (contoh: 081234567890)"
        name="nomor_whatsapp"
        type="tel"
        inputMode="tel"
        defaultValue={nilai.nomor_whatsapp ?? ""}
        required
        error={errors.nomor_whatsapp}
      />
      <Input label="Alamat" name="alamat" defaultValue={nilai.alamat ?? ""} maxLength={200} error={errors.alamat} />
      <Input label="Jam buka" name="jam_buka" defaultValue={nilai.jam_buka ?? ""} maxLength={80} error={errors.jam_buka} />
      <Input
        label="Profil toko (tampil di halaman Tentang)"
        name="profil"
        textarea
        defaultValue={nilai.profil ?? ""}
        maxLength={2000}
        error={errors.profil}
      />

      <div>
        <Tombol type="submit" disabled={isPending}>
          {isPending ? "Menyimpan..." : "Simpan pengaturan"}
        </Tombol>
      </div>
    </form>
  );
}
