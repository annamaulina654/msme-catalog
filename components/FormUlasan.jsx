"use client";

import { useActionState, useEffect, useRef } from "react";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { kirimUlasan } from "@/app/aksi-publik";

// US-38: form ulasan (nama, rating 1 sampai 5, komentar). `produkId` disisipkan lewat bind().
export default function FormUlasan({ produkId }) {
  const [state, formAction, isPending] = useActionState(kirimUlasan.bind(null, produkId), null);
  const formRef = useRef(null);
  const errors = state?.errors ?? {};
  const nilai = state?.nilai ?? {};

  // Kosongkan form setelah ulasan berhasil terkirim.
  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex max-w-xl flex-col gap-4">
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

      <Input label="Nama" name="nama" defaultValue={nilai.nama ?? ""} maxLength={50} required error={errors.nama} />

      <fieldset className="flex flex-col gap-1.5">
        <legend className="text-sm font-semibold">Rating</legend>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="cursor-pointer text-sm font-semibold">
              <input type="radio" name="rating" value={n} defaultChecked={nilai.rating === String(n)} required className="peer sr-only" />
              <span className="inline-flex h-10 min-w-12 items-center justify-center rounded-lg border border-garis px-3 peer-checked:border-utama peer-checked:bg-utama peer-checked:text-white peer-focus-visible:outline peer-focus-visible:outline-2">
                {n} ★
              </span>
            </label>
          ))}
        </div>
        {errors.rating && <span className="text-sm text-bahaya">{errors.rating}</span>}
      </fieldset>

      <Input
        label="Komentar (5 sampai 500 karakter)"
        name="komentar"
        textarea
        defaultValue={nilai.komentar ?? ""}
        maxLength={500}
        required
        error={errors.komentar}
      />

      {/* Honeypot: disembunyikan dari pengunjung. Bot yang mengisinya akan diabaikan. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Jangan diisi
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div>
        <Tombol type="submit" disabled={isPending}>
          {isPending ? "Mengirim..." : "Kirim ulasan"}
        </Tombol>
      </div>
    </form>
  );
}
