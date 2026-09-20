import { supabase } from "@/lib/supabase";

export interface EducationItem {
  year: string;
  school: string;
  major: string;
  description: string;
}

type EducationRow = {
  id?: number;
  year?: string | null;
  school?: string | null;
  major?: string | null;
  description?: string | null;
};

function mapEducation(row: EducationRow): EducationItem {
  return {
    year: row.year ?? "",
    school: row.school ?? "",
    major: row.major ?? "",
    description: row.description ?? "",
  };
}

export async function getEducation(): Promise<EducationItem[]> {
  const { data, error } = await supabase
    .from("education")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch education from Supabase: ${error.message}`);
  }

  return (data ?? []).map((row) => mapEducation(row as EducationRow));
}
