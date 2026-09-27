import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

async function logoutAction() {
  "use server";

  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  const isAuthenticated = Boolean(user && !error);

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      {isAuthenticated ? (
        <header className="mx-auto mb-6 flex w-full max-w-6xl flex-col gap-4 rounded-[24px] border border-[color:var(--line)] bg-[color:var(--paper)]/90 px-4 py-4 shadow-[0_12px_36px_rgba(23,24,22,0.06)] backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-[0.62rem] font-medium uppercase tracking-[0.22em] text-[color:var(--muted)]">
                Admin area
              </p>
              <h1 className="m-0 text-lg font-semibold tracking-[-0.04em] text-[color:var(--ink)]">
                Portfolio Manager
              </h1>
            </div>
          </div>

          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <Link
              href="/admin/proyek"
              className="inline-flex items-center justify-center rounded-full border border-[color:var(--ink)] bg-[color:var(--ink)] px-4 py-2 text-sm font-medium text-[color:var(--paper)] transition hover:opacity-95"
            >
              Proyek
            </Link>

            <div className="flex items-center gap-3 rounded-full border border-[color:var(--line)] bg-[color:var(--paper)] px-3 py-2 text-sm text-[color:var(--ink)]">
              <span className="max-w-[180px] truncate" title={user?.email ?? "Admin"}>
                {user?.email ?? "Admin"}
              </span>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full border border-[color:var(--line)] bg-transparent px-3 py-1.5 text-xs font-medium text-[color:var(--ink)] transition hover:border-[color:var(--ink)]"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </header>
      ) : null}

      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </div>
  );
}
