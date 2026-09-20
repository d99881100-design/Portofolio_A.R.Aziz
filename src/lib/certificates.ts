import { supabase } from "@/lib/supabase";

export interface CertificateItem {
  title: string;
  issuer: string;
  year: string;
  image: string;
  link?: string;
}

type CertificateRow = {
  id?: number;
  title?: string | null;
  issuer?: string | null;
  year?: string | null;
  image?: string | null;
  link?: string | null;
};

function mapCertificate(row: CertificateRow): CertificateItem {
  return {
    title: row.title ?? "",
    issuer: row.issuer ?? "",
    year: row.year ?? "",
    image: row.image ?? "",
    link: row.link ?? undefined,
  };
}

export async function getCertificates(): Promise<CertificateItem[]> {
  const { data, error } = await supabase
    .from("certificates")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch certificates from Supabase: ${error.message}`);
  }

  return (data ?? []).map((row) => mapCertificate(row as CertificateRow));
}
