// Komponen navigasi dan seluruh section portfolio halaman utama.
import { Navbar } from "@/components/navbar";
import {
  About,
  Achievements,
  Certificates,
  Contact,
  Education,
  Experience,
  Footer,
  Hero,
  Projects,
  Skills,
  Stats,
} from "@/components/portfolio-sections";
import { getAchievements } from "@/lib/achievements";
import { getCertificates } from "@/lib/certificates";
import { getEducation } from "@/lib/education";
import { getExperience } from "@/lib/experience";
import { getProjects } from "@/lib/projects";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Menyusun semua section portfolio agar halaman utama terbaca seperti satu landing page yang lengkap.
export default async function Home() {
  const initialProjects = await getProjects();
  const initialExperience = await getExperience();
  const initialAchievements = await getAchievements();
  const initialCertificates = await getCertificates();
  const initialEducation = await getEducation();

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <About />
        <Skills />
        <Experience initialExperience={initialExperience} />
        <Projects initialProjects={initialProjects} />
        <Achievements initialAchievements={initialAchievements} />
        <Certificates initialCertificates={initialCertificates} />
        <Education initialEducation={initialEducation} />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
