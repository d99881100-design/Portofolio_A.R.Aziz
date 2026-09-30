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

function parseTools(value: FormDataEntryValue | null | undefined): string[] {
  const raw = String(value ?? "").trim();
  if (!raw) return [];
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

async function updateExperienceAction(formData: FormData) {
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

  let errorMessage: string | null = null;

  try {
    const role = getTrimmedString(formData.get("role"));
    if (!role) throw new Error("Posisi / Role wajib diisi.");

    const company = getTrimmedString(formData.get("company"));
    if (!company) throw new Error("Nama Perusahaan / Organisasi wajib diisi.");

    const year = getTrimmedString(formData.get("year"), "2024 — Present");
    const description = getTrimmedString(formData.get("description"));
    const tools = parseTools(formData.get("tools"));

    const { error } = await supabase
      .from("experience")
      .update({
        role,
        company,
        year,
        description,
        tools,
      })
      .eq("id", id);

    if (error) {
      console.error("Failed to update experience:", error);
      throw new Error(error.message || "Gagal memperbarui data pengalaman.");
    }

    revalidatePath("/", "layout");
    revalidatePath("/admin/experience");
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "Gagal mengupdate pengalaman.";
    console.error("Experience update error:", errorMessage);
  }

  if (errorMessage) {
    redirect(`/admin/experience?error=${encodeURIComponent(errorMessage)}`);
  }

  redirect("/admin/experience");
}

export default async function EditExperiencePage({
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
      <section className="rounded-[28px] border border-[color:var(--line)] bg-[color:var(--paper)]/90 p-6 shadow-[0_16px_44px_rgba(23,24,22,0.06)] backdrop-blur-sm sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-[color:var(--muted)]">
              Admin &bull; Update Pengalaman
            </p>
            <h1 className="m-0 text-3xl font-semibold tracking-[-0.05em] text-[color:var(--ink)] sm:text-4xl">
              Edit Pengalaman: {item.role}
            </h1>
          </div>
          <Link
            href="/admin/experience"
            className="rounded-full border border-[color:var(--line)] px-4 py-2 text-xs font-medium text-[color:var(--ink)] hover:bg-[color:var(--line)]/20 transition-colors"
          >
            &larr; Kembali
          </Link>
        </div>

        <form action={updateExperienceAction} className="grid gap-4 md:grid-cols-2">
          <input type="hidden" name="id" value={item.id} />

          <label className="block space-y-2 text-sm font-medium text-[color:var(--ink)] md:col-span-1">
            <span>Posisi / Role *</span>
            <input
              type="text"
              name="role"
              defaultValue={item.role ?? ""}
              required
              className="w-full rounded-2xl border border-[color:var(--line)] bg-transparent px-4 py-3 text-base text-[color:var(--ink)] focus:border-[color:var(--ink)] focus:outline-none"
            />
          </label>

          <label className="block space-y-2 text-sm font-medium text-[color:var(--ink)] md:col-span-1">
            <span>Perusahaan / Organisasi *</span>
            <input
              type="text"
              name="company"
              defaultValue={item.company ?? ""}
              required
              className="w-full rounded-2xl border border-[color:var(--line)] bg-transparent px-4 py-3 text-base text-[color:var(--ink)] focus:border-[color:var(--ink)] focus:outline-none"
            />
          </label>

          <label className="block space-y-2 text-sm font-medium text-[color:var(--ink)] md:col-span-1">
            <span>Periode / Tahun *</span>
            <input
              type="text"
              name="year"
              defaultValue={item.year ?? ""}
              required
              className="w-full rounded-2xl border border-[color:var(--line)] bg-transparent px-4 py-3 text-base text-[color:var(--ink)] focus:border-[color:var(--ink)] focus:outline-none"
            />
          </label>

          <label className="block space-y-2 text-sm font-medium text-[color:var(--ink)] md:col-span-1">
            <span>Tools / Teknologi (pisahkan koma)</span>
            <input
              type="text"
              name="tools"
              defaultValue={Array.isArray(item.tools) ? item.tools.join(", ") : ""}
              className="w-full rounded-2xl border border-[color:var(--line)] bg-transparent px-4 py-3 text-base text-[color:var(--ink)] focus:border-[color:var(--ink)] focus:outline-none"
            />
          </label>

          <label className="block space-y-2 text-sm font-medium text-[color:var(--ink)] md:col-span-2">
            <span>Deskripsi Tanggung Jawab / Pencapaian *</span>
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
              href="/admin/experience"
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
