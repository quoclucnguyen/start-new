# Database Schema Documentation

Detailed schema documentation for all tables in the `public` schema.

## Conventions

- PK: UUID primary keys (mostly `gen_random_uuid()`)
- Auth linkage: user-owned tables reference `auth.users(id)`
- Naming: snake_case at DB level
- RLS: enabled on all tables

---

## Table: `users`

User profile table linked 1:1 with Supabase Auth.

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | - |
| telegram_id | bigint | NO | - |
| chat_id | bigint | NO | - |
| email | text | NO | - |
| first_name | text | YES | - |
| last_name | text | YES | - |
| username | text | YES | - |
| last_login | timestamptz | YES | - |
| created_at | timestamptz | YES | `now()` |
| updated_at | timestamptz | YES | `now()` |

Constraints:
- PK: `id`
- FK: `id -> auth.users.id`
- Unique: `telegram_id`, `email`

---

## Table: `user_settings`

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | `gen_random_uuid()` |
| user_id | uuid | NO | - |
| preferences | jsonb | YES | `'{}'::jsonb` |
| gemini_api_key | text | YES | - |
| created_at | timestamptz | YES | `now()` |
| updated_at | timestamptz | YES | `now()` |

Constraints:
- PK: `id`
- FK: `user_id -> auth.users.id`
- Unique: `user_id`

---

## Table: `food_items`

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | `gen_random_uuid()` |
| user_id | uuid | NO | - |
| name | text | NO | - |
| quantity | numeric | NO | - |
| unit | text | NO | - |
| expiration_date | date | YES | - |
| category | text | YES | - |
| image_url | text | YES | - |
| created_at | timestamptz | YES | `(now() AT TIME ZONE 'Asia/Ho_Chi_Minh'::text)` |
| purchase_date | date | YES | - |
| notes | text | YES | - |
| updated_at | timestamptz | YES | `now()` |
| last_modified | timestamptz | YES | `now()` |
| deleted | boolean | YES | `false` |
| synced | boolean | YES | `false` |
| storage | text | YES | `'pantry'::text` |

Constraints:
- PK: `id`
- FK: `user_id -> auth.users.id`

---

## Table: `cosmetics`

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | `gen_random_uuid()` |
| user_id | uuid | NO | - |
| name | text | NO | - |
| brand | text | YES | - |
| category | text | YES | - |
| expiry_date | date | YES | - |
| opened_date | date | YES | - |
| status | text | YES | `'active'::text` |
| notes | text | YES | - |
| image_url | text | YES | - |
| created_at | timestamptz | NO | `now()` |
| updated_at | timestamptz | NO | `now()` |

Constraints:
- PK: `id`
- FK: `user_id -> auth.users.id`

---

## Table: `expiring_items_queue`

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | `gen_random_uuid()` |
| food_item_id | uuid | YES | - |
| cosmetic_id | uuid | YES | - |
| user_id | uuid | NO | - |
| chat_id | bigint | NO | - |
| item_name | text | NO | - |
| quantity | numeric | NO | - |
| unit | text | NO | - |
| expiration_date | date | NO | - |
| category | text | NO | - |
| days_until_expiry | integer | NO | - |
| notification_priority | text | NO | - |
| status | text | NO | `'pending'::text` |
| scheduled_at | timestamptz | YES | - |
| created_at | timestamptz | NO | `(now() AT TIME ZONE 'Asia/Ho_Chi_Minh'::text)` |
| updated_at | timestamptz | NO | `(now() AT TIME ZONE 'Asia/Ho_Chi_Minh'::text)` |
| processed_at | timestamptz | YES | - |

Constraints:
- PK: `id`
- FK: `user_id -> auth.users.id`
- FK: `food_item_id -> food_items.id`
- FK: `cosmetic_id -> cosmetics.id`
- Check: `notification_priority IN ('urgent','high','medium','low')`
- Check: `status IN ('pending','processing','sent','failed')`

---

## Table: `categories`

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | `gen_random_uuid()` |
| name | text | NO | - |
| icon | text | NO | `'📦'::text` |
| color | text | NO | `'#6b7280'::text` |
| show_in_filters | boolean | YES | `true` |
| sort_order | integer | NO | `0` |
| created_at | timestamptz | YES | `now()` |

Constraints:
- PK: `id`

---

## Table: `storage_locations`

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | `gen_random_uuid()` |
| name | text | NO | - |
| icon | text | NO | `'📦'::text` |
| color | text | NO | `'#6b7280'::text` |
| show_in_filters | boolean | YES | `true` |
| sort_order | integer | NO | `0` |
| created_at | timestamptz | YES | `now()` |

Constraints:
- PK: `id`

---

## Table: `shopping_list`

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | `gen_random_uuid()` |
| user_id | uuid | NO | - |
| name | text | NO | - |
| category | text | NO | - |
| quantity | numeric | NO | `1` |
| unit | text | NO | `'pieces'::text` |
| notes | text | YES | - |
| checked | boolean | NO | `false` |
| linked_food_item_id | uuid | YES | - |
| created_at | timestamptz | NO | `now()` |
| updated_at | timestamptz | NO | `now()` |
| last_modified | timestamptz | NO | `now()` |
| purchased_at | timestamptz | YES | - |
| deleted | boolean | NO | `false` |
| synced | boolean | NO | `false` |

Constraints:
- PK: `id`
- FK: `user_id -> auth.users.id`
- FK: `linked_food_item_id -> food_items.id`

---

