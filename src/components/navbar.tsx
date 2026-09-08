"use client";
// Ikon navigasi dan kontrol menu pada header.
import { ArrowUpRight, Menu, X } from "lucide-react";
// Hook React untuk memantau posisi scroll dan status menu mobile.
import { useEffect, useState } from "react";
// Data personal digunakan untuk membuat tautan resume.
import { personalInfo } from "@/data/portfolio";
// Kontrol untuk mengganti tema terang dan gelap.
import { ThemeToggle } from "./theme-toggle";

// Tautan anchor yang mengarah ke berbagai section pada halaman utama.
const links = [["About", "about"], ["Skills", "skills"], ["Work", "work"], ["Contact", "contact"]];

// Header utama yang berubah tampilan saat halaman di-scroll dan mendukung menu mobile.
export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => { const onScroll = () => setScrolled(window.scrollY > 30); window.addEventListener("scroll", onScroll); return () => window.removeEventListener("scroll", onScroll); }, []);
  return <header className={`site-nav ${scrolled ? "is-scrolled" : ""}`}><div className="nav-inner"><a className="brand" href="#top" aria-label="Back to top"><span className="brand-mark">AR</span><span>Akhmad Roufun Aziz</span></a><nav id="primary-navigation" className={open ? "nav-links open" : "nav-links"}>{links.map(([label, id]) => <a key={id} href={`#${id}`} onClick={() => setOpen(false)}>{label}</a>)}<a href={personalInfo.Download_CV} className="nav-cta" download="Akhmad-Roufun-Aziz-CV.pdf">Download CV <ArrowUpRight size={14} /></a></nav><div className="nav-actions"><ThemeToggle /><button className="menu-button" onClick={() => setOpen(!open)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="primary-navigation">{open ? <X /> : <Menu />}</button></div></div></header>;
}
