import Link from "next/link";
import Image from "next/image";
import {
  filterProjects,
  normalizeProjectCategory,
  normalizeProjectSearch,
  projects,
  validProjectCategories,
} from "@/data/portfolio";

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

  const filteredProjects = filterProjects(projects, {
    category: activeCategory,
    q: selectedQuery,
  });

  return (
    <main className="section wrap projects-section" style={{ paddingTop: "6rem" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
        <p className="eyebrow">Selected work</p>
        <h1 style={{ margin: 0, fontSize: "clamp(2rem, 4vw, 3rem)" }}>Project collection</h1>
      </div>

      <form
        method="get"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: ".75rem",
          marginBottom: "1.5rem",
          alignItems: "center",
        }}
      >
        {activeCategory !== "all" ? (
          <input type="hidden" name="category" value={activeCategory} />
        ) : null}
        <input
          type="search"
          name="q"
          defaultValue={selectedQuery}
          placeholder="Cari project..."
          aria-label="Cari project"
          style={{
            minWidth: "220px",
            flex: "1 1 220px",
            maxWidth: "360px",
            borderRadius: "999px",
            border: "1px solid rgba(148, 163, 184, 0.6)",
            background: "rgba(15, 23, 42, 0.02)",
            padding: "0.8rem 1rem",
            color: "inherit",
          }}
        />
        <button type="submit" className="button button-dark">
          Cari
        </button>
      </form>

      <div style={{ display: "flex", flexWrap: "wrap", gap: ".75rem", marginBottom: "2rem" }}>
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
              }}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {filteredProjects.length === 0 ? (
        <div style={{ padding: "2rem 0", color: "inherit" }}>Tidak ada project yang ditemukan.</div>
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
                  <p className="project-detail-line">
                    A focused build exploring product clarity, useful motion, and a durable visual system.
                  </p>
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
                      ↗
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
