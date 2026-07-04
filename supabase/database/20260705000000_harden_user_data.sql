-- Harden user-owned data without making global config user-scoped.

do $$
declare
  r record;
begin
  for r in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'users',
        'user_settings',
        'food_items',
        'shopping_list',
        'expiring_items_queue',
        'categories',
        'storage_locations'
      )
  loop
    execute format('drop policy if exists %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

alter table public.users enable row level security;
alter table public.user_settings enable row level security;
alter table public.food_items enable row level security;
alter table public.shopping_list enable row level security;
alter table public.expiring_items_queue enable row level security;
alter table public.categories enable row level security;
alter table public.storage_locations enable row level security;

create policy "Users can view own profile"
  on public.users for select
  to authenticated
  using ((select auth.uid()) = id);
create policy "Users can update own profile"
  on public.users for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Users can view own settings"
  on public.user_settings for select
  to authenticated
  using ((select auth.uid()) = user_id);
create policy "Users can insert own settings"
  on public.user_settings for insert
  to authenticated
  with check ((select auth.uid()) = user_id);
create policy "Users can update own settings"
  on public.user_settings for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Users can delete own settings"
  on public.user_settings for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can view own food items"
  on public.food_items for select
  to authenticated
  using ((select auth.uid()) = user_id);
create policy "Users can insert own food items"
  on public.food_items for insert
  to authenticated
  with check ((select auth.uid()) = user_id);
create policy "Users can update own food items"
  on public.food_items for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Users can delete own food items"
  on public.food_items for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can view own shopping items"
  on public.shopping_list for select
  to authenticated
  using ((select auth.uid()) = user_id);
create policy "Users can insert own shopping items"
  on public.shopping_list for insert
  to authenticated
  with check ((select auth.uid()) = user_id);
create policy "Users can update own shopping items"
  on public.shopping_list for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Users can delete own shopping items"
  on public.shopping_list for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can view own expiring queue"
  on public.expiring_items_queue for select
  to authenticated
  using ((select auth.uid()) = user_id);
create policy "Users can insert own expiring queue"
  on public.expiring_items_queue for insert
  to authenticated
  with check ((select auth.uid()) = user_id);
create policy "Users can update own expiring queue"
  on public.expiring_items_queue for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Users can delete own expiring queue"
  on public.expiring_items_queue for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Authenticated users can read categories"
  on public.categories for select
  to authenticated
  using (true);
create policy "Authenticated users can read storage locations"
  on public.storage_locations for select
  to authenticated
  using (true);

create index if not exists food_items_user_id_idx on public.food_items(user_id);
create index if not exists food_items_expiration_date_idx
  on public.food_items(expiration_date)
  where deleted = false;
create index if not exists food_items_user_expiration_idx
  on public.food_items(user_id, expiration_date)
  where deleted = false;
create index if not exists shopping_list_user_id_idx on public.shopping_list(user_id);
create index if not exists shopping_list_user_checked_idx
  on public.shopping_list(user_id, checked)
  where deleted = false;
create index if not exists expiring_items_queue_user_status_idx
  on public.expiring_items_queue(user_id, status, scheduled_at);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'food_items_quantity_positive') then
    alter table public.food_items
      add constraint food_items_quantity_positive check (quantity > 0) not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'food_items_name_not_blank') then
    alter table public.food_items
      add constraint food_items_name_not_blank check (length(btrim(name)) > 0) not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'shopping_list_quantity_positive') then
    alter table public.shopping_list
      add constraint shopping_list_quantity_positive check (quantity > 0) not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'shopping_list_name_not_blank') then
    alter table public.shopping_list
      add constraint shopping_list_name_not_blank check (length(btrim(name)) > 0) not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'expiring_items_queue_quantity_positive') then
    alter table public.expiring_items_queue
      add constraint expiring_items_queue_quantity_positive check (quantity >= 0) not valid;
  end if;
end $$;
