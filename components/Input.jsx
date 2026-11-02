// `error` (opsional) menampilkan pesan di bawah kolom yang salah (US-34).
export default function Input({ label, name, type = "text", textarea = false, error, ...props }) {
  const kelas = `w-full rounded-lg border ${error ? "border-bahaya" : "border-garis"} bg-latar px-3 py-2.5 text-base text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none`;
  const idError = error ? `${name}-error` : undefined;
  const aksesibilitas = { "aria-invalid": error ? true : undefined, "aria-describedby": idError };

  return (
    <label className="flex flex-col gap-1.5 text-sm font-semibold">
      {label}
      {textarea ? (
        <textarea name={name} rows={4} className={kelas} {...aksesibilitas} {...props} />
      ) : (
        <input name={name} type={type} className={kelas} {...aksesibilitas} {...props} />
      )}
      {error && (
        <span id={idError} className="text-sm font-normal text-bahaya">
          {error}
        </span>
      )}
    </label>
  );
}
