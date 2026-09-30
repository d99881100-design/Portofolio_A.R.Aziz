import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function deleteExperienceAction(formData: FormData) {
  "use server";

  const id = Number(formData.get("id"));

  if (!Number.isFinite(id) || id <= 0) {
    redirect("/admin/experience");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase.from("experience").delete().eq("id", id);

  if (error) {
    console.error("Failed to delete experience:", error.message);
    redirect("/admin/experience?error=" + encodeURIComponent("Gagal menghapus pengalaman: " + error.message));
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/experience");
  redirect("/admin/experience");
}

export default async function DeleteExperiencePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const expId = Number(id);

  if (!Number.isFinite(expId) || expId <= 0) {
    redirect("/admin/experience");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user || userError) {
    redirect("/login");
  }

  const { data: item, error } = await supabase
    .from("experience")
    .select("*")
    .eq("id", expId)
    .single();

  if (error || !item) {
    redirect("/admin/experience");
  }

  return (
    <main className="space-y-8 pb-10">
      <section className="mx-auto max-w-lg rounded-[28px] border border-red-500/20 bg-[color:var(--paper)]/95 p-6 shadow-[0_16px_44px_rgba(23,24,22,0.08)] backdrop-blur-sm sm:p-8">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-600 dark:text-red-400">
          <span>Peringatan</span>
        </div>

        <h1 className="m-0 text-2xl font-bold tracking-[-0.04em] text-[color:var(--ink)] sm:text-3xl">
          Konfirmasi Hapus Pengalaman
        </h1>

        <p className="mt-4 text-sm text-[color:var(--muted)] leading-relaxed">
          Apakah Anda yakin ingin menghapus data pengalaman ini dari portofolio?
        </p>

        <div className="my-6 rounded-2xl border border-[color:var(--line)] bg-[color:var(--paper)] p-4">
          <p className="text-xs uppercase tracking-wider text-[color:var(--muted)]">Posisi</p>
          <p className="mt-1 text-lg font-bold text-[color:var(--ink)]">{item.role}</p>
          <p className="mt-2 text-xs text-[color:var(--muted)]">
            Perusahaan: {item.company} &bull; Periode: {item.year}
          </p>
        </div>

        <p className="text-xs text-red-600 dark:text-red-400 font-medium">
          Tindakan ini permanen dan data pengalaman akan dihapus dari Supabase.
        </p>

        <div className="mt-6 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">
          <Link
            href="/admin/experience"
            className="button button-light w-full sm:w-auto"
            style={{ minWidth: "120px", padding: "10px 22px" }}
          >
            Batal
          </Link>

          <form action={deleteExperienceAction} className="w-full sm:w-auto">
            <input type="hidden" name="id" value={item.id} />
            <button
              type="submit"
              className="button button-danger w-full sm:w-auto"
              style={{ minWidth: "160px", padding: "10px 24px" }}
            >
              Ya, Hapus Data
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
