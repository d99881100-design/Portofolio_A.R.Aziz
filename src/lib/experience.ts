import { supabase } from "@/lib/supabase";

export interface ExperienceItem {
  year: string;
  role: string;
  company: string;
  description: string;
  tools: string[];
}

type ExperienceRow = {
  id?: number;
  year?: string | null;
  role?: string | null;
  company?: string | null;
  description?: string | null;
  tools?: string[] | null;
};

function mapExperience(row: ExperienceRow): ExperienceItem {
  return {
    year: row.year ?? "",
    role: row.role ?? "",
    company: row.company ?? "",
    description: row.description ?? "",
    tools: Array.isArray(row.tools) ? row.tools : [],
  };
}

export async function getExperience(): Promise<ExperienceItem[]> {
  const { data, error } = await supabase
    .from("experience")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch experience from Supabase: ${error.message}`);
  }

  return (data ?? []).map((row) => mapExperience(row as ExperienceRow));
}
