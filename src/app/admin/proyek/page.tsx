import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deleteProjectImage, uploadProjectImage } from "@/lib/images";
import { createSupabaseServerClient } from "@/lib/supabase-server";

function getTrimmedString(value: FormDataEntryValue | null | undefined, defaultValue = ""): string {
  const text = String(value ?? "").trim();
  return text || defaultValue;
}

function parseTechnologies(value: FormDataEntryValue | null | undefined): string[] {
  const raw = String(value ?? "").trim();
  if (!raw) return ["Next.js"];
  const list = raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return list.length > 0 ? list : ["Next.js"];
}

function normalizeOptionalUrl(value: FormDataEntryValue | null | undefined): string | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (!["http:", "https:"].includes(url.protocol)) {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || `project-${Date.now()}`
  );
}

function getProjectInsertErrorMessage(error: { code?: string; message?: string }): string {
  if (error.code === "42501" || error.message?.toLowerCase().includes("row-level security")) {
    return "Database menolak penambahan proyek. Pastikan policy RLS INSERT untuk role 'authenticated' sudah aktif di Supabase.";
  }
  if (error.code === "23505") {
    return "Slug proyek sudah pernah digunakan. Silakan gunakan judul atau slug yang berbeda.";
  }
  return error.message || "Gagal menambahkan proyek ke database.";
}

async function createProjectAction(formData: FormData) {
  "use server";

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let uploadedImageUrl: string | null = null;
  let errorMessage: string | null = null;

  try {
    const title = getTrimmedString(formData.get("title") || formData.get("judul"));
    if (!title) {
      throw new Error("Judul proyek wajib diisi.");
    }

    const rawSlug = getTrimmedString(formData.get("slug"));
    const slug = rawSlug ? slugify(rawSlug) : slugify(title);

    // Dapatkan hitungan proyek yang sudah ada untuk generate nomor urut otomatis
    const { count } = await supabase
      .from("projects")
      .select("*", { count: "exact", head: true });
    const existingCount = typeof count === "number" ? count : 0;

    const rawNumber = getTrimmedString(formData.get("number"));
    const number = rawNumber || String(existingCount + 1).padStart(2, "0");

    const category =
      getTrimmedString(formData.get("category") || formData.get("kategori")) ||
      "Web Application";
    const description =
      getTrimmedString(formData.get("description") || formData.get("deskripsi")) ||
      title;
    const color = getTrimmedString(formData.get("color"), "lime");
    const technologies = parseTechnologies(
      formData.get("technologies") || formData.get("teknologi")
    );
    const githubUrl = normalizeOptionalUrl(formData.get("github_url"));
    const liveUrl = normalizeOptionalUrl(formData.get("live_url") || formData.get("link"));
    const featured =
      formData.get("featured") === "on" ||
      formData.get("featured") === "true" ||
      formData.get("featured") === "1";

    let finalImageUrl = "/images/projects/web_berita.png";
    const explicitImageUrl = getTrimmedString(formData.get("image_url"));
    if (explicitImageUrl) {
      finalImageUrl = explicitImageUrl;
    }

    const imageFile = formData.get("image");
    if (imageFile instanceof File && imageFile.size > 0) {
      try {
        const uploadResult = await uploadProjectImage(supabase, imageFile);
        if (uploadResult?.publicUrl) {
          uploadedImageUrl = uploadResult.publicUrl;
          finalImageUrl = uploadResult.publicUrl;
        }
      } catch (uploadError) {
        console.warn("Upload gambar ke Supabase Storage tidak berhasil:", uploadError);
        // Jika upload gagal tapi user tidak memasukkan image_url manual, fallback ke default
        if (!explicitImageUrl) {
          finalImageUrl = "/images/projects/web_berita.png";
        }
      }
    }

    const { error: insertError } = await supabase.from("projects").insert({
      slug,
      number,
      title,
      category,
      description,
      image: finalImageUrl,
      technologies,
      github_url: githubUrl,
      live_url: liveUrl,
      featured,
      color,
    });

    if (insertError) {
      console.error("Failed to insert project:", insertError);
      throw new Error(getProjectInsertErrorMessage(insertError));
    }

    revalidatePath("/admin/proyek");
    revalidatePath("/projects");
    revalidatePath("/proyek");
    revalidatePath("/");
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "Gagal membuat proyek.";
    if (uploadedImageUrl) {
      try {
        await deleteProjectImage(supabase, uploadedImageUrl);
      } catch {
        // Abaikan pembersihan jika gagal
      }
    }
    console.error("Project creation failed:", errorMessage);
  }

  if (errorMessage) {
    redirect("/admin/proyek?error=" + encodeURIComponent(errorMessage));
  }

  redirect("/admin/proyek");
}

