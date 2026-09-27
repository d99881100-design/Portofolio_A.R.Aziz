export const ALLOWED_IMAGE_HOSTNAMES = new Set([
  "thumb.wikimedia.org",
  "portofolio-a-r-aziz.vercel.app",
  "img.antarafoto.com",
  "images.unsplash.com",
  "images.pexels.com",
  "plus.unsplash.com",
  "source.unsplash.com",
  "encrypted-tbn0.gstatic.com",
  "images.gstatic.com",
]);

const ALLOWED_IMAGE_HOST_PATTERNS = ["**.gstatic.com", "**.googleusercontent.com", "**.supabase.co"];

function matchesAllowedHostPattern(hostname: string, pattern: string) {
  if (!pattern.startsWith("**.")) {
    return hostname === pattern;
  }

  const suffix = pattern.slice(1);
  return hostname.endsWith(suffix) && hostname !== suffix.slice(0, 1);
}

function isAllowedProjectImageHost(hostname: string) {
  const normalizedHostname = hostname.toLowerCase();

  if (ALLOWED_IMAGE_HOSTNAMES.has(normalizedHostname)) {
    return true;
  }

  return ALLOWED_IMAGE_HOST_PATTERNS.some((pattern) =>
    matchesAllowedHostPattern(normalizedHostname, pattern),
  );
}

export const PROJECT_IMAGE_BUCKET = "project-images";
export const MAX_PROJECT_IMAGE_SIZE_BYTES = 50 * 1024 * 1024;
export const ALLOWED_PROJECT_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);
const ALLOWED_IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "avif"]);

export function normalizeProjectImageUrl(value: FormDataEntryValue | null | undefined) {
  const raw = String(value ?? "").trim();

  if (!raw) {
    throw new Error("Image wajib diisi.");
  }

  if (raw.startsWith("/")) {
    return raw;
  }

  try {
    const url = new URL(raw);

    if (!["http:", "https:"].includes(url.protocol)) {
      throw new Error("Image URL harus menggunakan http atau https.");
    }

    const hostname = url.hostname.toLowerCase();

    if (!isAllowedProjectImageHost(hostname)) {
      throw new Error(
        "Image harus berupa path lokal seperti /images/... atau URL dari host yang sudah diizinkan.",
      );
    }

    return url.toString();
  } catch {
    throw new Error(
      "Image harus berupa path lokal seperti /images/... atau URL dari host yang sudah diizinkan.",
    );
  }
}

function sanitizeStorageFilename(fileName: string) {
  return fileName
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || `project-${Date.now()}`;
}

export function validateProjectImageFile(file: File) {
  if (!(file instanceof File)) {
    throw new Error("File gambar tidak valid.");
  }

  const mimeType = String(file.type || "").toLowerCase();
  const extension = String(file.name || "")
    .split(".")
    .pop()?.toLowerCase() ?? "";
  const isMimeValid = ALLOWED_PROJECT_IMAGE_TYPES.has(mimeType);
  const isExtensionValid = ALLOWED_IMAGE_EXTENSIONS.has(extension);

  if (!isMimeValid && !isExtensionValid) {
    throw new Error("Format file tidak didukung. Gunakan JPG, PNG, WebP, atau AVIF.");
  }

  if (file.size <= 0) {
    throw new Error("File gambar tidak boleh kosong.");
  }

  if (file.size > MAX_PROJECT_IMAGE_SIZE_BYTES) {
    throw new Error("Ukuran file terlalu besar. Maksimal 50MB.");
  }
}

function formatStorageErrorMessage(message?: string) {
  const normalized = String(message ?? "").toLowerCase();

  if (normalized.includes("bucket not found") || normalized.includes("not found") && normalized.includes("bucket")) {
    return "Bucket project-images belum dibuat di Supabase Dashboard. Buat bucket bernama project-images di Storage, lalu coba lagi.";
  }

  if (normalized.includes("row level security") || normalized.includes("rls")) {
    return "Storage policy belum diatur dengan benar. Pastikan policy untuk bucket project-images mengizinkan upload/update/delete untuk authenticated user.";
  }

  if (normalized.includes("new row violates row-level security")) {
    return "Upload ditolak oleh policy Storage. Pastikan policy bucket project-images sudah dibuat sesuai role authenticated.";
  }

  return message || "Upload gambar gagal. Silakan cek koneksi Supabase Storage dan bucket project-images.";
}

export async function uploadProjectImage(supabase: any, file: File) {
  validateProjectImageFile(file);

  const safeName = sanitizeStorageFilename(file.name || "project-image");
  const uniqueName = `${Date.now()}-${crypto.randomUUID()}-${safeName}`;
  const objectPath = `${uniqueName}`;

  const { data, error } = await supabase.storage
    .from(PROJECT_IMAGE_BUCKET)
    .upload(objectPath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (error || !data) {
    throw new Error(formatStorageErrorMessage(error?.message));
  }

  const { data: publicUrlData } = supabase.storage.from(PROJECT_IMAGE_BUCKET).getPublicUrl(objectPath);

  if (!publicUrlData?.publicUrl) {
    throw new Error("Gagal mendapatkan URL publik gambar.");
  }

  return {
    publicUrl: publicUrlData.publicUrl,
    storagePath: objectPath,
  };
}

export async function deleteProjectImage(supabase: any, imageUrl?: string | null) {
  if (!imageUrl) {
    return { ok: true, deleted: false };
  }

  try {
    const url = new URL(imageUrl);
    const pathname = decodeURIComponent(url.pathname);
    const bucketPrefix = "/storage/v1/object/public/project-images/";
    const index = pathname.indexOf(bucketPrefix);

    if (index === -1) {
      return { ok: true, deleted: false };
    }

    const storagePath = pathname.slice(index + bucketPrefix.length);

    if (!storagePath) {
      return { ok: true, deleted: false };
    }

    const { error } = await supabase.storage.from(PROJECT_IMAGE_BUCKET).remove([storagePath]);

    if (error) {
      console.error("Cleanup project image failed:", error.message);
      return { ok: false, deleted: false, message: error.message };
    }

    return { ok: true, deleted: true };
  } catch {
    return { ok: true, deleted: false };
  }
}
