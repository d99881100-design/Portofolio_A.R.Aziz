# Website Profil Siswa & Portfolio

Proyek ini adalah hasil dari rangkaian pembelajaran Kelas Industri "Next.js Dasar sampai Mahir" (Pertemuan 1 - 5). Website ini dibangun menggunakan Next.js (App Router), TypeScript, Tailwind CSS, dan Supabase.

## 🔗 Link Production
**[Lihat Website Live (Vercel)](https://www.a-roufun-aziz.my.id/)**

## 🚀 Daftar Fitur (Pertemuan 1 - 5)
1. **Pertemuan 1:** Pengenalan Dasar Next.js (App Router, Routing, Navigasi Link).
2. **Pertemuan 2:** Styling dengan Tailwind CSS, Komponen Reusable, Interaktivitas, dan Dynamic Routing.
3. **Pertemuan 3:** Integrasi Database Cloud menggunakan Supabase untuk menyimpan dan mengambil data proyek portofolio secara dinamis.
4. **Pertemuan 4:** Server Actions, Form Mutasi CRUD (Create, Read, Update, Delete) penuh, dan Proteksi Halaman Admin (Login/Logout).
5. **Pertemuan 5:** Optimasi SEO, Metadata (Statis & Dinamis), Open Graph Image, `robots.txt`, `sitemap.xml`, dan Optimasi Performa menggunakan `next/image`.

## 💻 Cara Menjalankan Project Secara Lokal

Ikuti langkah-langkah berikut untuk menjalankan website ini di komputer Anda:

1. **Pastikan Node.js sudah terinstal** di laptop/komputer Anda.
2. **Buka folder proyek** ini di terminal atau VS Code.
3. **Install dependencies** (pustaka yang dibutuhkan) dengan menjalankan perintah:
   ```bash
   npm install
   ```
4. **Siapkan Environment Variables**: 
   Pastikan Anda memiliki file `.env.local` (tidak di-upload ke GitHub) yang berisi kredensial Supabase Anda, seperti ini:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=URL_SUPABASE_ANDA
   NEXT_PUBLIC_SUPABASE_ANON_KEY=KUNCI_ANON_ANDA
   ```
5. **Jalankan server pengembangan (development server)**:
   ```bash
   npm run dev
   ```
6. Buka browser dan kunjungi `http://localhost:3000` untuk melihat hasilnya.

---
*Dibuat oleh Akhmad Roufun Aziz - Siswa Jurusan Rekayasa Perangkat Lunak (RPL)*
