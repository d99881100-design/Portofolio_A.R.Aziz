import { supabase } from "@/lib/supabase";

export interface AchievementItem {
  title: string;
  year: string;
  level: string;
  description: string;
}

type AchievementRow = {
  id?: number;
  title?: string | null;
  year?: string | null;
  level?: string | null;
  description?: string | null;
};

function mapAchievement(row: AchievementRow): AchievementItem {
  return {
    title: row.title ?? "",
    year: row.year ?? "",
    level: row.level ?? "",
    description: row.description ?? "",
  };
}

export async function getAchievements(): Promise<AchievementItem[]> {
  const { data, error } = await supabase
    .from("achievements")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch achievements from Supabase: ${error.message}`);
  }

  return (data ?? []).map((row) => mapAchievement(row as AchievementRow));
}
