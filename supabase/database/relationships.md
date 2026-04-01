# Table Relationships and Foreign Keys

Documentation of foreign keys, cardinality, and referential actions in `public` schema.

## Relationship Overview

### Auth-linked tables (`auth.users`)

- `users.id -> auth.users.id` (1:1)
- `user_settings.user_id -> auth.users.id` (1:1 by unique constraint)
- `food_items.user_id -> auth.users.id` (N:1)
- `cosmetics.user_id -> auth.users.id` (N:1)
- `shopping_list.user_id -> auth.users.id` (N:1)
- `recipes.user_id -> auth.users.id` (N:1, nullable)
- `expiring_items_queue.user_id -> auth.users.id` (N:1)
- `venues.user_id -> auth.users.id` (N:1)
- `menu_items.user_id -> auth.users.id` (N:1)
- `meal_logs.user_id -> auth.users.id` (N:1)

### Intra-domain relationships

- `shopping_list.linked_food_item_id -> food_items.id` (N:1, nullable)
- `expiring_items_queue.food_item_id -> food_items.id` (N:1, nullable)
- `expiring_items_queue.cosmetic_id -> cosmetics.id` (N:1, nullable)

- `recipe_ingredients.recipe_id -> recipes.id` (N:1)
- `recipe_steps.recipe_id -> recipes.id` (N:1)

- `menu_items.venue_id -> venues.id` (N:1)
- `meal_logs.venue_id -> venues.id` (N:1, nullable)
- `meal_item_entries.meal_log_id -> meal_logs.id` (N:1)
- `meal_item_entries.menu_item_id -> menu_items.id` (N:1, nullable)

## Full FK Matrix (with referential actions)

| Source | Target | On Update | On Delete |
|---|---|---|---|
| `users.id` | `auth.users.id` | NO ACTION | NO ACTION |
| `user_settings.user_id` | `auth.users.id` | NO ACTION | NO ACTION |
| `food_items.user_id` | `auth.users.id` | NO ACTION | NO ACTION |
| `cosmetics.user_id` | `auth.users.id` | NO ACTION | CASCADE |
| `shopping_list.user_id` | `auth.users.id` | NO ACTION | NO ACTION |
| `recipes.user_id` | `auth.users.id` | NO ACTION | CASCADE |
| `expiring_items_queue.user_id` | `auth.users.id` | NO ACTION | CASCADE |
| `venues.user_id` | `auth.users.id` | NO ACTION | NO ACTION |
| `menu_items.user_id` | `auth.users.id` | NO ACTION | NO ACTION |
| `meal_logs.user_id` | `auth.users.id` | NO ACTION | NO ACTION |
| `shopping_list.linked_food_item_id` | `food_items.id` | NO ACTION | SET NULL |
| `expiring_items_queue.food_item_id` | `food_items.id` | NO ACTION | CASCADE |
| `expiring_items_queue.cosmetic_id` | `cosmetics.id` | NO ACTION | CASCADE |
| `recipe_ingredients.recipe_id` | `recipes.id` | NO ACTION | CASCADE |
| `recipe_steps.recipe_id` | `recipes.id` | NO ACTION | CASCADE |
| `menu_items.venue_id` | `venues.id` | NO ACTION | NO ACTION |
| `meal_logs.venue_id` | `venues.id` | NO ACTION | NO ACTION |
| `meal_item_entries.meal_log_id` | `meal_logs.id` | NO ACTION | CASCADE |
| `meal_item_entries.menu_item_id` | `menu_items.id` | NO ACTION | NO ACTION |

## Cardinality Notes

### One-to-one patterns

- `users` ↔ `auth.users`
- `user_settings` ↔ `auth.users` (enforced via unique `user_id`)

### One-to-many patterns

- `auth.users` → most user-owned domain tables
- `recipes` → `recipe_ingredients`, `recipe_steps`
- `venues` → `menu_items`, `meal_logs`
- `meal_logs` → `meal_item_entries`

### Optional relationships

- `recipes.user_id` (system recipes allowed)
- `shopping_list.linked_food_item_id`
- `expiring_items_queue.food_item_id`
- `expiring_items_queue.cosmetic_id`
- `meal_logs.venue_id`
- `meal_item_entries.menu_item_id`

## Non-FK references (logical only)

These columns are string references without DB-level FK constraints:

- `food_items.category` (logical reference to `categories.name`)
- `food_items.storage` (logical reference to `storage_locations.name`)

## RLS Notes (current state)

- RLS is enabled on all 15 public tables.
- Policy strictness differs by table:
  - User-owned tables such as `cosmetics`, diary tables, and recipe child tables use `auth.uid()`-scoped checks.
  - Some tables currently have permissive `ALL` policies (`users`, `user_settings`, `food_items`, `shopping_list`, `expiring_items_queue`).
  - Config tables (`categories`, `storage_locations`) are open to `authenticated` role by policy.
