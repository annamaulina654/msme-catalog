// US-28: kerangka (skeleton) yang tampil selagi katalog dimuat.
export default function Memuat() {
  return (
    <div aria-busy="true">
      <p role="status" className="sr-only">
        Memuat halaman...
      </p>

      <div className="py-10 sm:py-14">
        <div className="h-10 w-2/3 max-w-md animate-pulse rounded-lg bg-permukaan sm:h-12" />
        <div className="mt-4 h-5 w-full max-w-xl animate-pulse rounded bg-permukaan" />
        <div className="mt-3 h-4 w-40 animate-pulse rounded bg-permukaan" />
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-garis bg-latar">
            <div className="aspect-square w-full animate-pulse bg-permukaan" />
            <div className="flex flex-col gap-2 p-3">
              <div className="h-3 w-16 animate-pulse rounded bg-permukaan" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-permukaan" />
              <div className="h-6 w-24 animate-pulse rounded bg-permukaan" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
