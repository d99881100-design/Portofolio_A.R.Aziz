import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowUpRight, Search } from "lucide-react";
import {
  filterProjects,
  normalizeProjectCategory,
  normalizeProjectSearch,
  validProjectCategories,
} from "@/data/portfolio";
import { getProjects } from "@/lib/projects";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category, q } = await searchParams;
  const selectedCategory = normalizeProjectCategory(category);
  const selectedQuery = normalizeProjectSearch(q);
  const activeCategory = validProjectCategories.includes(
    selectedCategory as (typeof validProjectCategories)[number],
  )
    ? selectedCategory
    : "all";

  const projects = await getProjects();
  const filteredProjects = filterProjects(projects, {
    category: activeCategory,
    q: selectedQuery,
  });

  return (
    <main className="section wrap projects-section" style={{ paddingTop: "120px", minHeight: "100vh" }}>
      <Link href="/" className="back-link">
        <ArrowLeft size={16} /> Back to portfolio
      </Link>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
          <p className="eyebrow" style={{ margin: 0 }}>Selected work</p>
          <span style={{ fontSize: "0.8rem", color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
            Total: {projects.length} Proyek
          </span>
        </div>
        <h1 style={{ margin: 0, fontSize: "clamp(2.4rem, 5vw, 4rem)", fontWeight: 800, letterSpacing: "-0.05em" }}>
          Project collection
        </h1>
        <p style={{ margin: 0, color: "var(--muted)", maxWidth: "540px", fontSize: "1rem", lineHeight: 1.6 }}>
          Kumpulan eksplorasi desain antarmuka, aplikasi web, dan eksperimen rekayasa perangkat lunak.
        </p>
      </div>

      <form
        method="get"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
          marginBottom: "2rem",
          alignItems: "center",
        }}
      >
        {activeCategory !== "all" ? (
          <input type="hidden" name="category" value={activeCategory} />
        ) : null}
        <div style={{ position: "relative", flex: "1 1 260px", maxWidth: "420px" }}>
          <input
            type="search"
            name="q"
            defaultValue={selectedQuery}
            placeholder="Cari project..."
            aria-label="Cari project"
            style={{
              width: "100%",
              borderRadius: "999px",
              border: "1px solid var(--line)",
              background: "var(--paper)",
              padding: "0.75rem 1.25rem 0.75rem 2.75rem",
              color: "var(--ink)",
              boxShadow: "var(--shadow-subtle)",
              outline: "none",
              fontFamily: "var(--font-sans)",
              fontSize: "0.9rem",
            }}
          />
          <Search
            size={16}
            style={{
              position: "absolute",
              left: "1.1rem",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--muted)",
              pointerEvents: "none",
            }}
          />
        </div>
        <button type="submit" className="button button-dark">
          Cari
        </button>
      </form>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "3rem" }}>
        {validProjectCategories.map((item) => {
          const label = item === "all" ? "All" : item.toUpperCase();
          const searchParamsString = selectedQuery ? `&q=${encodeURIComponent(selectedQuery)}` : "";
          const href =
            item === "all"
              ? selectedQuery
                ? `/projects?q=${encodeURIComponent(selectedQuery)}`
                : "/projects"
              : `/projects?category=${item}${searchParamsString}`;
          const isActive = activeCategory === item;

          return (
            <Link
              key={item}
              href={href}
              className={isActive ? "button button-dark" : "button button-light"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: "96px",
                padding: "10px 18px",
                fontSize: "0.8rem",
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.04em",
              }}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {filteredProjects.length === 0 ? (
        <div style={{ padding: "3rem 0", color: "var(--muted)", fontStyle: "italic" }}>
          Tidak ada project yang ditemukan.
        </div>
      ) : (
        <div className="project-grid">
          {filteredProjects.map((project) => (
            <article key={project.slug} className={`project-card ${project.featured ? "featured" : "supporting"} ${project.color}`}>
              <div className="project-image">
                <Image
                  src={project.image}
                  alt={`${project.title} project preview`}
                  fill
                  sizes="(max-width: 700px) 100vw, 50vw"
                  quality={75}
                  loading="lazy"
                  decoding="async"
                />
                <span className="project-number">{project.number}</span>
                <span className="project-image-label">
                  {project.featured ? "Featured case study" : "Selected experiment"}
                </span>
              </div>
              <div className="project-content">
                <div>
                  <p className="project-category">{project.category}</p>
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                </div>
                <div className="project-footer">
                  <div className="tag-row">
                    {project.technologies.map((tech) => (
                      <span key={tech}>{tech}</span>
                    ))}
                  </div>
                  <div className="project-actions">
                    <Link
                      href={`/projects/${project.slug}`}
                      className="circle-link"
                      aria-label={`View ${project.title} details`}
                    >
                      <ArrowUpRight size={18} />
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
