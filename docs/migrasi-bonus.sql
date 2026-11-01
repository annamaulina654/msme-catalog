-- Migrasi bonus: stok (US-19), harga diskon dan badge (US-20).
-- Cara pakai: Supabase > SQL Editor > New query > tempel seluruh isi file ini > Run.
-- Aman dijalankan ulang. JALANKAN INI SEBELUM kode baru di-push ke Vercel,
-- kalau tidak, tambah dan ubah produk di admin akan gagal.
--
-- Kebijakan RLS yang sudah ada di docs/schema.sql otomatis berlaku untuk kolom baru.

alter table public.produk add column if not exists stok integer not null default 10;
alter table public.produk add column if not exists harga_diskon integer;
alter table public.produk add column if not exists badge text;

alter table public.produk drop constraint if exists produk_stok_tidak_negatif;
alter table public.produk add constraint produk_stok_tidak_negatif
  check (stok >= 0);

alter table public.produk drop constraint if exists produk_diskon_valid;
alter table public.produk add constraint produk_diskon_valid
  check (harga_diskon is null or (harga_diskon >= 0 and harga_diskon < harga));

alter table public.produk drop constraint if exists produk_badge_valid;
alter table public.produk add constraint produk_badge_valid
  check (badge is null or badge in ('baru', 'terlaris'));

-- Contoh data (hapus tanda -- di depan baris untuk mencoba, lalu Run):
-- update public.produk set badge = 'terlaris' where nama = 'Kopi Bubuk Robusta 250 g';
-- update public.produk set harga_diskon = 12000 where nama = 'Keripik Singkong Balado';
-- update public.produk set badge = 'baru' where nama = 'Sambal Bawang Botol 150 ml';
-- update public.produk set stok = 0 where nama = 'Kain Batik Cap 2 m';
