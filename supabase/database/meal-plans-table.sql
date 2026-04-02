-- ============================================================================
-- Meal Plans Table (bữa ăn trong kế hoạch)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  planned_date DATE NOT NULL,
  title TEXT NOT NULL,
  notes TEXT,
  sort_order SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_modified TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted BOOLEAN NOT NULL DEFAULT false,
  synced BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_meal_plans_user_date ON public.meal_plans(user_id, planned_date) WHERE deleted = false;

ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own meal plans" ON public.meal_plans;
CREATE POLICY "Users can view own meal plans"
  ON public.meal_plans FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own meal plans" ON public.meal_plans;
CREATE POLICY "Users can insert own meal plans"
  ON public.meal_plans FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own meal plans" ON public.meal_plans;
CREATE POLICY "Users can update own meal plans"
  ON public.meal_plans FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own meal plans" ON public.meal_plans;
CREATE POLICY "Users can delete own meal plans"
  ON public.meal_plans FOR DELETE USING (auth.uid() = user_id);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION public.update_meal_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.last_modified = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS meal_plans_updated_at ON public.meal_plans;
CREATE TRIGGER meal_plans_updated_at
  BEFORE UPDATE ON public.meal_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_meal_plans_updated_at();

-- ============================================================================
-- Meal Plan Items (món ăn trong 1 bữa)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.meal_plan_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_id UUID NOT NULL REFERENCES public.meal_plans(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  recipe_id UUID REFERENCES public.recipes(id),
  notes TEXT,
  sort_order SMALLINT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_meal_plan_items_plan ON public.meal_plan_items(meal_plan_id);

ALTER TABLE public.meal_plan_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own meal plan items" ON public.meal_plan_items;
CREATE POLICY "Users can view own meal plan items"
  ON public.meal_plan_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.meal_plans
    WHERE meal_plans.id = meal_plan_items.meal_plan_id
      AND meal_plans.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can insert own meal plan items" ON public.meal_plan_items;
CREATE POLICY "Users can insert own meal plan items"
  ON public.meal_plan_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.meal_plans
    WHERE meal_plans.id = meal_plan_items.meal_plan_id
      AND meal_plans.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can update own meal plan items" ON public.meal_plan_items;
CREATE POLICY "Users can update own meal plan items"
  ON public.meal_plan_items FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.meal_plans
    WHERE meal_plans.id = meal_plan_items.meal_plan_id
      AND meal_plans.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can delete own meal plan items" ON public.meal_plan_items;
CREATE POLICY "Users can delete own meal plan items"
  ON public.meal_plan_items FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.meal_plans
    WHERE meal_plans.id = meal_plan_items.meal_plan_id
      AND meal_plans.user_id = auth.uid()
  ));
