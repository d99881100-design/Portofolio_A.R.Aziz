// Tipe metadata digunakan untuk memastikan konfigurasi SEO sesuai API Next.js.
import type { Metadata } from "next";
import { Plus_Jakarta_Sans, DM_Mono, Newsreader } from "next/font/google";
import { ThemeBootstrap } from "@/components/theme-bootstrap";
// Style global berlaku untuk seluruh halaman aplikasi.
import "./globals.css";

const sansFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const monoFont = DM_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const serifFont = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

// Metadata dasar untuk judul halaman dan preview saat dibagikan.
export const metadata: Metadata = {
  metadataBase: new URL("https://www.a-roufun-aziz.my.id"),
  title: {
    default: "Akhmad Roufun Aziz - Website Profil & Portfolio",
    template: "%s | Akhmad Roufun Aziz",
  },
  description:
    "Portofolio siswa SMK Rekayasa Perangkat Lunak, dibangun dengan Next.js dan Supabase.",
  keywords: ["Portofolio aziz", "Akhmad Roufun Aziz", "Siswa RPL", "AI Engineer", "SMKN 1 Pasuruan", "Aziz", "Pasuruan", "Portfolio Website"],
  openGraph: {
    title: "Akhmad Roufun Aziz - Website Profil & Portfolio",
    description:
      "Portofolio siswa SMK Rekayasa Perangkat Lunak, dibangun dengan Next.js dan Supabase.",
    type: "website",
  },
};

// Layout root yang menyediakan struktur html dan inisialisasi tema sebelum konten dirender.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${sansFont.variable} ${monoFont.variable} ${serifFont.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans">
        <ThemeBootstrap />
        {children}
      </body>
    </html>
  );
}