## Table: `recipes`

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | `gen_random_uuid()` |
| user_id | uuid | YES | - |
| title | text | NO | - |
| description | text | YES | - |
| image_url | text | YES | - |
| cook_time_minutes | integer | NO | - |
| prep_time_minutes | integer | YES | - |
| servings | integer | NO | `1` |
| difficulty | text | NO | - |
| tags | text[] | NO | `'{}'::text[]` |
| visibility | text | NO | `'private'::text` |
| source | text | NO | `'user'::text` |
| created_at | timestamptz | NO | `now()` |
| updated_at | timestamptz | NO | `now()` |
| last_modified | timestamptz | NO | `now()` |
| deleted | boolean | NO | `false` |
| synced | boolean | NO | `false` |

Constraints:
- PK: `id`
- FK: `user_id -> auth.users.id`
- Check: `cook_time_minutes > 0`
- Check: `servings > 0`
- Check: `difficulty IN ('easy','medium','hard')`
- Check: `visibility IN ('private','shared')`
- Check: `source IN ('system','user')`

---

## Table: `recipe_ingredients`

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | `gen_random_uuid()` |
| recipe_id | uuid | NO | - |
| name | text | NO | - |
| normalized_name | text | NO | - |
| quantity | numeric | YES | - |
| unit | text | YES | - |
| optional | boolean | NO | `false` |
| sort_order | integer | NO | `0` |
| created_at | timestamptz | NO | `now()` |

Constraints:
- PK: `id`
- FK: `recipe_id -> recipes.id`

---

## Table: `recipe_steps`

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | `gen_random_uuid()` |
| recipe_id | uuid | NO | - |
| step_number | integer | NO | - |
| instruction | text | NO | - |
| estimated_minutes | integer | YES | - |
| created_at | timestamptz | NO | `now()` |

Constraints:
- PK: `id`
- FK: `recipe_id -> recipes.id`
- Check: `step_number > 0`

---

## Table: `venues`

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | `gen_random_uuid()` |
| user_id | uuid | NO | - |
| name | text | NO | - |
| address | text | YES | - |
| latitude | double precision | YES | - |
| longitude | double precision | YES | - |
| status | text | NO | `'neutral'::text` |
| tags | text[] | YES | `'{}'::text[]` |
| notes | text | YES | - |
| image_url | text | YES | - |
| created_at | timestamptz | NO | `now()` |
| updated_at | timestamptz | NO | `now()` |
| last_modified | timestamptz | NO | `now()` |
| deleted | boolean | NO | `false` |
| synced | boolean | NO | `false` |

Constraints:
- PK: `id`
- FK: `user_id -> auth.users.id`
- Check: `status IN ('favorite','blacklisted','neutral')`

---

## Table: `menu_items`

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | `gen_random_uuid()` |
| user_id | uuid | NO | - |
| venue_id | uuid | NO | - |
| name | text | NO | - |
| last_price | numeric | YES | - |
| personal_rating | smallint | YES | - |
| is_favorite | boolean | NO | `false` |
| is_blacklisted | boolean | NO | `false` |
| notes | text | YES | - |
| image_url | text | YES | - |
| created_at | timestamptz | NO | `now()` |
| updated_at | timestamptz | NO | `now()` |
| deleted | boolean | NO | `false` |

Constraints:
- PK: `id`
- FK: `user_id -> auth.users.id`
- FK: `venue_id -> venues.id`
- Check: `personal_rating IS NULL OR (personal_rating BETWEEN 1 AND 5)`

---

## Table: `meal_logs`

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | `gen_random_uuid()` |
| user_id | uuid | NO | - |
| venue_id | uuid | YES | - |
| meal_type | text | NO | - |
| total_cost | numeric | NO | - |
| overall_rating | smallint | YES | - |
| notes | text | YES | - |
| photos | text[] | YES | `'{}'::text[]` |
| tags | text[] | YES | `'{}'::text[]` |
| logged_at | timestamptz | NO | `now()` |
| created_at | timestamptz | NO | `now()` |
| updated_at | timestamptz | NO | `now()` |
| last_modified | timestamptz | NO | `now()` |
| deleted | boolean | NO | `false` |
| synced | boolean | NO | `false` |

Constraints:
- PK: `id`
- FK: `user_id -> auth.users.id`
- FK: `venue_id -> venues.id`
- Check: `meal_type IN ('delivery','dine_in','ready_made')`
- Check: `overall_rating IS NULL OR (overall_rating BETWEEN 1 AND 5)`

---

## Table: `meal_item_entries`

| Column | Type | Nullable | Default |
|---|---|---|---|
| id | uuid | NO | `gen_random_uuid()` |
| meal_log_id | uuid | NO | - |
| menu_item_id | uuid | YES | - |
| item_name | text | NO | - |
| price | numeric | YES | - |
| quantity | smallint | NO | `1` |
| rating | smallint | YES | - |
| notes | text | YES | - |

Constraints:
- PK: `id`
- FK: `meal_log_id -> meal_logs.id`
- FK: `menu_item_id -> menu_items.id`
- Check: `rating IS NULL OR (rating BETWEEN 1 AND 5)`

---

## Trigger Snapshot

Detected triggers in `public`:

- `venues_updated_at` (BEFORE UPDATE on `venues`)
- `menu_items_updated_at` (BEFORE UPDATE on `menu_items`)
- `meal_logs_updated_at` (BEFORE UPDATE on `meal_logs`)
- `set_shopping_list_timestamps_trigger` (BEFORE UPDATE on `shopping_list`)
- `expiring_items_queue` (AFTER INSERT webhook trigger on `expiring_items_queue`)
