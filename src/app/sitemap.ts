import { MetadataRoute } from 'next';
import { getProjects } from '@/lib/projects';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE_URL = 'https://portofolio-a-r-aziz.vercel.app';
  
  // Mengambil data proyek dari Supabase melalui fungsi getProjects
  const daftarProyek = await getProjects();

  const halamanProyek = (daftarProyek ?? []).map((item) => ({
    url: `${BASE_URL}/projects/${item.slug}`,
    lastModified: item.created_at ? new Date(item.created_at) : new Date(),
  }));

  return [
    { url: BASE_URL, lastModified: new Date() },
    // Menambahkan halaman daftar proyek jika diperlukan
    { url: `${BASE_URL}/projects`, lastModified: new Date() },
    // Menggabungkan halaman detail proyek secara otomatis
    ...halamanProyek,
  ];
}
