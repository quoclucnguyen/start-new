-- ============================================================================
-- Food Diary Tables
-- ============================================================================

-- Venues (quán ăn)
CREATE TABLE IF NOT EXISTS public.venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  address TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  status TEXT NOT NULL DEFAULT 'neutral'
    CHECK (status IN ('favorite', 'blacklisted', 'neutral')),
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_modified TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted BOOLEAN NOT NULL DEFAULT false,
  synced BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_venues_user_id ON public.venues(user_id);
CREATE INDEX idx_venues_status ON public.venues(user_id, status) WHERE deleted = false;

ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own venues"
  ON public.venues FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own venues"
  ON public.venues FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own venues"
  ON public.venues FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own venues"
  ON public.venues FOR DELETE USING (auth.uid() = user_id);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION public.update_venues_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.last_modified = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER venues_updated_at
  BEFORE UPDATE ON public.venues
  FOR EACH ROW EXECUTE FUNCTION public.update_venues_updated_at();

-- ============================================================================
-- Menu Items (món ăn tại 1 quán)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  venue_id UUID NOT NULL REFERENCES public.venues(id),
  name TEXT NOT NULL,
  last_price NUMERIC,
  personal_rating SMALLINT
    CHECK (personal_rating IS NULL OR (personal_rating >= 1 AND personal_rating <= 5)),
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  is_blacklisted BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_menu_items_venue ON public.menu_items(venue_id) WHERE deleted = false;
CREATE INDEX idx_menu_items_user ON public.menu_items(user_id) WHERE deleted = false;

ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own menu items"
  ON public.menu_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own menu items"
  ON public.menu_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own menu items"
  ON public.menu_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own menu items"
  ON public.menu_items FOR DELETE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_menu_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER menu_items_updated_at
  BEFORE UPDATE ON public.menu_items
  FOR EACH ROW EXECUTE FUNCTION public.update_menu_items_updated_at();

-- ============================================================================
-- Meal Logs (bữa ăn)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.meal_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  venue_id UUID REFERENCES public.venues(id),
  meal_type TEXT NOT NULL
    CHECK (meal_type IN ('delivery', 'dine_in', 'ready_made')),
  total_cost NUMERIC NOT NULL,
  overall_rating SMALLINT
    CHECK (overall_rating IS NULL OR (overall_rating >= 1 AND overall_rating <= 5)),
  notes TEXT,
  photos TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  logged_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_modified TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted BOOLEAN NOT NULL DEFAULT false,
  synced BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_meal_logs_user ON public.meal_logs(user_id) WHERE deleted = false;
CREATE INDEX idx_meal_logs_venue ON public.meal_logs(venue_id) WHERE deleted = false;
CREATE INDEX idx_meal_logs_logged ON public.meal_logs(user_id, logged_at DESC) WHERE deleted = false;

ALTER TABLE public.meal_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own meal logs"
  ON public.meal_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own meal logs"
  ON public.meal_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own meal logs"
  ON public.meal_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own meal logs"
  ON public.meal_logs FOR DELETE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_meal_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.last_modified = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER meal_logs_updated_at
  BEFORE UPDATE ON public.meal_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_meal_logs_updated_at();

-- ============================================================================
-- Meal Item Entries (chi tiết món trong bữa)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.meal_item_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_log_id UUID NOT NULL REFERENCES public.meal_logs(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES public.menu_items(id),
  item_name TEXT NOT NULL,
  price NUMERIC,
  quantity SMALLINT NOT NULL DEFAULT 1,
  rating SMALLINT
    CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  notes TEXT
);

CREATE INDEX idx_meal_item_entries_log ON public.meal_item_entries(meal_log_id);

ALTER TABLE public.meal_item_entries ENABLE ROW LEVEL SECURITY;

-- RLS: inherit access from meal_logs via EXISTS subquery
CREATE POLICY "Users can view own meal item entries"
  ON public.meal_item_entries FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.meal_logs WHERE id = meal_log_id AND user_id = auth.uid()
  ));
CREATE POLICY "Users can insert own meal item entries"
  ON public.meal_item_entries FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.meal_logs WHERE id = meal_log_id AND user_id = auth.uid()
  ));
CREATE POLICY "Users can update own meal item entries"
  ON public.meal_item_entries FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.meal_logs WHERE id = meal_log_id AND user_id = auth.uid()
  ));
CREATE POLICY "Users can delete own meal item entries"
  ON public.meal_item_entries FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.meal_logs WHERE id = meal_log_id AND user_id = auth.uid()
  ));
