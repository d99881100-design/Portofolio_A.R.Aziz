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

async function updateProjectAction(formData: FormData) {
  "use server";

  const id = Number(formData.get("id"));

  if (!Number.isFinite(id) || id <= 0) {
    redirect("/admin/proyek");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let currentImageUrl: string | null = null;
  let newImageUrl: string | null = null;
  let errorMessage: string | null = null;

  try {
    const title = getTrimmedString(formData.get("title") || formData.get("judul"));
    if (!title) {
      throw new Error("Judul proyek wajib diisi.");
    }

    const rawSlug = getTrimmedString(formData.get("slug"));
    const slug = rawSlug ? slugify(rawSlug) : slugify(title);
    const number = getTrimmedString(formData.get("number"), "01");
    const category = getTrimmedString(formData.get("category"), "Web Application");
    const description = getTrimmedString(formData.get("description"), title);
    const color = getTrimmedString(formData.get("color"), "lime");
    const technologies = parseTechnologies(formData.get("technologies"));
    const githubUrl = normalizeOptionalUrl(formData.get("github_url"));
    const liveUrl = normalizeOptionalUrl(formData.get("live_url"));
    const featured =
      formData.get("featured") === "on" ||
      formData.get("featured") === "true" ||
      formData.get("featured") === "1";

    const existingProject = await supabase
      .from("projects")
      .select("image")
      .eq("id", id)
      .single();
    currentImageUrl = existingProject.data?.image ?? null;

    const explicitImageUrl = getTrimmedString(formData.get("image_url"));
    const imageFile = formData.get("image");

    if (imageFile instanceof File && imageFile.size > 0) {
      try {
        const uploadResult = await uploadProjectImage(supabase, imageFile);
        newImageUrl = uploadResult.publicUrl;
      } catch (uploadError) {
        console.warn("Upload gambar baru gagal:", uploadError);
        newImageUrl = explicitImageUrl || currentImageUrl || "/images/projects/web_berita.png";
      }
    } else if (explicitImageUrl) {
      newImageUrl = explicitImageUrl;
    } else {
      newImageUrl = currentImageUrl || "/images/projects/web_berita.png";
    }

    const { error: updateError } = await supabase
      .from("projects")
      .update({
        slug,
        number,
        title,
        category,
        description,
        image: newImageUrl || currentImageUrl || "/images/projects/web_berita.png",
        technologies,
        github_url: githubUrl,
        live_url: liveUrl,
        featured,
        color,
      })
      .eq("id", id);

    if (updateError) {
      console.error("Failed to update project:", updateError);
      throw new Error(updateError.message || "Gagal mengupdate proyek.");
    }

    if (
      newImageUrl &&
      newImageUrl !== currentImageUrl &&
      currentImageUrl &&
      currentImageUrl.includes("supabase.co")
    ) {
      try {
        await deleteProjectImage(supabase, currentImageUrl);
      } catch {
        // Abaikan
      }
    }

    revalidatePath("/admin/proyek");
    revalidatePath("/projects");
    revalidatePath("/proyek");
    revalidatePath("/");
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "Gagal mengubah proyek.";
    console.error("Project update failed:", errorMessage);
  }

  if (errorMessage) {
    redirect(`/admin/proyek?error=${encodeURIComponent(errorMessage)}`);
  }

  redirect("/admin/proyek");
}

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const projectId = Number(id);

  if (!Number.isFinite(projectId) || projectId <= 0) {
    redirect("/admin/proyek");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user || userError) {
    redirect("/login");
  }

  const { data: project, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (error || !project) {
    redirect("/admin/proyek");
  }

  return (
    <main className="space-y-8 pb-10">
      <section className="rounded-[28px] border border-[color:var(--line)] bg-[color:var(--paper)]/90 p-6 shadow-[0_16px_44px_rgba(23,24,22,0.06)] backdrop-blur-sm sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-[color:var(--muted)]">
              Admin &bull; Update Proyek
            </p>
            <h1 className="m-0 text-3xl font-semibold tracking-[-0.05em] text-[color:var(--ink)] sm:text-4xl">
              Edit Proyek: {project.title}
            </h1>
          </div>
          <Link
            href="/admin/proyek"
            className="rounded-full border border-[color:var(--line)] px-4 py-2 text-xs font-medium text-[color:var(--ink)] hover:bg-[color:var(--line)]/20 transition-colors"
          >
            &larr; Kembali
          </Link>
        </div>

        <form action={updateProjectAction} className="grid gap-4 md:grid-cols-2">
          <input type="hidden" name="id" value={project.id} />

          <label className="block space-y-2 text-sm font-medium text-[color:var(--ink)] md:col-span-1">
            <span>Judul Proyek *</span>
            <input
              type="text"
              name="title"
              defaultValue={project.title}
              required
              className="w-full rounded-2xl border border-[color:var(--line)] bg-transparent px-4 py-3 text-base text-[color:var(--ink)] focus:border-[color:var(--ink)] focus:outline-none"
            />
          </label>

          <label className="block space-y-2 text-sm font-medium text-[color:var(--ink)] md:col-span-1">
            <span>Teknologi (pisahkan koma) *</span>
            <input
              type="text"
              name="technologies"
              defaultValue={Array.isArray(project.technologies) ? project.technologies.join(", ") : ""}
              required
              className="w-full rounded-2xl border border-[color:var(--line)] bg-transparent px-4 py-3 text-base text-[color:var(--ink)] focus:border-[color:var(--ink)] focus:outline-none"
            />
          </label>

          <label className="block space-y-2 text-sm font-medium text-[color:var(--ink)] md:col-span-2">
            <span>Deskripsi Proyek *</span>
            <textarea
              name="description"
              defaultValue={project.description}
              rows={4}
              required
              className="w-full rounded-2xl border border-[color:var(--line)] bg-transparent px-4 py-3 text-base text-[color:var(--ink)] focus:border-[color:var(--ink)] focus:outline-none"
            />
          </label>

          <label className="block space-y-2 text-sm font-medium text-[color:var(--ink)] md:col-span-1">
            <span>Link Proyek / Live URL</span>
            <input
              type="url"
              name="live_url"
              defaultValue={project.live_url ?? ""}
              placeholder="https://example.com"
              className="w-full rounded-2xl border border-[color:var(--line)] bg-transparent px-4 py-3 text-base text-[color:var(--ink)] focus:border-[color:var(--ink)] focus:outline-none"
            />
          </label>

          <label className="block space-y-2 text-sm font-medium text-[color:var(--ink)] md:col-span-1">
            <span>GitHub URL</span>
            <input
              type="url"
              name="github_url"
              defaultValue={project.github_url ?? ""}
              placeholder="https://github.com/username/repo"
              className="w-full rounded-2xl border border-[color:var(--line)] bg-transparent px-4 py-3 text-base text-[color:var(--ink)] focus:border-[color:var(--ink)] focus:outline-none"
            />
          </label>

          <label className="block space-y-2 text-sm font-medium text-[color:var(--ink)] md:col-span-1">
            <span>Kategori</span>
            <input
              type="text"
              name="category"
              defaultValue={project.category}
              className="w-full rounded-2xl border border-[color:var(--line)] bg-transparent px-4 py-3 text-base text-[color:var(--ink)] focus:border-[color:var(--ink)] focus:outline-none"
            />
          </label>

          <label className="block space-y-2 text-sm font-medium text-[color:var(--ink)] md:col-span-1">
            <span>Slug (URL Friendly)</span>
            <input
              type="text"
              name="slug"
              defaultValue={project.slug}
              className="w-full rounded-2xl border border-[color:var(--line)] bg-transparent px-4 py-3 text-base text-[color:var(--ink)] focus:border-[color:var(--ink)] focus:outline-none"
            />
          </label>

          <label className="block space-y-2 text-sm font-medium text-[color:var(--ink)] md:col-span-1">
            <span>Nomor Urut</span>
            <input
              type="text"
              name="number"
              defaultValue={project.number}
              className="w-full rounded-2xl border border-[color:var(--line)] bg-transparent px-4 py-3 text-base text-[color:var(--ink)] focus:border-[color:var(--ink)] focus:outline-none"
            />
          </label>

          <label className="block space-y-2 text-sm font-medium text-[color:var(--ink)] md:col-span-1">
            <span>Warna Aksen</span>
            <input
              type="text"
              name="color"
              defaultValue={project.color}
              className="w-full rounded-2xl border border-[color:var(--line)] bg-transparent px-4 py-3 text-base text-[color:var(--ink)] focus:border-[color:var(--ink)] focus:outline-none"
            />
          </label>

          <label className="block space-y-2 text-sm font-medium text-[color:var(--ink)] md:col-span-1">
            <span>URL Gambar Saat Ini / Baru</span>
            <input
              type="text"
              name="image_url"
              defaultValue={project.image ?? ""}
              placeholder="/images/projects/web_berita.png"
              className="w-full rounded-2xl border border-[color:var(--line)] bg-transparent px-4 py-3 text-base text-[color:var(--ink)] focus:border-[color:var(--ink)] focus:outline-none"
            />
          </label>

          <label className="block space-y-2 text-sm font-medium text-[color:var(--ink)] md:col-span-1">
            <span>Ganti Gambar via Upload File</span>
            <input
              type="file"
              name="image"
              accept=".jpg,.jpeg,.png,.webp,.avif,image/jpeg,image/png,image/webp,image/avif"
              className="w-full rounded-2xl border border-[color:var(--line)] bg-transparent px-4 py-3 text-base text-[color:var(--ink)] file:mr-4 file:rounded-full file:border-0 file:bg-[color:var(--ink)] file:px-4 file:py-2 file:text-sm file:font-medium file:text-[color:var(--paper)] focus:border-[color:var(--ink)] focus:outline-none"
            />
          </label>

          <div className="flex items-center gap-3 rounded-2xl border border-[color:var(--line)] bg-transparent px-4 py-3 text-sm font-medium text-[color:var(--ink)] md:col-span-2">
            <input
              type="checkbox"
              id="edit-featured"
              name="featured"
              defaultChecked={Boolean(project.featured)}
              className="h-4 w-4 accent-[color:var(--ink)]"
            />
            <label htmlFor="edit-featured" className="cursor-pointer">Tandai sebagai Proyek Unggulan (Featured)</label>
          </div>

          <div className="md:col-span-2 flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
            <Link
              href="/admin/proyek"
              className="button button-light w-full sm:w-auto"
              style={{ minWidth: "120px", padding: "12px 24px" }}
            >
              Batal
            </Link>
            <button
              type="submit"
              className="button button-dark w-full sm:w-auto"
              style={{ minWidth: "180px", padding: "12px 28px" }}
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
