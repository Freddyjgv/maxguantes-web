-- SEGURIDAD DEL CATÁLOGO EXISTENTE DE MAXGUANTES
-- Ejecutar una sola vez en Supabase > SQL Editor.
-- Conserva la lectura pública requerida por la web y bloquea escritura anónima.

alter table public.catalogo enable row level security;
alter table public.catalogo_categorias enable row level security;

-- Políticas de escritura pública detectadas el 2026-09-04.
drop policy if exists "Allow public delete catalogo" on public.catalogo;
drop policy if exists "Allow public insert catalogo" on public.catalogo;
drop policy if exists "Allow public update catalogo" on public.catalogo;
drop policy if exists "Permitir borrado de productos" on public.catalogo;
drop policy if exists "Permitir edicion de productos" on public.catalogo;
drop policy if exists "Permitir insercion de productos" on public.catalogo;

drop policy if exists "Allow public delete catalogo_categorias" on public.catalogo_categorias;
drop policy if exists "Allow public insert catalogo_categorias" on public.catalogo_categorias;
drop policy if exists "Allow public update catalogo_categorias" on public.catalogo_categorias;

-- Evita escritura incluso si queda alguna política permisiva por error.
revoke insert, update, delete on table public.catalogo from anon, authenticated;
revoke insert, update, delete on table public.catalogo_categorias from anon, authenticated;

-- Lectura pública para el sitio. El panel SQL de Supabase conserva acceso administrativo.
grant select on table public.catalogo to anon, authenticated;
grant select on table public.catalogo_categorias to anon, authenticated;

drop policy if exists "Maxguantes web read catalogo" on public.catalogo;
create policy "Maxguantes web read catalogo"
on public.catalogo for select
to anon, authenticated
using (true);

drop policy if exists "Maxguantes web read categorias" on public.catalogo_categorias;
create policy "Maxguantes web read categorias"
on public.catalogo_categorias for select
to anon, authenticated
using (true);

-- Verificación: debe devolver únicamente políticas SELECT para estos roles.
select schemaname, tablename, policyname, roles, cmd
from pg_policies
where schemaname = 'public'
  and tablename in ('catalogo', 'catalogo_categorias')
order by tablename, policyname;
