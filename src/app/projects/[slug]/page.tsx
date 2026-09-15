// Komponen gambar dan link untuk halaman detail project.
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
// Data project menjadi sumber parameter route dan isi case study.
import { projects } from "@/data/portfolio";

// Menghasilkan semua slug project agar halaman detail dapat dibuat secara statis.
export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

// Mengambil project berdasarkan slug lalu menampilkan halaman detailnya.
export default async function ProjectDetail({
  params,
}: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);

  if (!project) {
    notFound();
  }

  return (
    <main className="detail-page wrap">
      <Link href="/" className="back-link">
        <ArrowLeft size={16} /> Back to portfolio
      </Link>
      <p className="eyebrow">Case study / {project.number}</p>
      <h1>{project.title}</h1>
      <p className="detail-intro">{project.description}</p>
      <div className="detail-image">
        <Image
          src={project.image}
          alt={`${project.title} project preview`}
          fill
          priority
          sizes="100vw"
        />
      </div>
      <div className="detail-copy">
        <div>
          <p className="project-category">{project.category}</p>
          <h2>
            Designed for focus.
            <br />
            <em>Built to be useful.</em>
          </h2>
        </div>
        <div>
          <p>
            This project explores how a clear visual system and careful
            interaction can turn an everyday workflow into something people
            enjoy returning to.
          </p>
          <div className="tag-row">
            {project.technologies.map((technology) => (
              <span key={technology}>{technology}</span>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
