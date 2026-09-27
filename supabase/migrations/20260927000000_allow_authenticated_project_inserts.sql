create policy "Authenticated users can insert projects"
on public.projects
for insert
to authenticated
with check (true);
