"use client";

import { useActionState } from "react";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";

// US-48: form tambah varian. `aksi` sudah berisi id produk (lewat bind() di halaman).
export default function FormVarian({ aksi }) {
  const [state, formAction, isPending] = useActionState(aksi, null);
  const errors = state?.errors ?? {};
  const nilai = state?.nilai ?? {};

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-3">
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
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          label="Nama varian (contoh: 250 g)"
          name="nama"
          defaultValue={nilai.nama ?? ""}
          maxLength={40}
          required
          error={errors.nama}
        />
        <Input
          label="Harga (Rp)"
          name="harga"
          type="number"
          min="0"
          step="1"
          inputMode="numeric"
          defaultValue={nilai.harga ?? ""}
          required
          error={errors.harga}
        />
      </div>
      <div>
        <Tombol type="submit" disabled={isPending}>
          {isPending ? "Menyimpan..." : "Tambah varian"}
        </Tombol>
      </div>
    </form>
  );
}
