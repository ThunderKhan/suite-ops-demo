-- Future authenticated backend schema. Not executed by the browser-only demo.
-- Apply only to a controlled Supabase project after reviewing RLS and permissions.
-- All content seeded in a later migration must be fictional.

create extension if not exists pgcrypto;

create type public.hotel_role as enum ('manager','front_desk','housekeeper','supervisor','purchasing');
create type public.occupancy_state as enum ('vacant','occupied');
create type public.housekeeping_state as enum ('clean','dirty','in_progress','pending_inspection');
create type public.maintenance_state as enum ('clear','out_of_order');
create type public.task_state as enum ('open','assigned','in_progress','pending_inspection','completed','needs_rework');
create type public.purchase_state as enum ('pending','approved','rejected');

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  timezone text not null default 'Asia/Kolkata',
  created_at timestamptz not null default now()
);

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  property_id uuid not null references public.properties(id),
  display_name text not null,
  role public.hotel_role not null,
  created_at timestamptz not null default now()
);

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id),
  room_number text not null,
  floor integer not null,
  category text not null,
  active boolean not null default true,
  unique (property_id, room_number)
);

create table public.room_states (
  room_id uuid primary key references public.rooms(id) on delete cascade,
  occupancy public.occupancy_state not null default 'vacant',
  housekeeping public.housekeeping_state not null default 'dirty',
  maintenance public.maintenance_state not null default 'clear',
  version bigint not null default 1 check (version > 0),
  updated_by uuid references public.profiles(user_id),
  updated_at timestamptz not null default now()
);

create table public.housekeeping_tasks (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id),
  assignee_id uuid references public.profiles(user_id),
  status public.task_state not null default 'open',
  priority text not null default 'normal' check (priority in ('normal','high','urgent')),
  notes text not null default '',
  checklist jsonb not null default '[]'::jsonb,
  due_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index one_active_housekeeping_task_per_room
on public.housekeeping_tasks(room_id)
where status <> 'completed';

create table public.inspection_results (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.housekeeping_tasks(id),
  inspector_id uuid not null references public.profiles(user_id),
  approved boolean not null,
  rejection_reason text,
  created_at timestamptz not null default now(),
  constraint rejection_needs_reason check (approved or length(trim(coalesce(rejection_reason,''))) > 0)
);

create table public.room_events (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references public.rooms(id),
  actor_id uuid not null references public.profiles(user_id),
  action text not null,
  before_state jsonb,
  after_state jsonb,
  occurred_at timestamptz not null default now()
);

create table public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id),
  sku text not null,
  name text not null,
  unit text not null,
  on_hand integer not null check (on_hand >= 0),
  reorder_threshold integer not null check (reorder_threshold >= 0),
  target_level integer not null check (target_level > 0),
  unit_cost numeric(12,2) not null default 0,
  unique(property_id, sku)
);

create table public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.inventory_items(id),
  task_id uuid not null references public.housekeeping_tasks(id),
  actor_id uuid not null references public.profiles(user_id),
  quantity_delta integer not null check (quantity_delta <> 0),
  idempotency_key text not null unique,
  created_at timestamptz not null default now()
);

create table public.purchase_requests (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.inventory_items(id),
  requested_by uuid not null references public.profiles(user_id),
  quantity integer not null check (quantity > 0),
  status public.purchase_state not null default 'pending',
  note text not null default '',
  decided_by uuid references public.profiles(user_id),
  decided_at timestamptz,
  created_at timestamptz not null default now()
);

create index rooms_floor_idx on public.rooms(property_id, floor);
create index tasks_assignment_idx on public.housekeeping_tasks(assignee_id, status);
create index tasks_room_idx on public.housekeeping_tasks(room_id, created_at desc);
create index stock_item_time_idx on public.stock_movements(item_id, created_at desc);
create index audit_room_time_idx on public.room_events(room_id, occurred_at desc);

-- Require authentication on every table. RLS is fail-closed until a reviewed,
-- property-scoped set of SELECT policies and role-specific transactional RPCs
-- has been installed. Do not add permissive anon INSERT/UPDATE policies.
alter table public.properties enable row level security;
alter table public.profiles enable row level security;
alter table public.rooms enable row level security;
alter table public.room_states enable row level security;
alter table public.housekeeping_tasks enable row level security;
alter table public.inspection_results enable row level security;
alter table public.room_events enable row level security;
alter table public.inventory_items enable row level security;
alter table public.stock_movements enable row level security;
alter table public.purchase_requests enable row level security;

revoke all on public.properties, public.profiles, public.rooms, public.room_states,
  public.housekeeping_tasks, public.inspection_results, public.room_events,
  public.inventory_items, public.stock_movements, public.purchase_requests
  from anon, authenticated;

comment on schema public is 'Suite Operations future authenticated backend; RLS policies and RPC actions required before activation.';
