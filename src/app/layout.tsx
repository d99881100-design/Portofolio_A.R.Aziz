// Tipe metadata digunakan untuk memastikan konfigurasi SEO sesuai API Next.js.
import type { Metadata } from "next";
// Font aplikasi dimuat melalui optimasi font bawaan Next.js.
import { Geist, Geist_Mono } from "next/font/google";
// Style global berlaku untuk seluruh halaman aplikasi.
import "./globals.css";

// Konfigurasi font sans-serif yang diteruskan sebagai CSS variable.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata dasar untuk judul halaman dan preview saat dibagikan.
export const metadata: Metadata = {
  title: "Akhmad Roufun Aziz | Software Developer",
  description: "Portfolio of Akhmad Roufun Aziz, an AI engineer and software developer from Pasuruan.",
  openGraph: { title: "Akhmad Roufun Aziz | Software Developer", description: "Digital products, thoughtful interfaces, and useful code." },
};

// Layout root yang menyediakan struktur html dan inisialisasi tema sebelum konten dirender.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col"><script dangerouslySetInnerHTML={{ __html: "try { document.documentElement.classList.toggle('dark', localStorage.getItem('theme') === 'dark'); } catch {}" }} />{children}</body>
    </html>
  );
}
