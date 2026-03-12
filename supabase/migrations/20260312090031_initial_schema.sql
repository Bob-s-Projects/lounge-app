-- ============================================
-- LEDIAN Lounge 業務管理システム
-- 初期スキーマ
-- ============================================

-- ── 商品マスタ ──────────────────────────────
create table products (
  id bigint primary key generated always as identity,
  smaregi_product_id text unique,
  product_code text,
  name text not null,
  category text not null default '未分類',
  price integer not null default 0,
  cost integer not null default 0,
  cost_ratio numeric(5,2) generated always as (
    case when price > 0 then round((cost::numeric / price) * 100, 2) else 0 end
  ) stored,
  description text,
  image_url text,
  is_active boolean not null default true,
  display_order integer not null default 0,
  tags text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_products_category on products(category);
create index idx_products_active on products(is_active);

-- ── 仕入れ業者 ──────────────────────────────
create table suppliers (
  id bigint primary key generated always as identity,
  name text not null,
  contact_name text,
  phone text,
  email text,
  note text,
  created_at timestamptz not null default now()
);

-- ── 仕入れ価格 ──────────────────────────────
create table supplier_items (
  id bigint primary key generated always as identity,
  supplier_id bigint references suppliers(id) on delete cascade,
  supplier_code text,
  name text not null,
  category text not null,
  spec text,
  case_quantity integer not null default 1,
  unit_price integer not null,
  last_shipped date,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_supplier_items_category on supplier_items(category);

-- ── レシピ ──────────────────────────────────
create table recipes (
  id bigint primary key generated always as identity,
  product_id bigint references products(id) on delete set null,
  name text not null,
  category text not null default 'ドリンク',
  description text,
  steps text[],
  estimated_cost integer not null default 0,
  difficulty integer not null default 1 check (difficulty between 1 and 5),
  prep_time_min integer,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── レシピ材料 ──────────────────────────────
create table recipe_ingredients (
  id bigint primary key generated always as identity,
  recipe_id bigint not null references recipes(id) on delete cascade,
  supplier_item_id bigint references supplier_items(id) on delete set null,
  name text not null,
  amount numeric(10,2) not null,
  unit text not null default 'ml',
  cost integer not null default 0,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index idx_recipe_ingredients_recipe on recipe_ingredients(recipe_id);

-- ── 在庫 ──────────────────────────────────
create table inventory (
  id bigint primary key generated always as identity,
  supplier_item_id bigint references supplier_items(id) on delete set null,
  product_id bigint references products(id) on delete set null,
  name text not null,
  category text not null,
  current_stock numeric(10,2) not null default 0,
  unit text not null default '本',
  par_level numeric(10,2),
  location text,
  last_counted_at timestamptz,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_inventory_category on inventory(category);

-- ── 在庫変動履歴 ──────────────────────────
create table inventory_logs (
  id bigint primary key generated always as identity,
  inventory_id bigint not null references inventory(id) on delete cascade,
  change_type text not null check (change_type in ('入荷', '消費', '棚卸', '廃棄', '移動')),
  quantity numeric(10,2) not null,
  note text,
  staff_id bigint,
  created_at timestamptz not null default now()
);

-- ── スタッフ ──────────────────────────────
create table staff (
  id bigint primary key generated always as identity,
  name text not null,
  role text not null default 'スタッフ' check (role in ('オーナー', 'マネージャー', 'バーテンダー', 'スタッフ', 'キッチン', 'アルバイト')),
  phone text,
  email text,
  hourly_rate integer,
  is_active boolean not null default true,
  note text,
  joined_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── シフト ──────────────────────────────────
create table shifts (
  id bigint primary key generated always as identity,
  staff_id bigint not null references staff(id) on delete cascade,
  date date not null,
  start_time time not null,
  end_time time not null,
  break_minutes integer not null default 0,
  status text not null default '予定' check (status in ('希望', '予定', '確定', '出勤済', '欠勤')),
  actual_start time,
  actual_end time,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_shifts_date on shifts(date);
create index idx_shifts_staff on shifts(staff_id);

-- ── 日報 ──────────────────────────────────
create table daily_reports (
  id bigint primary key generated always as identity,
  date date not null unique,
  total_sales integer not null default 0,
  total_customers integer not null default 0,
  cash_sales integer not null default 0,
  card_sales integer not null default 0,
  other_sales integer not null default 0,
  staff_on_duty text[],
  weather text,
  events text,
  issues text,
  note text,
  created_by bigint references staff(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_daily_reports_date on daily_reports(date);

-- ── 顧客 (CRM) ──────────────────────────
create table customers (
  id bigint primary key generated always as identity,
  name text not null,
  phone text,
  email text,
  company text,
  visit_count integer not null default 0,
  total_spent integer not null default 0,
  tier text not null default 'レギュラー' check (tier in ('レギュラー', 'シルバー', 'ゴールド', 'VIP')),
  preferences text,
  allergies text,
  note text,
  last_visit_at timestamptz,
  birthday date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── ボトルキープ ──────────────────────────
create table bottle_keeps (
  id bigint primary key generated always as identity,
  customer_id bigint not null references customers(id) on delete cascade,
  product_name text not null,
  stored_at date not null default current_date,
  expires_at date,
  remaining_ml integer,
  location text,
  status text not null default '保管中' check (status in ('保管中', '空', '期限切れ', '引取済')),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_bottle_keeps_customer on bottle_keeps(customer_id);
create index idx_bottle_keeps_status on bottle_keeps(status);

-- ── 売上サマリー（スマレジ同期用）────────
create table sales_daily (
  id bigint primary key generated always as identity,
  date date not null,
  product_id bigint references products(id) on delete set null,
  smaregi_product_id text,
  product_name text not null,
  category text,
  quantity integer not null default 0,
  total_sales integer not null default 0,
  avg_price integer not null default 0,
  created_at timestamptz not null default now()
);

create index idx_sales_daily_date on sales_daily(date);
create index idx_sales_daily_product on sales_daily(product_id);

-- ── updated_at 自動更新トリガー ──────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_products_updated before update on products for each row execute function update_updated_at();
create trigger trg_supplier_items_updated before update on supplier_items for each row execute function update_updated_at();
create trigger trg_recipes_updated before update on recipes for each row execute function update_updated_at();
create trigger trg_inventory_updated before update on inventory for each row execute function update_updated_at();
create trigger trg_staff_updated before update on staff for each row execute function update_updated_at();
create trigger trg_shifts_updated before update on shifts for each row execute function update_updated_at();
create trigger trg_daily_reports_updated before update on daily_reports for each row execute function update_updated_at();
create trigger trg_customers_updated before update on customers for each row execute function update_updated_at();
create trigger trg_bottle_keeps_updated before update on bottle_keeps for each row execute function update_updated_at();

-- ── RLS ──────────────────────────────────
alter table products enable row level security;
alter table suppliers enable row level security;
alter table supplier_items enable row level security;
alter table recipes enable row level security;
alter table recipe_ingredients enable row level security;
alter table inventory enable row level security;
alter table inventory_logs enable row level security;
alter table staff enable row level security;
alter table shifts enable row level security;
alter table daily_reports enable row level security;
alter table customers enable row level security;
alter table bottle_keeps enable row level security;
alter table sales_daily enable row level security;

-- 認証済みユーザーにフルアクセス（初期段階）
create policy "auth_full" on products for all to authenticated using (true) with check (true);
create policy "auth_full" on suppliers for all to authenticated using (true) with check (true);
create policy "auth_full" on supplier_items for all to authenticated using (true) with check (true);
create policy "auth_full" on recipes for all to authenticated using (true) with check (true);
create policy "auth_full" on recipe_ingredients for all to authenticated using (true) with check (true);
create policy "auth_full" on inventory for all to authenticated using (true) with check (true);
create policy "auth_full" on inventory_logs for all to authenticated using (true) with check (true);
create policy "auth_full" on staff for all to authenticated using (true) with check (true);
create policy "auth_full" on shifts for all to authenticated using (true) with check (true);
create policy "auth_full" on daily_reports for all to authenticated using (true) with check (true);
create policy "auth_full" on customers for all to authenticated using (true) with check (true);
create policy "auth_full" on bottle_keeps for all to authenticated using (true) with check (true);
create policy "auth_full" on sales_daily for all to authenticated using (true) with check (true);

-- anonは業務データのみ読み取り可（顧客・ボトルは除外）
create policy "anon_read" on products for select to anon using (true);
create policy "anon_read" on supplier_items for select to anon using (true);
create policy "anon_read" on recipes for select to anon using (true);
create policy "anon_read" on recipe_ingredients for select to anon using (true);
create policy "anon_read" on inventory for select to anon using (true);
create policy "anon_read" on staff for select to anon using (true);
create policy "anon_read" on shifts for select to anon using (true);
create policy "anon_read" on daily_reports for select to anon using (true);
create policy "anon_read" on sales_daily for select to anon using (true);
