import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const { pathname, searchParams } = request.nextUrl;

  const isLoginPage = pathname === "/login" || pathname === "/admin/login";
  const isAdminRoute = pathname.startsWith("/admin") && pathname !== "/admin/login";

  const loginDoorPass = process.env.ADMIN_DOORPASS?.trim();
  const doorParam = (searchParams.get("door") ?? "").trim();
  const doorCookie = request.cookies.get("admin_door_unlocked")?.value;

  // ─── LAPISAN 1: DOORPASS UNTUK HALAMAN LOGIN (/login) ─────────────────────
  if (isLoginPage) {
    // Skenario A: User mengakses dengan parameter ?door=KODE_PINTU
    if (doorParam) {
      if (loginDoorPass && doorParam === loginDoorPass) {
        // Doorpass valid! Set cookie dan redirect bersih ke URL /login
        const redirectUrl = new URL("/login", request.url);
        const response = NextResponse.redirect(redirectUrl);
        response.cookies.set("admin_door_unlocked", "1", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24, // Berlaku 24 jam
        });
        return response;
      } else {
        // Doorpass salah → 404
        return new NextResponse(null, { status: 404 });
      }
    }

    // Skenario B: User mengakses /login tanpa parameter ?door
    // Cek apakah cookie doorpass sudah ada (pernah akses via ?door sebelumnya)
    const isUnlocked = doorCookie === "1";
    if (!isUnlocked) {
      return new NextResponse(null, { status: 404 });
    }

    // Jika mengakses /admin/login padahal sudah unlock, redirect ke /login
    if (pathname === "/admin/login") {
      return NextResponse.redirect(new URL("/login", request.url));
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

  // Halaman admin tanpa sesi login aktif → 404 (tidak mengekspos rute admin)
  if (isAdminRoute && !user) {
    return new NextResponse(null, { status: 404 });
  }

  // Pengguna sudah login tetapi membuka /login → otomatis redirect ke dashboard
  if (isLoginPage && user) {
    return NextResponse.redirect(new URL("/admin/proyek", request.url));
  }

  return supabaseResponse;
}

export const config = {
  // Proteksi rute admin dan login
  matcher: ["/admin/:path*", "/login"],
};