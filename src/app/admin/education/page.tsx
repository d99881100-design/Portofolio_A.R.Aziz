import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getTrimmedString(value: FormDataEntryValue | null | undefined, defaultValue = ""): string {
  const text = String(value ?? "").trim();
  return text || defaultValue;
}

async function createEducationAction(formData: FormData) {
  "use server";

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let errorMessage: string | null = null;

  try {
    const school = getTrimmedString(formData.get("school") || formData.get("sekolah"));
    if (!school) throw new Error("Nama Sekolah / Kampus wajib diisi.");

    const major = getTrimmedString(formData.get("major") || formData.get("jurusan"));
    if (!major) throw new Error("Jurusan / Bidang Keahlian wajib diisi.");

    const year = getTrimmedString(formData.get("year") || formData.get("tahun"), "2023 — 2026");
    const description = getTrimmedString(formData.get("description") || formData.get("deskripsi"));

    const { error } = await supabase.from("education").insert({
      school,
      major,
      year,
      description,
    });

    if (error) {
      console.error("Failed to insert education:", error);
      throw new Error(error.message || "Gagal menambahkan data pendidikan.");
    }

    revalidatePath("/", "layout");
    revalidatePath("/admin/education");
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "Gagal membuat pendidikan.";
    console.error("Education creation error:", errorMessage);
  }

  if (errorMessage) {
    redirect("/admin/education?error=" + encodeURIComponent(errorMessage));
  }

  redirect("/admin/education");
}

