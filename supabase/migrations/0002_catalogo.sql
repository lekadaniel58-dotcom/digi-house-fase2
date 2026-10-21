-- Fase 2: campi per il listino reale
alter table public.products add column if not exists subtitle text;
create unique index if not exists product_variants_unique on public.product_variants (product_id, label);
insert into public.departments (slug, name, sort_order) values ('finiture','Finiture',12) on conflict (slug) do nothing;
