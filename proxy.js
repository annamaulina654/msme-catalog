import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

/**
 * K-11: Content-Security-Policy ketat berbasis nonce.
 * Nonce dibuat baru untuk setiap permintaan, jadi hanya script milik Next.js
 * yang boleh jalan. Script sisipan dari pihak lain akan diblokir browser.
 */
function buatCsp(nonce) {
  const sedangDev = process.env.NODE_ENV !== "production";

  const aturan = [
    "default-src 'self'",
    // 'unsafe-eval' hanya dibutuhkan Next.js saat npm run dev.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${sedangDev ? " 'unsafe-eval'" : ""}`,
    // Tailwind memakai file CSS sendiri; Google Fonts dipakai di layout.
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    // Foto produk berasal dari folder public/ (atau data: untuk ikon kecil).
    "img-src 'self' data: blob:",
    // Browser hanya boleh menghubungi server sendiri, tidak boleh ke supabase.co.
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ];

  if (!sedangDev) {
    aturan.push("upgrade-insecure-requests");
  }

  return aturan.join("; ");
}

/** Buat response lanjut dengan header CSP dan nonce terpasang. */
function buatResponse(request, nonce, csp) {
  const headerPermintaan = new Headers(request.headers);
  headerPermintaan.set("x-nonce", nonce);
  headerPermintaan.set("Content-Security-Policy", csp);

  const response = NextResponse.next({
    request: { headers: headerPermintaan },
  });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export async function proxy(request) {
  const nonce = btoa(crypto.randomUUID());
  const csp = buatCsp(nonce);
  const { pathname } = request.nextUrl;

  let response = buatResponse(request, nonce, csp);

  // Halaman publik hanya butuh header CSP, tidak perlu memeriksa login.
  const halamanAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
  if (!halamanAdmin) {
    return response;
  }

  let supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // Tanpa kunci Supabase tidak ada sesi yang bisa diperiksa: tolak akses admin.
    if (pathname !== "/admin/login") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return response;
  }

  supabaseUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = buatResponse(request, nonce, csp);
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Semua rute /admin kecuali /admin/login wajib login dengan Supabase Auth
  if (pathname !== "/admin/login" && !user) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return response;
}

export const middleware = proxy;
export default proxy;

export const config = {
  matcher: [
    {
      // Semua halaman, kecuali file statis dan permintaan prefetch.
      source: "/((?!_next/static|_next/image|favicon.ico|produk/.*\\.svg|icons/).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
