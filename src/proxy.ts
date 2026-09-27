import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// ─── CONST DOORPASS ───────────────────────────────────────────────────────────
// Kode pintu rahasia diambil dari environment variable server-side.
// Tidak ada prefix NEXT_PUBLIC_ sehingga TIDAK terekspos ke browser.
const loginDoorPass = process.env.ADMIN_DOORPASS;

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const { pathname, searchParams } = request.nextUrl;

  const isLoginPage = pathname === "/admin/login";
  const isAdminRoute = pathname.startsWith("/admin");

  // ─── LAPISAN 1: PERIKSA DOORPASS (khusus halaman /admin/login) ────────────
  // Halaman login HANYA dapat diakses melalui URL:
  //   /admin/login?door=<KODE_PINTU>
  // Jika parameter ?door= tidak ada atau salah → 404 (halaman seolah tidak ada)
  if (isLoginPage) {
    const door = searchParams.get("door") ?? "";

    // Verifikasi kecocokan Door Pass (aman terhadap spasi)
    if (!loginDoorPass || door.trim() !== loginDoorPass) {
      return new NextResponse(null, { status: 404 });
    }
  }

  // ─── LAPISAN 2: SUPABASE AUTH CHECK ──────────────────────────────────────
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Halaman admin (bukan login) tanpa sesi aktif → 404
  // (tidak reveal URL login ke publik)
  if (isAdminRoute && !isLoginPage && !user) {
    return new NextResponse(null, { status: 404 });
  }

  // Sudah login tapi masih di halaman login → redirect ke dashboard
  if (isLoginPage && user) {
    return NextResponse.redirect(new URL("/admin/proyek", request.url));
  }

  return supabaseResponse;
}

export const config = {
  // Proteksi berlaku untuk semua rute /admin/* termasuk sub-rute
  matcher: ["/admin/:path*"],
};