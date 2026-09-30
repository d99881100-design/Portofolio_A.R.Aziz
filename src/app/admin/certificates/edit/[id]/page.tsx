import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deleteProjectImage, uploadProjectImage } from "@/lib/images";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getTrimmedString(value: FormDataEntryValue | null | undefined, defaultValue = ""): string {
  const text = String(value ?? "").trim();
  return text || defaultValue;
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

async function updateCertificateAction(formData: FormData) {
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

  let currentImageUrl: string | null = null;
  let newImageUrl: string | null = null;
  let errorMessage: string | null = null;

  try {
    const title = getTrimmedString(formData.get("title"));
    if (!title) throw new Error("Nama sertifikat wajib diisi.");

    const issuer = getTrimmedString(formData.get("issuer"));
    if (!issuer) throw new Error("Penerbit wajib diisi.");

    const year = getTrimmedString(formData.get("year"), "2024");
    const link = normalizeOptionalUrl(formData.get("link"));

    const existingCert = await supabase
      .from("certificates")
      .select("image")
      .eq("id", id)
      .single();
    currentImageUrl = existingCert.data?.image ?? null;

    const explicitImageUrl = getTrimmedString(formData.get("image_url"));
    const imageFile = formData.get("image");

    if (imageFile instanceof File && imageFile.size > 0) {
      try {
        const uploadResult = await uploadProjectImage(supabase, imageFile);
        newImageUrl = uploadResult.publicUrl;
      } catch (uploadError) {
        console.warn("Upload gambar baru gagal:", uploadError);
        newImageUrl = explicitImageUrl || currentImageUrl || "/images/certificates/sertifikat-1.png";
      }
    } else if (explicitImageUrl) {
      newImageUrl = explicitImageUrl;
    } else {
      newImageUrl = currentImageUrl || "/images/certificates/sertifikat-1.png";
    }

    const { error } = await supabase
      .from("certificates")
      .update({
        title,
        issuer,
        year,
        image: newImageUrl || currentImageUrl || "/images/certificates/sertifikat-1.png",
        link,
      })
      .eq("id", id);

    if (error) {
      console.error("Failed to update certificate:", error);
      throw new Error(error.message || "Gagal memperbarui sertifikat.");
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

    revalidatePath("/", "layout");
    revalidatePath("/admin/certificates");
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "Gagal mengupdate sertifikat.";
    console.error("Certificate update error:", errorMessage);
  }

  if (errorMessage) {
    redirect(`/admin/certificates?error=${encodeURIComponent(errorMessage)}`);
  }

  redirect("/admin/certificates");
}

export default async function EditCertificatePage({
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
      <section className="rounded-[28px] border border-[color:var(--line)] bg-[color:var(--paper)]/90 p-6 shadow-[0_16px_44px_rgba(23,24,22,0.06)] backdrop-blur-sm sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-[color:var(--muted)]">
              Admin &bull; Update Sertifikat
            </p>
            <h1 className="m-0 text-3xl font-semibold tracking-[-0.05em] text-[color:var(--ink)] sm:text-4xl">
              Edit Sertifikat: {item.title}
            </h1>
          </div>
          <Link
            href="/admin/certificates"
            className="rounded-full border border-[color:var(--line)] px-4 py-2 text-xs font-medium text-[color:var(--ink)] hover:bg-[color:var(--line)]/20 transition-colors"
          >
            &larr; Kembali
          </Link>
        </div>

        <form action={updateCertificateAction} className="grid gap-4 md:grid-cols-2">
          <input type="hidden" name="id" value={item.id} />

          <label className="block space-y-2 text-sm font-medium text-[color:var(--ink)] md:col-span-1">
            <span>Nama / Judul Sertifikat *</span>
            <input
              type="text"
              name="title"
              defaultValue={item.title ?? ""}
              required
              className="w-full rounded-2xl border border-[color:var(--line)] bg-transparent px-4 py-3 text-base text-[color:var(--ink)] focus:border-[color:var(--ink)] focus:outline-none"
            />
          </label>

          <label className="block space-y-2 text-sm font-medium text-[color:var(--ink)] md:col-span-1">
            <span>Penerbit / Organisasi *</span>
            <input
              type="text"
              name="issuer"
              defaultValue={item.issuer ?? ""}
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
            <span>Link Verifikasi / Kredensial (opsional)</span>
            <input
              type="url"
              name="link"
              defaultValue={item.link ?? ""}
              placeholder="https://..."
              className="w-full rounded-2xl border border-[color:var(--line)] bg-transparent px-4 py-3 text-base text-[color:var(--ink)] focus:border-[color:var(--ink)] focus:outline-none"
            />
          </label>

          <label className="block space-y-2 text-sm font-medium text-[color:var(--ink)] md:col-span-1">
            <span>URL Gambar Sertifikat Saat Ini / Baru</span>
            <input
              type="text"
              name="image_url"
              defaultValue={item.image ?? ""}
              placeholder="/images/certificates/sertifikat-1.png"
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

          <div className="md:col-span-2 flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
            <Link
              href="/admin/certificates"
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
