"use client";
// Ikon visual untuk menunjukkan tema yang sedang tersedia.
import { Moon, Sun } from "lucide-react";
// Hook untuk membaca tema awal dan memperbarui state tombol.
import { useEffect, useState } from "react";

// Tombol untuk mengaktifkan atau menonaktifkan class tema gelap pada dokumen.
export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  // Menyamakan state React dengan class tema yang sudah dipasang pada elemen html.
  useEffect(() => setDark(document.documentElement.classList.contains("dark")), []);
  // Mengganti class tema, menyimpan pilihan pengguna, dan memperbarui ikon tombol.
  function toggleTheme() {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    setDark(next);
  }
  // Ikon dan label tombol mengikuti tema yang sedang aktif.
  return <button className="icon-button" onClick={toggleTheme} aria-label={dark ? "Use light theme" : "Use dark theme"} title={dark ? "Use light theme" : "Use dark theme"}>{dark ? <Sun size={17} /> : <Moon size={17} />}</button>;
}
