-- ====================================================================
-- MODUL 04 KELAS INDUSTRI: RLS POLICIES FOR PROJECTS CRUD
-- Jalankan query ini di SQL Editor dashboard Supabase Anda.
-- ====================================================================

-- 1. Pastikan Row Level Security (RLS) diaktifkan pada tabel projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- 2. Policy SELECT: Mengizinkan siapa saja (publik / anon & authenticated) membaca data proyek
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'Allow public read'
  ) THEN
    CREATE POLICY "Allow public read"
    ON public.projects
    FOR SELECT
    TO public
    USING (true);
  END IF;
END $$;

-- 3. Policy INSERT: Hanya user yang sudah login (authenticated) yang boleh menambah proyek
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'Allow authenticated insert'
  ) THEN
    CREATE POLICY "Allow authenticated insert"
    ON public.projects
    FOR INSERT
    TO authenticated
    WITH CHECK (true);
  END IF;
END $$;

-- 4. Policy UPDATE: Hanya user yang sudah login (authenticated) yang boleh mengedit proyek
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'Allow authenticated update'
  ) THEN
    CREATE POLICY "Allow authenticated update"
    ON public.projects
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);
  END IF;
END $$;

-- 5. Policy DELETE: Hanya user yang sudah login (authenticated) yang boleh menghapus proyek
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'Allow authenticated delete'
  ) THEN
    CREATE POLICY "Allow authenticated delete"
    ON public.projects
    FOR DELETE
    TO authenticated
    USING (true);
  END IF;
END $$;
