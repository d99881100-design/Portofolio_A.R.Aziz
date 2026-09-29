import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";
import { deleteProjectImage } from "@/lib/images";
import { createSupabaseServerClient } from "@/lib/supabase-server";

async function deleteProjectAction(formData: FormData) {
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

  // Ambil gambar lama jika ada untuk dibersihkan
  const { data: project } = await supabase
    .from("projects")
    .select("image")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("projects").delete().eq("id", id);

  if (error) {
    console.error("Failed to delete project:", error.message);
    redirect("/admin/proyek?error=" + encodeURIComponent("Gagal menghapus proyek: " + error.message));
  }

  if (project?.image && project.image.includes("supabase.co")) {
    try {
      await deleteProjectImage(supabase, project.image);
    } catch {
      // Abaikan jika pembersihan storage gagal
    }
  }

  revalidatePath("/admin/proyek");
  revalidatePath("/projects");
  revalidatePath("/proyek");
  revalidatePath("/");
  redirect("/admin/proyek");
}

export default async function DeleteProjectPage({
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
      <section className="mx-auto max-w-lg rounded-[28px] border border-red-500/20 bg-[color:var(--paper)]/95 p-6 shadow-[0_16px_44px_rgba(23,24,22,0.08)] backdrop-blur-sm sm:p-8">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-600 dark:text-red-400">
          <span>Peringatan</span>
        </div>

        <h1 className="m-0 text-2xl font-bold tracking-[-0.04em] text-[color:var(--ink)] sm:text-3xl">
          Konfirmasi Hapus Proyek
        </h1>

        <p className="mt-4 text-sm text-[color:var(--muted)] leading-relaxed">
          Apakah Anda yakin ingin menghapus proyek berikut dari portofolio?
        </p>

        <div className="my-6 rounded-2xl border border-[color:var(--line)] bg-[color:var(--paper)] p-4">
          <p className="text-xs uppercase tracking-wider text-[color:var(--muted)]">Judul Proyek</p>
          <p className="mt-1 text-lg font-bold text-[color:var(--ink)]">{project.title}</p>
          <p className="mt-2 text-xs text-[color:var(--muted)]">
            Kategori: {project.category} &bull; No: {project.number}
          </p>
        </div>

        <p className="text-xs text-red-600 dark:text-red-400 font-medium">
          Tindakan ini permanen dan data proyek akan dihapus dari Supabase.
        </p>

        <div className="mt-6 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">
          <Link
            href="/admin/proyek"
            className="button button-light w-full sm:w-auto"
            style={{ minWidth: "120px", padding: "10px 22px" }}
          >
            Batal
          </Link>

          <form action={deleteProjectAction} className="w-full sm:w-auto">
            <input type="hidden" name="id" value={project.id} />
            <button
              type="submit"
              className="button button-danger w-full sm:w-auto"
              style={{ minWidth: "160px", padding: "10px 24px" }}
            >
              Ya, Hapus Proyek
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