export default async function AdminProjectsPage({
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
    .from("projects")
    .select("*")
    .order("id", { ascending: true });

  const projects = data ?? [];
  const errorText = Array.isArray(params.error)
    ? params.error[0]
    : typeof params.error === "string"
      ? params.error
      : "";

  const displayError = error ? error.message : "";
  const hasError = Boolean(errorText || displayError);

  const featuredCount = projects.filter((p) => p.featured).length;

  return (
    <main className="space-y-8 pb-10">
      {/* Kartu Header & Personalisasi (Tugas Mandiri #4) */}
      <section className="rounded-[28px] border border-[color:var(--line)] bg-[color:var(--paper)]/90 p-6 shadow-[0_16px_44px_rgba(23,24,22,0.06)] backdrop-blur-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-[color:var(--muted)]">
              Dashboard Admin &bull; Portofolio
            </p>
            <h1 className="m-0 text-3xl font-semibold tracking-[-0.05em] text-[color:var(--ink)] sm:text-4xl">
              Manajemen Proyek
            </h1>
            <p className="mt-2 text-sm text-[color:var(--muted)]">
              Selamat datang, <strong className="text-[color:var(--ink)]">{user.email}</strong>! Anda memiliki akses penuh untuk mengelola proyek portofolio.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/proyek"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--line)] bg-[color:var(--paper)] px-4 py-2 text-xs font-medium text-[color:var(--ink)] shadow-subtle transition hover:bg-[color:var(--paper-elevated)] hover:border-[color:var(--ink)] active:scale-[0.98]"
            >
              <span>Lihat Portofolio Publik</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>

        {/* Statistik Proyek */}
        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-[color:var(--line)] pt-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-[color:var(--line)] bg-transparent p-4">
            <p className="text-xs uppercase tracking-wider text-[color:var(--muted)]">Total Proyek</p>
            <p className="mt-1 text-2xl font-bold text-[color:var(--ink)]">{projects.length}</p>
          </div>
          <div className="rounded-2xl border border-[color:var(--line)] bg-transparent p-4">
            <p className="text-xs uppercase tracking-wider text-[color:var(--muted)]">Proyek Featured</p>
            <p className="mt-1 text-2xl font-bold text-[color:var(--ink)]">{featuredCount}</p>
          </div>
          <div className="col-span-2 rounded-2xl border border-[color:var(--line)] bg-transparent p-4 sm:col-span-1">
            <p className="text-xs uppercase tracking-wider text-[color:var(--muted)]">Status Auth</p>
            <p className="mt-1 text-sm font-semibold text-emerald-600">Authenticated (Admin)</p>
          </div>
        </div>
      </section>

      {/* Form Tambah Proyek Baru */}
      <section className="rounded-[28px] border border-[color:var(--line)] bg-[color:var(--paper)]/90 p-6 shadow-[0_16px_44px_rgba(23,24,22,0.06)] backdrop-blur-sm sm:p-8">
        <div className="mb-6">
          <h2 className="m-0 text-2xl font-semibold tracking-[-0.04em] text-[color:var(--ink)]">
            Tambah Proyek Baru
          </h2>
          <p className="mt-1 text-xs text-[color:var(--muted)]">
            Isi data proyek baru yang akan ditampilkan di portofolio Anda.
          </p>
        </div>

        <form action={createProjectAction} className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-2 text-sm font-medium text-[color:var(--ink)] md:col-span-1">
            <span>Judul Proyek *</span>
            <input
              type="text"
              name="title"
              required
              placeholder="Contoh: Website Profil Sekolah"
              className="w-full rounded-2xl border border-[color:var(--line)] bg-transparent px-4 py-3 text-base text-[color:var(--ink)] placeholder:text-[color:var(--muted)] focus:border-[color:var(--ink)] focus:outline-none"
            />
          </label>

          <label className="block space-y-2 text-sm font-medium text-[color:var(--ink)] md:col-span-1">
            <span>Teknologi (pisahkan dengan koma) *</span>
            <input
              type="text"
              name="technologies"
              required
              placeholder="Contoh: Next.js, TypeScript, Tailwind CSS"
              className="w-full rounded-2xl border border-[color:var(--line)] bg-transparent px-4 py-3 text-base text-[color:var(--ink)] placeholder:text-[color:var(--muted)] focus:border-[color:var(--ink)] focus:outline-none"
            />
          </label>

          <label className="block space-y-2 text-sm font-medium text-[color:var(--ink)] md:col-span-2">
            <span>Deskripsi Proyek *</span>
            <textarea
              name="description"
              required
              rows={3}
              placeholder="Deskripsi singkat mengenai proyek ini..."
              className="w-full rounded-2xl border border-[color:var(--line)] bg-transparent px-4 py-3 text-base text-[color:var(--ink)] placeholder:text-[color:var(--muted)] focus:border-[color:var(--ink)] focus:outline-none"
            />
          </label>

          <label className="block space-y-2 text-sm font-medium text-[color:var(--ink)] md:col-span-1">
            <span>Link Proyek / Live URL (opsional)</span>
            <input
              type="url"
              name="live_url"
              placeholder="https://example.com"
              className="w-full rounded-2xl border border-[color:var(--line)] bg-transparent px-4 py-3 text-base text-[color:var(--ink)] placeholder:text-[color:var(--muted)] focus:border-[color:var(--ink)] focus:outline-none"
            />
          </label>

          <label className="block space-y-2 text-sm font-medium text-[color:var(--ink)] md:col-span-1">
            <span>GitHub URL (opsional)</span>
            <input
              type="url"
              name="github_url"
              placeholder="https://github.com/username/repo"
              className="w-full rounded-2xl border border-[color:var(--line)] bg-transparent px-4 py-3 text-base text-[color:var(--ink)] placeholder:text-[color:var(--muted)] focus:border-[color:var(--ink)] focus:outline-none"
            />
          </label>

          <label className="block space-y-2 text-sm font-medium text-[color:var(--ink)] md:col-span-1">
            <span>Kategori (opsional)</span>
            <input
              type="text"
              name="category"
              placeholder="Web App (default)"
              className="w-full rounded-2xl border border-[color:var(--line)] bg-transparent px-4 py-3 text-base text-[color:var(--ink)] placeholder:text-[color:var(--muted)] focus:border-[color:var(--ink)] focus:outline-none"
            />
          </label>

          <label className="block space-y-2 text-sm font-medium text-[color:var(--ink)] md:col-span-1">
            <span>URL Gambar (opsional)</span>
            <input
              type="text"
              name="image_url"
              placeholder="/images/projects/web_berita.png atau https://..."
              className="w-full rounded-2xl border border-[color:var(--line)] bg-transparent px-4 py-3 text-base text-[color:var(--ink)] placeholder:text-[color:var(--muted)] focus:border-[color:var(--ink)] focus:outline-none"
            />
          </label>

          <label className="block space-y-2 text-sm font-medium text-[color:var(--ink)] md:col-span-2">
            <span>Upload File Gambar (opsional, jika Supabase Storage siap)</span>
            <input
              type="file"
              name="image"
              accept=".jpg,.jpeg,.png,.webp,.avif,image/jpeg,image/png,image/webp,image/avif"
              className="w-full rounded-2xl border border-[color:var(--line)] bg-transparent px-4 py-3 text-base text-[color:var(--ink)] file:mr-4 file:rounded-full file:border-0 file:bg-[color:var(--ink)] file:px-4 file:py-2 file:text-sm file:font-medium file:text-[color:var(--paper)] focus:border-[color:var(--ink)] focus:outline-none"
            />
          </label>

          <div className="flex items-center gap-3 rounded-2xl border border-[color:var(--line)] bg-transparent px-4 py-3 text-sm font-medium text-[color:var(--ink)] md:col-span-2">
            <input type="checkbox" id="featured" name="featured" className="h-4 w-4 accent-[color:var(--ink)]" />
            <label htmlFor="featured" className="cursor-pointer">Tandai sebagai Proyek Unggulan (Featured)</label>
          </div>

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
              Simpan Proyek Baru
            </button>
          </div>
        </form>
      </section>

      {/* Tabel Daftar Proyek */}
      <section className="rounded-[28px] border border-[color:var(--line)] bg-[color:var(--paper)]/90 p-6 shadow-[0_16px_44px_rgba(23,24,22,0.06)] backdrop-blur-sm sm:p-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="m-0 text-2xl font-semibold tracking-[-0.04em] text-[color:var(--ink)]">
            Daftar Proyek di Database
          </h2>
          <span className="text-xs text-[color:var(--muted)]">
            {projects.length} data tersimpan
          </span>
        </div>

        {projects.length === 0 ? (
          <p className="text-sm text-[color:var(--muted)]">Belum ada proyek yang ditambahkan.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[color:var(--line)] text-[color:var(--muted)]">
                  <th className="px-3 py-3 font-medium">No</th>
                  <th className="px-3 py-3 font-medium">Judul</th>
                  <th className="px-3 py-3 font-medium">Kategori</th>
                  <th className="px-3 py-3 font-medium">Teknologi</th>
                  <th className="px-3 py-3 font-medium">Featured</th>
                  <th className="px-3 py-3 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--line)]">
                {projects.map((project, idx) => (
                  <tr key={project.id ?? project.slug ?? idx} className="hover:bg-[color:var(--line)]/20 transition-colors">
                    <td className="px-3 py-3 text-[color:var(--muted)] font-mono text-xs">
                      {project.number || String(idx + 1).padStart(2, "0")}
                    </td>
                    <td className="px-3 py-3 font-medium text-[color:var(--ink)]">
                      {project.title}
                    </td>
                    <td className="px-3 py-3 text-[color:var(--muted)]">
                      {project.category}
                    </td>
                    <td className="px-3 py-3 text-[color:var(--muted)]">
                      {Array.isArray(project.technologies) ? project.technologies.join(", ") : "-"}
                    </td>
                    <td className="px-3 py-3">
                      {project.featured ? (
                        <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 text-[0.68rem] font-semibold text-emerald-700 dark:text-emerald-300">
                          Featured
                        </span>
                      ) : (
                        <span className="text-xs text-[color:var(--muted)]">-</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/proyek/edit/${project.id}`}
                          className="inline-flex items-center justify-center min-h-[30px] rounded-full border border-[color:var(--line)] bg-[color:var(--paper)] px-3.5 py-1 text-xs font-semibold text-[color:var(--ink)] shadow-xs hover:border-[color:var(--ink)] hover:bg-[color:var(--ink)] hover:text-[color:var(--paper)] transition-all active:scale-95"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/admin/proyek/hapus/${project.id}`}
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
