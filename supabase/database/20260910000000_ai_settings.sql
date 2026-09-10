-- AI settings per user: personal Anthropic API key + model choice.
--
-- Cách chạy: Supabase Dashboard → SQL Editor → dán toàn bộ file này → Run.
--
-- Chỉ có policy SELECT/INSERT/UPDATE cho chính chủ row (auth.uid() = user_id).
-- CỐ Ý không có policy DELETE: muốn gỡ key cá nhân, UPDATE api_key = null
-- (nút "Xoá key" trong màn Cài đặt → AI thực hiện đúng thao tác này).

create table if not exists public.ai_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  provider text not null default 'anthropic',
  model text not null default 'claude-haiku-4-5',
  api_key text,
  updated_at timestamptz not null default now()
);

alter table public.ai_settings enable row level security;

create policy "Users can view own AI settings"
  on public.ai_settings for select
  to authenticated
  using ((select auth.uid()) = user_id);
create policy "Users can insert own AI settings"
  on public.ai_settings for insert
  to authenticated
  with check ((select auth.uid()) = user_id);
create policy "Users can update own AI settings"
  on public.ai_settings for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Keep updated_at fresh on every update (no DELETE policy by design, see header).
create or replace function public.touch_ai_settings_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists ai_settings_touch_updated_at on public.ai_settings;
create trigger ai_settings_touch_updated_at
  before update on public.ai_settings
  for each row execute function public.touch_ai_settings_updated_at();
