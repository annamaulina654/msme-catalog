"use client";

import { useActionState } from "react";
import Tombol from "@/components/Tombol";

// Form satu kolom untuk menambah kategori, atau mengubah nama kategori kalau `id` diberikan (US-31).
export default function FormKategori({ aksi, id, nilaiAwal = "", label, placeholder = "Nama kategori" }) {
  const [state, formAction, isPending] = useActionState(aksi, null);

  return (
    <form action={formAction} className="flex flex-col gap-1">
      <div className="flex gap-2">
        {id && <input type="hidden" name="id" value={id} />}
        <input
          name="nama"
          defaultValue={nilaiAwal}
          placeholder={placeholder}
          aria-label={id ? `Nama kategori ${nilaiAwal}` : "Nama kategori baru"}
          maxLength={40}
          required
          className="w-full min-w-0 rounded-lg border border-garis bg-latar px-3 py-2 text-base text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
        />
        <Tombol type="submit" varian={id ? "garis" : "utama"} disabled={isPending}>
          {isPending ? "Menyimpan..." : label}
        </Tombol>
      </div>
      {state?.error && (
        <p role="alert" className="text-sm text-bahaya">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p role="status" className="text-sm text-tautan">
          {state.success}
        </p>
      )}
    </form>
  );
}
