"use client";

import { useActionState } from "react";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { imporProduk } from "@/app/admin/aksi-lain";

// US-46: unggah CSV, lalu tampilkan ringkasan berhasil dan gagal beserta nomor barisnya.
export default function FormImpor() {
  const [state, formAction, isPending] = useActionState(imporProduk, null);
  const ringkasan = state?.ringkasan;

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <form action={formAction} className="flex flex-col gap-3">
        {state?.error && (
          <div role="alert" className="rounded-lg border border-garis bg-permukaan p-3 text-sm text-bahaya">
            {state.error}
          </div>
        )}
        <Input label="File CSV (maks 1 MB, 500 baris)" name="berkas" type="file" accept=".csv,text/csv" required />
        <div>
          <Tombol type="submit" disabled={isPending}>
            {isPending ? "Mengimpor..." : "Impor produk"}
          </Tombol>
        </div>
      </form>

      {ringkasan && (
        <section aria-label="Hasil impor" className="rounded-2xl border border-garis p-4" role="status">
          <h2 className="font-bold">Hasil impor</h2>
          <p className="mt-2 text-sm">
            <span className="font-semibold text-tautan">{ringkasan.berhasil} produk berhasil masuk</span>
            {" · "}
            <span className={ringkasan.gagal > 0 ? "font-semibold text-bahaya" : "text-teks-lembut"}>
              {ringkasan.gagal} baris ditolak
            </span>
          </p>
          {ringkasan.kesalahan.length > 0 && (
            <>
              <ul className="mt-3 flex flex-col gap-1.5 text-sm">
                {ringkasan.kesalahan.map((k) => (
                  <li key={k.baris}>
                    <span className="font-semibold">Baris {k.baris}:</span> <span className="text-bahaya">{k.pesan}</span>
                  </li>
                ))}
              </ul>
              {ringkasan.terpotong && (
                <p className="mt-2 text-xs text-teks-lembut">Hanya 50 kesalahan pertama yang ditampilkan.</p>
              )}
            </>
          )}
        </section>
      )}
    </div>
  );
}
