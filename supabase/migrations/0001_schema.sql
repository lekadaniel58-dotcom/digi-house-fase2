-- DIGI HOUSE SRL - Fase 1: schema, ruoli e Row Level Security
create extension if not exists pgcrypto;

create type public.user_role as enum ('customer','admin');
create type public.availability as enum ('available','on_request','out_of_stock');
create type public.request_status as enum ('new','in_progress','answered','closed');

-- Profili (1:1 con auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'customer',
  full_name text check (char_length(full_name) <= 120),
  phone text check (char_length(phone) <= 30),
  created_at timestamptz not null default now()
);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name) values (new.id, left(new.raw_user_meta_data->>'full_name',120));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Impedisce a un cliente di auto-promuoversi admin
create or replace function public.protect_role() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'Modifica del ruolo non consentita';
  end if;
  return new;
end $$;
create trigger profiles_protect_role before update on public.profiles
  for each row execute function public.protect_role();

-- Reparti (configurabili dall'amministratore)
create table public.departments (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  sort_order int not null default 0,
  active boolean not null default true
);

-- Prodotti: prezzo e disponibilita' restano nulli se non forniti
create table public.products (
  id uuid primary key default gen_random_uuid(),
  sku text unique not null,
  slug text unique not null,
  name text not null check (char_length(name) between 1 and 200),
  description text,
  brand text,
  department_id uuid references public.departments(id) on delete set null,
  price numeric(10,2) check (price is null or price >= 0),
  availability public.availability not null default 'on_request',
  features jsonb not null default '{}'::jsonb,
  images text[] not null default '{}',
  is_featured boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.products (department_id);
create index on public.products using gin (to_tsvector('italian', name || ' ' || coalesce(brand,'') || ' ' || coalesce(sku,'')));

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  label text not null,
  sku text,
  price numeric(10,2) check (price is null or price >= 0),
  availability public.availability not null default 'on_request'
);

create table public.promotions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  product_id uuid references public.products(id) on delete cascade,
  discount_percent numeric(5,2) check (discount_percent between 0 and 100),
  starts_at timestamptz, ends_at timestamptz,
  active boolean not null default true
);

create table public.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null, subtitle text, image_url text, link_url text,
  sort_order int not null default 0, active boolean not null default true
);

-- Richieste di preventivo / ordine (senza pagamento online)
create table public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  customer_name text not null check (char_length(customer_name) between 2 and 120),
  customer_phone text check (char_length(customer_phone) <= 30),
  customer_email text not null check (customer_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  notes text check (char_length(notes) <= 2000),
  status public.request_status not null default 'new',
  created_at timestamptz not null default now()
);
create table public.quote_items (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.quote_requests(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null, sku text,
  variant_label text,
  quantity int not null check (quantity between 1 and 100000)
);

-- Messaggi dal modulo contatti (inserimento anonimo ammesso, con vincoli)
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  message text not null check (char_length(message) between 10 and 3000),
  handled boolean not null default false,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.profiles enable row level security;
alter table public.departments enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.promotions enable row level security;
alter table public.banners enable row level security;
alter table public.quote_requests enable row level security;
alter table public.quote_items enable row level security;
alter table public.contact_messages enable row level security;

create policy profiles_self_read on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy profiles_self_update on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_admin_all on public.profiles for all using (public.is_admin()) with check (public.is_admin());

-- Contenuti pubblici: lettura a tutti (solo attivi), scrittura solo admin
create policy departments_read on public.departments for select using (active or public.is_admin());
create policy departments_admin on public.departments for all using (public.is_admin()) with check (public.is_admin());
create policy products_read on public.products for select using (active or public.is_admin());
create policy products_admin on public.products for all using (public.is_admin()) with check (public.is_admin());
create policy variants_read on public.product_variants for select using (true);
create policy variants_admin on public.product_variants for all using (public.is_admin()) with check (public.is_admin());
create policy promotions_read on public.promotions for select using (active or public.is_admin());
create policy promotions_admin on public.promotions for all using (public.is_admin()) with check (public.is_admin());
create policy banners_read on public.banners for select using (active or public.is_admin());
create policy banners_admin on public.banners for all using (public.is_admin()) with check (public.is_admin());

-- Preventivi: ogni cliente vede solo i propri
create policy quotes_own_read on public.quote_requests for select using (user_id = auth.uid() or public.is_admin());
create policy quotes_own_insert on public.quote_requests for insert to authenticated with check (user_id = auth.uid() and status = 'new');
create policy quotes_admin_update on public.quote_requests for update using (public.is_admin()) with check (public.is_admin());
create policy qitems_read on public.quote_items for select
  using (exists (select 1 from public.quote_requests q where q.id = request_id and (q.user_id = auth.uid() or public.is_admin())));
create policy qitems_insert on public.quote_items for insert to authenticated
  with check (exists (select 1 from public.quote_requests q where q.id = request_id and q.user_id = auth.uid()));

create policy contact_insert on public.contact_messages for insert to anon, authenticated with check (handled = false);
create policy contact_admin on public.contact_messages for select using (public.is_admin());
create policy contact_admin_update on public.contact_messages for update using (public.is_admin()) with check (public.is_admin());

-- Storage foto prodotto: lettura pubblica, scrittura solo admin
insert into storage.buckets (id, name, public) values ('product-images','product-images', true) on conflict do nothing;
create policy "img_public_read" on storage.objects for select using (bucket_id = 'product-images');
create policy "img_admin_write" on storage.objects for all
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());

-- Reparti iniziali (solo nomi forniti da te, nessun prodotto)
insert into public.departments (slug, name, sort_order) values
 ('pitture-decorazioni','Pitture e decorazioni',1),('materiali-edili','Materiali edili',2),
 ('adesivi-sigillanti','Adesivi e sigillanti',3),('impermeabilizzanti','Impermeabilizzanti',4),
 ('pavimenti-rivestimenti','Pavimenti e rivestimenti',5),('porte-interne','Porte interne',6),
 ('porte-blindate','Porte blindate',7),('infissi','Infissi',8),
 ('avvolgibili-tapparelle','Avvolgibili e tapparelle',9),('zanzariere','Zanzariere',10),
 ('ferramenta','Ferramenta',11);
