// Tipe metadata digunakan untuk memastikan konfigurasi SEO sesuai API Next.js.
import type { Metadata } from "next";
import { ThemeBootstrap } from "@/components/theme-bootstrap";
// Style global berlaku untuk seluruh halaman aplikasi.
import "./globals.css";

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
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeBootstrap />
        {children}
      </body>
    </html>
  );
}
