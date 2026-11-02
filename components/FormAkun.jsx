"use client";

import { useActionState } from "react";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { tambahAdmin } from "@/app/admin/aksi-lain";

// US-44: form menambah admin baru.
export default function FormAkun() {
  const [state, formAction, isPending] = useActionState(tambahAdmin, null);
  const errors = state?.errors ?? {};

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
          label="Email admin baru"
          name="email"
          type="email"
          autoComplete="off"
          defaultValue={state?.nilai?.email ?? ""}
          required
          error={errors.email}
        />
        <Input
          label="Password awal (minimal 8 karakter)"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          error={errors.password}
        />
      </div>
      <p className="text-sm text-teks-lembut">Minta admin baru mengganti password setelah masuk pertama kali.</p>
      <div>
        <Tombol type="submit" disabled={isPending}>
          {isPending ? "Menyimpan..." : "Tambah admin"}
        </Tombol>
      </div>
    </form>
  );
}
