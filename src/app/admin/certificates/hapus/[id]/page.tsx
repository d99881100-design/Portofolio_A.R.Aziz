import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";
import { deleteProjectImage } from "@/lib/images";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function deleteCertificateAction(formData: FormData) {
  "use server";

  const id = Number(formData.get("id"));

  if (!Number.isFinite(id) || id <= 0) {
    redirect("/admin/certificates");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: item } = await supabase
    .from("certificates")
    .select("image")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("certificates").delete().eq("id", id);

  if (error) {
    console.error("Failed to delete certificate:", error.message);
    redirect("/admin/certificates?error=" + encodeURIComponent("Gagal menghapus sertifikat: " + error.message));
  }

  if (item?.image && item.image.includes("supabase.co")) {
    try {
      await deleteProjectImage(supabase, item.image);
    } catch {
      // Abaikan
    }
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/certificates");
  redirect("/admin/certificates");
}

export default async function DeleteCertificatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const certId = Number(id);

  if (!Number.isFinite(certId) || certId <= 0) {
    redirect("/admin/certificates");
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
    .from("certificates")
    .select("*")
    .eq("id", certId)
    .single();

  if (error || !item) {
    redirect("/admin/certificates");
  }

  return (
    <main className="space-y-8 pb-10">
      <section className="mx-auto max-w-lg rounded-[28px] border border-red-500/20 bg-[color:var(--paper)]/95 p-6 shadow-[0_16px_44px_rgba(23,24,22,0.08)] backdrop-blur-sm sm:p-8">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-600 dark:text-red-400">
          <span>Peringatan</span>
        </div>

        <h1 className="m-0 text-2xl font-bold tracking-[-0.04em] text-[color:var(--ink)] sm:text-3xl">
          Konfirmasi Hapus Sertifikat
        </h1>

        <p className="mt-4 text-sm text-[color:var(--muted)] leading-relaxed">
          Apakah Anda yakin ingin menghapus sertifikat berikut dari portofolio?
        </p>

        <div className="my-6 rounded-2xl border border-[color:var(--line)] bg-[color:var(--paper)] p-4">
          <p className="text-xs uppercase tracking-wider text-[color:var(--muted)]">Judul Sertifikat</p>
          <p className="mt-1 text-lg font-bold text-[color:var(--ink)]">{item.title}</p>
          <p className="mt-2 text-xs text-[color:var(--muted)]">
            Penerbit: {item.issuer} &bull; Tahun: {item.year}
          </p>
        </div>

        <p className="text-xs text-red-600 dark:text-red-400 font-medium">
          Tindakan ini permanen dan data sertifikat akan dihapus dari Supabase.
        </p>

        <div className="mt-6 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">
          <Link
            href="/admin/certificates"
            className="button button-light w-full sm:w-auto"
            style={{ minWidth: "120px", padding: "10px 22px" }}
          >
            Batal
          </Link>

          <form action={deleteCertificateAction} className="w-full sm:w-auto">
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
