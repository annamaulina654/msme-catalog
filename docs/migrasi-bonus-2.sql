-- Migrasi bonus 2: kategori, varian, ulasan, klik WhatsApp, banner, pengaturan toko,
-- log aktivitas, galeri, urutan, aktif/nonaktif, dan bucket foto.
-- Cara pakai: Supabase > SQL Editor > New query > tempel seluruh isi file ini > Run.
-- Aman dijalankan ulang. Jalankan SETELAH docs/migrasi-bonus.sql, dan SEBELUM kode baru di-push.
--
-- Semua tabel memakai RLS: tidak ada izin untuk publik. Pengunjung membaca dan mengirim data
-- lewat server (kunci rahasia), admin yang sudah login memakai kebijakan "authenticated".

-- 1. Kolom baru di tabel produk ------------------------------------------------
alter table public.produk add column if not exists aktif boolean not null default true;
alter table public.produk add column if not exists urutan integer not null default 0;
alter table public.produk add column if not exists galeri text[] not null default '{}';

-- Isi urutan awal berdasarkan id (hanya kalau semua urutan masih 0).
update public.produk p
set urutan = s.n
from (select id, row_number() over (order by id) - 1 as n from public.produk) s
where p.id = s.id
  and not exists (select 1 from public.produk where urutan <> 0);

-- 2. Tabel baru -------------------------------------------------------------------
create table if not exists public.kategori (
  id bigint generated always as identity primary key,
  nama text not null,
  slug text not null,
  created_at timestamptz not null default now(),
  constraint kategori_nama_unik unique (nama),
  constraint kategori_slug_unik unique (slug)
);

-- Isi daftar kategori dari kategori yang sudah dipakai produk.
insert into public.kategori (nama, slug)
select distinct trim(kategori),
       trim(both '-' from lower(regexp_replace(trim(kategori), '[^a-zA-Z0-9]+', '-', 'g')))
from public.produk
where kategori is not null and trim(kategori) <> ''
on conflict do nothing;

create table if not exists public.varian (
  id bigint generated always as identity primary key,
  produk_id bigint not null references public.produk(id) on delete cascade,
  nama text not null,
  harga integer not null check (harga >= 0),
  urutan integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists varian_produk_idx on public.varian (produk_id);

create table if not exists public.ulasan (
  id bigint generated always as identity primary key,
  produk_id bigint not null references public.produk(id) on delete cascade,
  nama text not null check (char_length(nama) between 2 and 50),
  rating smallint not null check (rating between 1 and 5),
  komentar text not null check (char_length(komentar) between 5 and 500),
  tampil boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists ulasan_produk_idx on public.ulasan (produk_id);

-- Catatan klik tombol WhatsApp. Sengaja tidak menyimpan data pribadi (tanpa IP, tanpa nama).
create table if not exists public.klik_wa (
  id bigint generated always as identity primary key,
  produk_id bigint not null references public.produk(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists klik_wa_produk_idx on public.klik_wa (produk_id);

create table if not exists public.banner (
  id bigint generated always as identity primary key,
  judul text not null,
  teks text,
  gambar_url text,
  tautan text,
  aktif boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Satu baris pengaturan (id selalu 1). Kolom kosong berarti memakai nilai di lib/toko.js.
create table if not exists public.pengaturan_toko (
  id integer primary key default 1 check (id = 1),
  nama text,
  tagline text,
  nomor_whatsapp text,
  alamat text,
  jam_buka text,
  profil text,
  updated_at timestamptz not null default now()
);
insert into public.pengaturan_toko (id) values (1) on conflict do nothing;

create table if not exists public.log_aktivitas (
  id bigint generated always as identity primary key,
  admin_email text not null,
  aksi text not null,
  detail text,
  created_at timestamptz not null default now()
);

-- 3. Row Level Security -----------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['kategori', 'varian', 'banner', 'pengaturan_toko'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "admin_semua_%s" on public.%I', t, t);
    execute format(
      'create policy "admin_semua_%s" on public.%I for all to authenticated using (true) with check (true)',
      t, t
    );
  end loop;
end $$;

alter table public.ulasan enable row level security;
drop policy if exists "admin_baca_ulasan" on public.ulasan;
drop policy if exists "admin_ubah_ulasan" on public.ulasan;
drop policy if exists "admin_hapus_ulasan" on public.ulasan;
create policy "admin_baca_ulasan" on public.ulasan for select to authenticated using (true);
create policy "admin_ubah_ulasan" on public.ulasan for update to authenticated using (true) with check (true);
create policy "admin_hapus_ulasan" on public.ulasan for delete to authenticated using (true);

alter table public.klik_wa enable row level security;
drop policy if exists "admin_baca_klik_wa" on public.klik_wa;
create policy "admin_baca_klik_wa" on public.klik_wa for select to authenticated using (true);

alter table public.log_aktivitas enable row level security;
drop policy if exists "admin_baca_log" on public.log_aktivitas;
drop policy if exists "admin_tulis_log" on public.log_aktivitas;
create policy "admin_baca_log" on public.log_aktivitas for select to authenticated using (true);
create policy "admin_tulis_log" on public.log_aktivitas for insert to authenticated with check (true);

-- 4. Fungsi produk terlaris (dihitung dari tabel klik_wa) ------------------------
create or replace function public.produk_terlaris(batas integer default 5)
returns table (produk_id bigint, nama text, jumlah bigint)
language sql
stable
as $$
  select p.id, p.nama, count(k.id)
  from public.klik_wa k
  join public.produk p on p.id = k.produk_id
  group by p.id, p.nama
  order by count(k.id) desc, p.nama asc
  limit greatest(batas, 1)
$$;

-- 5. Bucket penyimpanan foto produk (privat; foto disajikan lewat /foto/...) ------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('foto-produk', 'foto-produk', false, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;
