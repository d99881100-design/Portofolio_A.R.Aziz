// Komponen navigasi dan seluruh section portfolio halaman utama.
import { Navbar } from "@/components/navbar";
import { About, Achievements, Certificates, Contact, Education, Experience, Footer, Hero, Projects, Skills, Stats } from "@/components/portfolio-sections";

// Menyusun semua bagian portfolio dalam urutan tampilan halaman.
export default function Home() {
  return <><Navbar /><main><Hero /><Stats /><About /><Skills /><Experience /><Projects /><Achievements /><Certificates /><Education /><Contact /></main><Footer /></>;
}
