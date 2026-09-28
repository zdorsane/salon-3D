-- Commandes et demandes de devis, avec l'historique de leurs statuts.
-- Aucune politique RLS : seul le serveur (edge functions, clé service_role) y accède.
-- Doit rester aligné sur src/server/orderRows.ts.

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  number text not null unique,
  kind text not null check (kind in ('order', 'quote')),
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled')),
  customer_first_name text not null,
  customer_last_name text not null,
  customer_phone text not null check (customer_phone ~ '^0[2-7][0-9]{7,8}$'),
  customer_email text,
  wilaya_code smallint not null check (wilaya_code between 1 and 58),
  commune text not null default '',
  street text not null default '',
  address_notes text,
  delivery_method text not null check (delivery_method in ('home', 'stopDesk')),
  payment_method text not null check (payment_method in ('cod', 'cib', 'edahabia')),
  items jsonb not null,
  lines jsonb not null,
  subtotal integer not null check (subtotal >= 0),
  discount integer not null default 0 check (discount >= 0 and discount <= subtotal),
  shipping integer not null check (shipping >= 0),
  total integer not null,
  promo_code text,
  applied_promo text,
  estimated_days_min integer not null,
  estimated_days_max integer not null check (estimated_days_max >= estimated_days_min),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (total = subtotal - discount + shipping)
);

create index orders_phone_idx on public.orders (customer_phone);
create index orders_created_at_idx on public.orders (created_at desc);

create table public.order_events (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders (id) on delete cascade,
  status text not null,
  note text,
  created_at timestamptz not null default now()
);

create index order_events_order_id_idx on public.order_events (order_id);

-- Chaque création ou changement de statut est historisé (affiché dans le suivi).
create or replace function public.log_order_status() returns trigger
language plpgsql as $$
begin
  if tg_op = 'INSERT' or new.status is distinct from old.status then
    insert into public.order_events (order_id, status) values (new.id, new.status);
  end if;
  return new;
end;
$$;

create trigger orders_log_status after insert or update of status on public.orders
  for each row execute function public.log_order_status();
create trigger orders_updated_at before update on public.orders
  for each row execute function public.touch_updated_at();

alter table public.orders enable row level security;
alter table public.order_events enable row level security;

-- Aucun accès depuis le navigateur, même si des droits par défaut existent.
revoke all on public.orders, public.order_events from anon, authenticated;
