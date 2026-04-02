---
name: openclaw-food-system-orchestrator
description: Standalone orchestrator skill for full-system operations (inventory, shopping, diary, recipes, settings, code, and Supabase) via npx mcporter.
metadata:
  openclaw:
    os: ["linux", "darwin", "windows"]
---

# OpenClaw System Orchestrator Skill

Use skill này khi cần thao tác **toàn hệ thống** (đặc biệt DB/Supabase) thay vì chỉ một feature UI.

OpenClaw **không gọi MCP Supabase trực tiếp**. Luôn thực hiện qua:

`npx mcporter call supabase.<tool_name>`

---

## Prerequisites

- Node.js + npm/npx.
- MCP Supabase server đã có trong config của mcporter.
- Verify nhanh:

```bash
npx mcporter list supabase
```

---

## System Scope

- **Data operations (DML)**: `execute_sql`.
- **Schema operations (DDL)**: `apply_migration`.

---

## Project Database Context (important)

### 1) Source of truth

- Database: Supabase Postgres, schema `public`.
- Auth principal: `auth.users.id`.
- RLS: enabled on domain tables.

### 2) Domain → tables

- Inventory: `food_items`, `expiring_items_queue`
- Settings: `categories`, `storage_locations`, `user_settings`
- Shopping: `shopping_list`
- Recipes: `recipes`, `recipe_ingredients`, `recipe_steps`
- Diary: `venues`, `menu_items`, `meal_logs`, `meal_item_entries`

### 3) Recipe schema (new, must-follow)

`public.recipes` dùng các cột chính:

- `id`, `user_id`, `title`, `description`
- `image_url`, `source_url`
- `cook_time_minutes`, `prep_time_minutes`, `servings`
- `difficulty` (`easy|medium|hard`)
- `visibility` (`private|shared`)
- `source` (`system|user`)
- `tags` (`text[]`)
- `created_at`, `updated_at`, `last_modified`, `deleted`, `synced`

> **Không có** cột `ingredients` hay `instructions` trong `recipes`.
> Ingredients/steps được lưu ở bảng con:
> - `recipe_ingredients` (`name`, `normalized_name`, `quantity`, `unit`, `optional`, `sort_order`)
> - `recipe_steps` (`step_number`, `instruction`, `estimated_minutes`)

### 4) Storage rules

- DB snake_case; app layer map camelCase.
- Với bảng có soft delete, đọc dữ liệu nghiệp vụ nên thêm `deleted = false`.
- INSERT domain data phải có `user_id` khi schema yêu cầu.
- UPDATE/DELETE luôn dùng `WHERE` hẹp (id cụ thể/business key rõ ràng).

---

## MCP Supabase via mcporter

### Common syntax

```bash
# Recommended
npx mcporter call 'supabase.execute_sql(query: "SELECT 1")'

# Alternative flag syntax
npx mcporter call supabase.execute_sql query="SELECT 1"
```

### Tool quick-reference

- `supabase.list_tables`
- `supabase.execute_sql`
- `supabase.apply_migration`
- `supabase.list_migrations`
- `supabase.get_advisors`
- `supabase.get_logs`

---

## Intent Routing

1. **read_only**
   - SELECT/schema inspection/logs only.
2. **workspace_change**
   - Update docs/config/playbooks in repo.
3. **data_write**
   - INSERT/UPDATE/DELETE runtime data via `execute_sql`.
4. **schema_change**
   - DDL via `apply_migration` only.

---

## Global Procedure

1. Classify intent.
2. Collect required inputs (IDs, filters, user scope).
3. Discover schema first:

```bash
npx mcporter call 'supabase.list_tables(schemas: ["public"], verbose: true)'
```

4. Validate with read-first query.
5. Execute minimal action.
6. Verify by SELECT.
7. If schema change, run advisors:

```bash
npx mcporter call supabase.get_advisors type=security
```

---

## Safety Boundaries

- Read-first by default.
- Never run broad/destructive writes without explicit confirmation.
- Use `apply_migration` for DDL, not `execute_sql`.
- Use `execute_sql` for DML only.
- Keep UPDATE/DELETE scoped by concrete WHERE.

---

## Recipes Playbook (updated)

Khi ingest/import/upsert recipe từ nguồn ngoài:

1. Validate payload tối thiểu:
   - `title`
   - `ingredients[]`
   - `steps[]`
2. Dedupe check:

```bash
npx mcporter call 'supabase.execute_sql(query: "SELECT id FROM recipes WHERE LOWER(title)=LOWER('"'"'<title>'"'"') AND deleted=false")'
```

3. Preview write plan (recipes + recipe_ingredients + recipe_steps).
4. Write data theo đúng cấu trúc multi-table.

### Canonical insert flow (transactional SQL)

```sql
BEGIN;

WITH inserted_recipe AS (
  INSERT INTO public.recipes (
    user_id,
    title,
    description,
    image_url,
    source_url,
    cook_time_minutes,
    prep_time_minutes,
    servings,
    difficulty,
    visibility,
    source,
    tags
  ) VALUES (
    :user_id,
    :title,
    :description,
    :image_url,
    :source_url,
    :cook_time_minutes,
    :prep_time_minutes,
    :servings,
    :difficulty,
    COALESCE(:visibility, 'private'),
    COALESCE(:source, 'user'),
    COALESCE(:tags, ARRAY[]::text[])
  )
  RETURNING id
)
INSERT INTO public.recipe_ingredients (
  recipe_id,
  name,
  normalized_name,
  quantity,
  unit,
  optional,
  sort_order
)
SELECT
  ir.id,
  x.name,
  LOWER(TRIM(REGEXP_REPLACE(x.name, '\\s+', ' ', 'g'))),
  x.quantity,
  x.unit,
  COALESCE(x.optional, false),
  x.sort_order
FROM inserted_recipe ir
JOIN :ingredients_payload x ON TRUE;

-- Steps insert chạy tiếp theo, dùng same recipe_id
-- (thực thi bằng CTE/biến tạm tùy orchestration runtime)

COMMIT;
```

> Nếu không dùng transaction được trong một call, phải:
> - insert recipe trước,
> - insert ingredients,
> - insert steps,
> - verify số dòng và rollback thủ công (cleanup) khi fail giữa chừng.

### Steps insert shape

```sql
INSERT INTO public.recipe_steps (
  recipe_id,
  step_number,
  instruction,
  estimated_minutes
) VALUES
  (:recipe_id, 1, :instruction_1, :estimated_minutes_1),
  (:recipe_id, 2, :instruction_2, :estimated_minutes_2);
```

---

## Quick DB Snippets

```bash
# Recipes with source_url
npx mcporter call 'supabase.execute_sql(query: "SELECT id,title,source_url,image_url FROM recipes WHERE deleted=false ORDER BY updated_at DESC LIMIT 50")'

# Recipe detail with ingredients and steps
npx mcporter call 'supabase.execute_sql(query: "SELECT r.id,r.title,r.source_url,ri.sort_order,ri.name,ri.quantity,ri.unit,rs.step_number,rs.instruction FROM recipes r LEFT JOIN recipe_ingredients ri ON ri.recipe_id=r.id LEFT JOIN recipe_steps rs ON rs.recipe_id=r.id WHERE r.id='"'"'<recipe-id>'"'"' AND r.deleted=false ORDER BY ri.sort_order, rs.step_number")'
```

---

## Response Format

Khi trả kết quả, luôn nêu:

1. Intent used
2. Commands đã chạy (`npx mcporter call ...`)
3. Outcome (IDs/counts)
4. Next safest step
