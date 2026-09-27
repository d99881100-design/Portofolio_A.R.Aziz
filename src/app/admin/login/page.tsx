import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

// ─── CONST DOORPASS ───────────────────────────────────────────────────────────
// Kode pintu diambil dari environment variable server-side.
// Sama dengan yang digunakan di proxy.ts (middleware).
const loginDoorPass = process.env.ADMIN_DOORPASS;

async function loginAction(formData: FormData) {
  "use server";

  // Ambil kembali door token dari hidden input agar redirect error tetap valid
  const doorToken = String(formData.get("door_token") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect(
      `/admin/login?door=${encodeURIComponent(doorToken)}&error=Kredensial+tidak+valid`,
    );
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(
      `/admin/login?door=${encodeURIComponent(doorToken)}&error=Kredensial+tidak+valid`,
    );
  }

  redirect("/admin/proyek");
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ door?: string; error?: string | string[] }>;
}) {
  const { door, error } = await searchParams;

  // Verifikasi kecocokan Door Pass (aman terhadap spasi)
  if (!door || door.trim() !== loginDoorPass) {
    notFound();
  }

  // Door Pass benar → render form login
  const errorText =
    Array.isArray(error) ? error[0] : typeof error === "string" ? error : "";
  const hasError = errorText.length > 0;

  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
        <section className="relative w-full max-w-xl overflow-hidden rounded-[28px] border border-[color:var(--line)] bg-[color:var(--paper)]/90 shadow-[0_18px_60px_rgba(23,24,22,0.08)] backdrop-blur-sm">
          <div
            className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(216,250,68,0.16),_transparent_34%)]"
            aria-hidden="true"
          />
          <div className="relative p-6 sm:p-8 lg:p-10">
            <div className="mb-8 space-y-3">
              <div className="flex items-center gap-2">
                <p className="text-[0.7rem] font-medium uppercase tracking-[0.24em] text-[color:var(--muted)]">
                  Admin portal
                </p>
                {/* Badge konfirmasi doorpass sudah benar */}
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[0.65rem] font-semibold text-emerald-600 dark:text-emerald-400">
                  <svg
                    width="9"
                    height="9"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Door Pass ✓
                </span>
              </div>
              <h1 className="m-0 text-3xl font-semibold tracking-[-0.05em] text-[color:var(--ink)] sm:text-4xl">
                Masuk ke dashboard
              </h1>
              <p className="max-w-md text-sm leading-6 text-[color:var(--muted)]">
                Kode pintu terverifikasi. Masukkan email dan password akun admin
                Supabase untuk melanjutkan.
              </p>
            </div>

            <form action={loginAction} className="space-y-5">
              {/* Hidden field untuk meneruskan door token ke Server Action */}
              <input type="hidden" name="door_token" value={door} />

              <label className="block space-y-2 text-sm font-medium text-[color:var(--ink)]">
                <span>Email</span>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-[color:var(--line)] bg-transparent px-4 py-3 text-base text-[color:var(--ink)] placeholder:text-[color:var(--muted)] transition focus:border-[color:var(--ink)] focus:outline-none"
                />
              </label>

              <label className="block space-y-2 text-sm font-medium text-[color:var(--ink)]">
                <span>Password</span>
                <input
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  required
                  placeholder="Masukkan password"
                  className="w-full rounded-2xl border border-[color:var(--line)] bg-transparent px-4 py-3 text-base text-[color:var(--ink)] placeholder:text-[color:var(--muted)] transition focus:border-[color:var(--ink)] focus:outline-none"
                />
              </label>

              {hasError ? (
                <div
                  role="alert"
                  aria-live="polite"
                  className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-[color:var(--ink)]"
                >
                  Kredensial tidak valid. Periksa email dan password Anda.
                </div>
              ) : null}

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-full border border-[color:var(--ink)] bg-[color:var(--ink)] px-5 py-3 text-sm font-medium text-[color:var(--paper)] transition hover:translate-y-[-1px] hover:opacity-95"
              >
                Masuk
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
