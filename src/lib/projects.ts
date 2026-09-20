import { supabase } from "@/lib/supabase";

export interface Project {
  id?: number;
  slug: string;
  number: string;
  title: string;
  category: string;
  description: string;
  image: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  featured: boolean;
  color: string;
  created_at?: string;
}

type ProjectRow = {
  id: number;
  slug: string | null;
  number: string | null;
  title: string | null;
  category: string | null;
  description: string | null;
  image: string | null;
  technologies: string[] | null;
  github_url: string | null;
  live_url: string | null;
  featured: boolean | null;
  color: string | null;
  created_at: string | null;
};

function mapProject(row: ProjectRow): Project {
  return {
    id: row.id ?? undefined,
    slug: row.slug ?? "",
    number: row.number ?? "",
    title: row.title ?? "",
    category: row.category ?? "",
    description: row.description ?? "",
    image: row.image ?? "",
    technologies: Array.isArray(row.technologies) ? row.technologies : [],
    githubUrl: row.github_url ?? undefined,
    liveUrl: row.live_url ?? undefined,
    featured: Boolean(row.featured ?? false),
    color: row.color ?? "lime",
    created_at: row.created_at ?? undefined,
  };
}

export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch projects from Supabase: ${error.message}`);
  }

  return (data ?? []).map((row) => mapProject(row as ProjectRow));
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const normalizedSlug = slug.trim();

  if (!normalizedSlug) {
    return null;
  }

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .ilike("slug", normalizedSlug)
    .limit(1);

  if (error) {
    throw new Error(
      `Failed to fetch project by slug "${normalizedSlug}" from Supabase: ${error.message}`,
    );
  }

  const row = data?.[0];
  return row ? mapProject(row as ProjectRow) : null;
}
