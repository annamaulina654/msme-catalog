"use client";

import { useActionState } from "react";
import Tombol from "@/components/Tombol";
import { tanyaProduk } from "@/app/aksi-publik";

// US-50: kotak tanya jawab. Jawaban dibuat di server dan hanya berdasar data produk.
export default function TanyaProduk({ produkId }) {
  const [state, formAction, isPending] = useActionState(tanyaProduk.bind(null, produkId), null);

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-3">
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Tanya tentang produk ini
        <textarea
          name="pertanyaan"
          rows={2}
          maxLength={200}
          required
          defaultValue={state?.pertanyaan ?? ""}
          placeholder="Contoh: apakah produk ini pedas?"
          className="w-full rounded-lg border border-garis bg-latar px-3 py-2.5 text-base text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
        />
        <span className="text-xs font-normal text-teks-lembut">Maksimal 200 karakter. Dijawab oleh AI berdasarkan data produk.</span>
      </label>

      <div>
        <Tombol type="submit" varian="garis" disabled={isPending}>
          {isPending ? "AI sedang menjawab..." : "Tanya AI"}
        </Tombol>
      </div>

      {state?.error && (
        <p role="alert" className="text-sm text-bahaya">
          {state.error}
        </p>
      )}
      {state?.jawaban && (
        <div role="status" className="rounded-lg border border-garis bg-permukaan p-3 text-sm">
          <p className="font-semibold">Jawaban</p>
          <p className="mt-1">{state.jawaban}</p>
          <p className="mt-2 text-xs text-teks-lembut">Jawaban AI bisa keliru. Untuk kepastian, tanyakan lewat WhatsApp.</p>
        </div>
      )}
    </form>
  );
}
