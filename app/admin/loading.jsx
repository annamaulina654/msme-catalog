// US-28: kerangka yang tampil selagi halaman admin dimuat.
export default function MemuatAdmin() {
  return (
    <div aria-busy="true" className="flex flex-col gap-6 py-8">
      <p role="status" className="sr-only">
        Memuat halaman admin...
      </p>
      <div className="h-6 w-full max-w-sm animate-pulse rounded bg-permukaan" />
      <div className="h-8 w-40 animate-pulse rounded bg-permukaan" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="h-14 w-full animate-pulse rounded-lg bg-permukaan" />
        ))}
      </div>
    </div>
  );
}
