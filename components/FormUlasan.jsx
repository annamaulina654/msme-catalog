"use client";

import { useActionState } from "react";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { kirimUlasan } from "@/app/aksi-publik";

// US-38: form ulasan. Kolom "website" adalah honeypot: tersembunyi untuk manusia, diisi oleh bot.
export default function FormUlasan({ produkId }) {
  const [state, formAction, isPending] = useActionState(kirimUlasan.bind(null, produkId), null);
  const errors = state?.errors ?? {};
  const nilai = state?.nilai ?? {};

  // Setelah berhasil, form dimuat ulang dalam keadaan kosong.
  return (
    <form key={state?.success ? "selesai" : "isi"} action={formAction} className="flex max-w-xl flex-col gap-3">
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

      <Input label="Nama Anda" name="nama" defaultValue={nilai.nama ?? ""} maxLength={50} required error={errors.nama} />

      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Rating
        <select
          name="rating"
          defaultValue={nilai.rating ?? ""}
          required
          className={`w-full rounded-lg border ${errors.rating ? "border-bahaya" : "border-garis"} bg-latar px-3 py-2.5 text-base text-teks focus:border-utama focus:outline-none`}
        >
          <option value="" disabled>
            Pilih rating
          </option>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {"★".repeat(n)}
              {"☆".repeat(5 - n)} ({n})
            </option>
          ))}
        </select>
        {errors.rating && <span className="text-sm font-normal text-bahaya">{errors.rating}</span>}
      </label>

      <Input
        label="Komentar (5 sampai 500 karakter)"
        name="komentar"
        textarea
        defaultValue={nilai.komentar ?? ""}
        maxLength={500}
        required
        error={errors.komentar}
      />

      {/* Honeypot: jangan diisi. Disembunyikan dari tampilan dan pembaca layar. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Jangan isi kolom ini
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
