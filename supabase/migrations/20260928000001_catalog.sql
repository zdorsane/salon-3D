-- Catalogue : produits, variantes, codes promo.
-- Prix en dinars entiers ; dimensions en cm (jsonb {width, depth, height}) ;
-- textes traduits en jsonb {fr, en}. Doit rester aligné sur src/types/catalog.ts.

create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.products (
  id text primary key,
  slug text not null unique,
  category text not null check (category in (
    'canapeAngle', 'canape3Places', 'canapeModulable', 'tableRonde', 'tableRectangulaire',
    'tableGigogne', 'tapis', 'fauteuil', 'chauffeuse', 'rockingChair', 'meubleTV', 'console',
    'bibliotheque', 'vaisselier', 'etagereMurale', 'suspension', 'lampadaire', 'plante', 'vase', 'tableau'
  )),
  style text not null check (style in ('moderne', 'scandinave', 'classique', 'oriental')),
  name jsonb not null,
  description jsonb not null,
  brand text not null,
  dimensions jsonb not null,
  weight_kg numeric(7, 2) not null check (weight_kg >= 0),
  materials_label jsonb not null,
  delivery_days integer not null check (delivery_days >= 0),
  rating numeric(2, 1) not null default 0 check (rating between 0 and 5),
  rating_count integer not null default 0 check (rating_count >= 0),
  badges text[] not null default '{}',
  model_url text,
  images text[] not null default '{}',
  datasheet_url text,
  elevation integer,
  placeholder text,
  materials jsonb not null default '{}',
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.variants (
  id text primary key,
  product_id text not null references public.products (id) on delete cascade,
  sku text not null unique,
  label jsonb not null,
  options jsonb not null default '{}',
  swatch text not null,
  price integer not null check (price >= 0),
  compare_at_price integer check (compare_at_price is null or compare_at_price > price),
  stock integer not null default 0 check (stock >= 0),
  materials jsonb not null default '{}',
  dimensions jsonb,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index variants_product_id_idx on public.variants (product_id);

create table public.promo_codes (
  code text primary key check (code = upper(code) and code !~ '\s'),
  kind text not null check (kind in ('percent', 'fixed')),
  value integer not null check (value > 0),
  min_subtotal integer check (min_subtotal >= 0),
  min_items integer check (min_items > 0),
  max_discount integer check (max_discount > 0),
  expires_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  check (kind <> 'percent' or value <= 100)
);

create trigger products_updated_at before update on public.products
  for each row execute function public.touch_updated_at();
create trigger variants_updated_at before update on public.variants
  for each row execute function public.touch_updated_at();

-- Sécurité : lecture publique des seuls produits / variantes actifs.
-- Les codes promo ne sont PAS lisibles par le navigateur (évalués par create-order).
alter table public.products enable row level security;
alter table public.variants enable row level security;
alter table public.promo_codes enable row level security;

create policy "Produits actifs visibles de tous" on public.products
  for select to anon, authenticated using (active);

create policy "Variantes actives de produits actifs visibles de tous" on public.variants
  for select to anon, authenticated
  using (active and exists (select 1 from public.products p where p.id = product_id and p.active));

-- Droits explicites (Supabase accorde tout par défaut, RLS filtre ensuite) :
-- lecture seule du catalogue, aucun accès navigateur aux codes promo.
revoke all on public.products, public.variants, public.promo_codes from anon, authenticated;
grant select on public.products, public.variants to anon, authenticated;
