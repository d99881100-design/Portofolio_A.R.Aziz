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

async function updateAchievementAction(formData: FormData) {
  "use server";

  const id = Number(formData.get("id"));
  if (!Number.isFinite(id) || id <= 0) {
    redirect("/admin/achievements");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let errorMessage: string | null = null;

  try {
    const title = getTrimmedString(formData.get("title"));
    if (!title) throw new Error("Judul prestasi wajib diisi.");

    const year = getTrimmedString(formData.get("year"), "2024");
    const level = getTrimmedString(formData.get("level"), "Nasional");
    const description = getTrimmedString(formData.get("description"));

    const { error } = await supabase
      .from("achievements")
      .update({
        title,
        year,
        level,
        description,
      })
      .eq("id", id);

    if (error) {
      console.error("Failed to update achievement:", error);
      throw new Error(error.message || "Gagal memperbarui data prestasi.");
    }

    revalidatePath("/", "layout");
    revalidatePath("/admin/achievements");
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "Gagal mengupdate prestasi.";
    console.error("Achievement update error:", errorMessage);
  }

  if (errorMessage) {
    redirect(`/admin/achievements?error=${encodeURIComponent(errorMessage)}`);
  }

  redirect("/admin/achievements");
}

export default async function EditAchievementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const achId = Number(id);

  if (!Number.isFinite(achId) || achId <= 0) {
    redirect("/admin/achievements");
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
    .from("achievements")
    .select("*")
    .eq("id", achId)
    .single();

  if (error || !item) {
    redirect("/admin/achievements");
  }

  return (
    <main className="space-y-8 pb-10">
      <section className="rounded-[28px] border border-[color:var(--line)] bg-[color:var(--paper)]/90 p-6 shadow-[0_16px_44px_rgba(23,24,22,0.06)] backdrop-blur-sm sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-[color:var(--muted)]">
              Admin &bull; Update Prestasi
            </p>
            <h1 className="m-0 text-3xl font-semibold tracking-[-0.05em] text-[color:var(--ink)] sm:text-4xl">
              Edit Prestasi: {item.title}
            </h1>
          </div>
          <Link
            href="/admin/achievements"
            className="rounded-full border border-[color:var(--line)] px-4 py-2 text-xs font-medium text-[color:var(--ink)] hover:bg-[color:var(--line)]/20 transition-colors"
          >
            &larr; Kembali
          </Link>
        </div>

        <form action={updateAchievementAction} className="grid gap-4 md:grid-cols-2">
          <input type="hidden" name="id" value={item.id} />

          <label className="block space-y-2 text-sm font-medium text-[color:var(--ink)] md:col-span-2">
            <span>Nama / Judul Prestasi *</span>
            <input
              type="text"
              name="title"
              defaultValue={item.title ?? ""}
              required
              className="w-full rounded-2xl border border-[color:var(--line)] bg-transparent px-4 py-3 text-base text-[color:var(--ink)] focus:border-[color:var(--ink)] focus:outline-none"
            />
          </label>

          <label className="block space-y-2 text-sm font-medium text-[color:var(--ink)] md:col-span-1">
            <span>Tahun *</span>
            <input
              type="text"
              name="year"
              defaultValue={item.year ?? ""}
              required
              className="w-full rounded-2xl border border-[color:var(--line)] bg-transparent px-4 py-3 text-base text-[color:var(--ink)] focus:border-[color:var(--ink)] focus:outline-none"
            />
          </label>

          <label className="block space-y-2 text-sm font-medium text-[color:var(--ink)] md:col-span-1">
            <span>Tingkat / Level *</span>
            <input
              type="text"
              name="level"
              defaultValue={item.level ?? ""}
              required
              className="w-full rounded-2xl border border-[color:var(--line)] bg-transparent px-4 py-3 text-base text-[color:var(--ink)] focus:border-[color:var(--ink)] focus:outline-none"
            />
          </label>

          <label className="block space-y-2 text-sm font-medium text-[color:var(--ink)] md:col-span-2">
            <span>Deskripsi / Keterangan Singkat *</span>
            <textarea
              name="description"
              defaultValue={item.description ?? ""}
              required
              rows={4}
              className="w-full rounded-2xl border border-[color:var(--line)] bg-transparent px-4 py-3 text-base text-[color:var(--ink)] focus:border-[color:var(--ink)] focus:outline-none"
            />
          </label>

          <div className="md:col-span-2 flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
            <Link
              href="/admin/achievements"
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
