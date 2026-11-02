"use client";

import { useActionState } from "react";
import Tombol from "@/components/Tombol";
import { tanyaProduk } from "@/app/aksi-publik";

// US-50: kotak tanya jawab. Jawaban dibuat di server dan hanya berdasarkan data produk.
export default function TanyaAI({ produkId }) {
  const [state, formAction, isPending] = useActionState(tanyaProduk.bind(null, produkId), null);

  return (
    <section aria-labelledby="judul-tanya" className="flex max-w-xl flex-col gap-3 rounded-2xl border border-garis p-4">
      <h2 id="judul-tanya" className="font-bold">
        Tanya tentang produk ini
      </h2>
      <form action={formAction} className="flex flex-col gap-2">
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Pertanyaan (maksimal 200 karakter)
          <textarea
            name="pertanyaan"
            rows={2}
            maxLength={200}
            required
            defaultValue={state?.pertanyaan ?? ""}
            placeholder="Contoh: apakah cocok untuk oleh-oleh?"
            className="w-full rounded-lg border border-garis bg-latar px-3 py-2.5 text-base font-normal text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
          />
        </label>
        <div>
          <Tombol type="submit" disabled={isPending}>
            {isPending ? "AI sedang menjawab..." : "Tanya"}
          </Tombol>
        </div>
      </form>

      {state?.error && (
        <p role="alert" className="text-sm text-bahaya">
          {state.error}
        </p>
      )}
      {state?.jawaban && (
        <div role="status" className="rounded-lg bg-permukaan p-3 text-sm">
          <p className="font-semibold">Jawaban</p>
          <p className="mt-1 whitespace-pre-line">{state.jawaban}</p>
          <p className="mt-2 text-xs text-teks-lembut">
            Dijawab AI berdasarkan data produk. Untuk kepastian, tanyakan lewat WhatsApp.
          </p>
        </div>
      )}
    </section>
  );
}