export default async function AdminEducationPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user || userError) {
    redirect("/login");
  }

  const params = await searchParams;
  const { data, error } = await supabase
    .from("education")
    .select("*")
    .order("id", { ascending: true });

  const educationList = data ?? [];
  const errorText = Array.isArray(params.error)
    ? params.error[0]
    : typeof params.error === "string"
      ? params.error
      : "";

  const displayError = error ? error.message : "";
  const hasError = Boolean(errorText || displayError);

  return (
    <main className="space-y-8 pb-10">
      {/* Header */}
      <section className="rounded-[28px] border border-[color:var(--line)] bg-[color:var(--paper)]/90 p-6 shadow-[0_16px_44px_rgba(23,24,22,0.06)] backdrop-blur-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-[color:var(--muted)]">
              Dashboard Admin &bull; Portofolio
            </p>
            <h1 className="m-0 text-3xl font-semibold tracking-[-0.05em] text-[color:var(--ink)] sm:text-4xl">
              Manajemen Pendidikan (Education)
            </h1>
            <p className="mt-2 text-sm text-[color:var(--muted)]">
              Kelola riwayat pendidikan formal, institusi, dan jurusan yang Anda tempuh.
            </p>
          </div>
          <Link
            href="/#about"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--line)] bg-[color:var(--paper)] px-4 py-2 text-xs font-medium text-[color:var(--ink)] shadow-subtle transition hover:bg-[color:var(--paper-elevated)] hover:border-[color:var(--ink)] active:scale-[0.98]"
          >
            <span>Lihat di Website</span>
            <span>&rarr;</span>
          </Link>
        </div>

        <div className="mt-6 border-t border-[color:var(--line)] pt-6">
          <p className="text-xs uppercase tracking-wider text-[color:var(--muted)]">Total Riwayat Pendidikan</p>
          <p className="mt-1 text-2xl font-bold text-[color:var(--ink)]">{educationList.length}</p>
        </div>
      </section>

      {/* Form Tambah Pendidikan */}
      <section className="rounded-[28px] border border-[color:var(--line)] bg-[color:var(--paper)]/90 p-6 shadow-[0_16px_44px_rgba(23,24,22,0.06)] backdrop-blur-sm sm:p-8">
        <div className="mb-6">
          <h2 className="m-0 text-2xl font-semibold tracking-[-0.04em] text-[color:var(--ink)]">
            Tambah Riwayat Pendidikan
          </h2>
          <p className="mt-1 text-xs text-[color:var(--muted)]">
            Isi nama sekolah/kampus, jurusan, kurun waktu tahun, dan deskripsi singkat.
          </p>
        </div>

        <form action={createEducationAction} className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-2 text-sm font-medium text-[color:var(--ink)] md:col-span-1">
            <span>Sekolah / Universitas *</span>
            <input
              type="text"
              name="school"
              required
              placeholder="Contoh: SMKN 1 Probolinggo"
              className="w-full rounded-2xl border border-[color:var(--line)] bg-transparent px-4 py-3 text-base text-[color:var(--ink)] placeholder:text-[color:var(--muted)] focus:border-[color:var(--ink)] focus:outline-none"
            />
          </label>

          <label className="block space-y-2 text-sm font-medium text-[color:var(--ink)] md:col-span-1">
            <span>Jurusan / Program Studi *</span>
            <input
              type="text"
              name="major"
              required
              placeholder="Contoh: Rekayasa Perangkat Lunak"
              className="w-full rounded-2xl border border-[color:var(--line)] bg-transparent px-4 py-3 text-base text-[color:var(--ink)] placeholder:text-[color:var(--muted)] focus:border-[color:var(--ink)] focus:outline-none"
            />
          </label>

          <label className="block space-y-2 text-sm font-medium text-[color:var(--ink)] md:col-span-1">
            <span>Tahun / Periode *</span>
            <input
              type="text"
              name="year"
              required
              placeholder="Contoh: 2023 — 2026"
              className="w-full rounded-2xl border border-[color:var(--line)] bg-transparent px-4 py-3 text-base text-[color:var(--ink)] placeholder:text-[color:var(--muted)] focus:border-[color:var(--ink)] focus:outline-none"
            />
          </label>

          <label className="block space-y-2 text-sm font-medium text-[color:var(--ink)] md:col-span-2">
            <span>Deskripsi / Fokus Pembelajaran *</span>
            <textarea
              name="description"
              required
              rows={3}
              placeholder="Jelaskan fokus keahlian, materi penting, atau kegiatan studi..."
              className="w-full rounded-2xl border border-[color:var(--line)] bg-transparent px-4 py-3 text-base text-[color:var(--ink)] placeholder:text-[color:var(--muted)] focus:border-[color:var(--ink)] focus:outline-none"
            />
          </label>

          {hasError ? (
            <div
              role="alert"
              aria-live="polite"
              className="md:col-span-2 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300"
            >
              <strong>Perhatian:</strong> {errorText || displayError}
            </div>
          ) : null}

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              className="button button-dark w-full sm:w-auto"
              style={{ minWidth: "180px", padding: "12px 28px" }}
            >
              Simpan Pendidikan
            </button>
          </div>
        </form>
      </section>

      {/* Tabel Daftar Pendidikan */}
      <section className="rounded-[28px] border border-[color:var(--line)] bg-[color:var(--paper)]/90 p-6 shadow-[0_16px_44px_rgba(23,24,22,0.06)] backdrop-blur-sm sm:p-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="m-0 text-2xl font-semibold tracking-[-0.04em] text-[color:var(--ink)]">
            Daftar Pendidikan
          </h2>
          <span className="text-xs text-[color:var(--muted)]">
            {educationList.length} data tersimpan
          </span>
        </div>

        {educationList.length === 0 ? (
          <p className="text-sm text-[color:var(--muted)]">Belum ada data pendidikan yang tersimpan di Supabase.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[color:var(--line)] text-[color:var(--muted)]">
                  <th className="px-3 py-3 font-medium">Periode</th>
                  <th className="px-3 py-3 font-medium">Sekolah / Kampus</th>
                  <th className="px-3 py-3 font-medium">Jurusan</th>
                  <th className="px-3 py-3 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--line)]">
                {educationList.map((item) => (
                  <tr key={item.id} className="hover:bg-[color:var(--line)]/20 transition-colors">
                    <td className="px-3 py-3 text-[color:var(--muted)] font-mono text-xs whitespace-nowrap">
                      {item.year}
                    </td>
                    <td className="px-3 py-3 font-medium text-[color:var(--ink)]">
                      {item.school}
                    </td>
                    <td className="px-3 py-3 text-[color:var(--muted)]">
                      {item.major}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/education/edit/${item.id}`}
                          className="inline-flex items-center justify-center min-h-[30px] rounded-full border border-[color:var(--line)] bg-[color:var(--paper)] px-3.5 py-1 text-xs font-semibold text-[color:var(--ink)] shadow-xs hover:border-[color:var(--ink)] hover:bg-[color:var(--ink)] hover:text-[color:var(--paper)] transition-all active:scale-95"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/admin/education/hapus/${item.id}`}
                          className="inline-flex items-center justify-center min-h-[30px] rounded-full border border-red-500/50 bg-red-500/10 px-3.5 py-1 text-xs font-semibold text-red-600 dark:text-red-400 shadow-xs hover:border-red-600 hover:bg-red-600 hover:text-white transition-all active:scale-95"
                        >
                          Hapus
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
