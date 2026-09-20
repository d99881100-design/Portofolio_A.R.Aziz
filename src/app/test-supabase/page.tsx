import { supabase } from "@/lib/supabase";

export default async function TestSupabasePage() {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("id", { ascending: true });

  return (
    <main className="min-h-screen p-8">
      <h1 className="mb-6 text-2xl font-bold">
        Test Supabase
      </h1>

      {error ? (
        <pre className="whitespace-pre-wrap rounded-lg bg-red-100 p-4 text-red-700">
          {error.message}
        </pre>
      ) : (
        <pre className="overflow-auto rounded-lg bg-gray-100 p-4">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </main>
  );
}