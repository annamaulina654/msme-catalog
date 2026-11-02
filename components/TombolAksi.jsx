"use client";

import { useActionState } from "react";
import Tombol from "@/components/Tombol";

// Tombol generik untuk Server Action berbentuk (prevState, formData).
// `nilai` dikirim sebagai field tersembunyi, `konfirmasi` (opsional) meminta persetujuan dulu,
// dan pesan error dari server tampil di bawah tombol.
export default function TombolAksi({
  aksi,
  nilai = {},
  label,
  labelProses = "Memproses...",
  varian = "garis",
  konfirmasi,
  ariaLabel,
  className = "",
}) {
  const [state, formAction, isPending] = useActionState(aksi, null);

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (konfirmasi && !window.confirm(konfirmasi)) {
          event.preventDefault();
        }
      }}
      className="flex flex-col items-end gap-1"
    >
      {Object.entries(nilai).map(([nama, isi]) => (
        <input key={nama} type="hidden" name={nama} value={String(isi)} />
      ))}
      <Tombol type="submit" varian={varian} disabled={isPending} aria-label={ariaLabel} className={className}>
        {isPending ? labelProses : label}
      </Tombol>
      {state?.error && (
        <p role="alert" className="max-w-[16rem] text-right text-xs text-bahaya">
          {state.error}
        </p>
      )}
    </form>
  );
}
