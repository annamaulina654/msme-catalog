// US-28: kerangka yang tampil selagi halaman detail produk dimuat.
export default function MemuatDetail() {
  return (
    <div aria-busy="true" className="grid gap-8 py-8 md:grid-cols-2 md:py-12">
      <p role="status" className="sr-only">
        Memuat produk...
      </p>
      <div className="aspect-square w-full animate-pulse rounded-2xl border border-garis bg-permukaan" />
      <div className="flex flex-col gap-4">
        <div className="h-4 w-32 animate-pulse rounded bg-permukaan" />
        <div className="h-4 w-20 animate-pulse rounded bg-permukaan" />
        <div className="h-9 w-3/4 animate-pulse rounded bg-permukaan" />
        <div className="h-9 w-32 animate-pulse rounded bg-permukaan" />
        <div className="h-24 w-full max-w-prose animate-pulse rounded bg-permukaan" />
        <div className="h-12 w-48 animate-pulse rounded-lg bg-permukaan" />
      </div>
    </div>
  );
}
