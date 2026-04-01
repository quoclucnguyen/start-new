# Database Migration History

Complete history of migrations currently present in the Supabase project.

## Migration Summary

| Version | Date | Name | Description |
|---|---|---|---|
| 20251202084037 | 2025-12-02 | create_cosmetics_table | Added cosmetics inventory tracking |
| 20251202084058 | 2025-12-02 | create_expiring_items_queue_table | Added expiry notification queue |
| 20260226070915 | 2026-02-26 | create_shopping_list_table | Added shopping list domain |
| 20260226090820 | 2026-02-26 | create_recipe_management_tables | Added recipes + ingredients + steps |
| 20260314100418 | 2026-03-14 | create_diary_tables | Added food diary tables (venues, menu items, meal logs, meal item entries) |

## Migration Details

### 20251202084037 — `create_cosmetics_table`

Added `public.cosmetics`:
- User-scoped cosmetics inventory
- Expiry/opened-date tracking
- Basic status and image support

---

### 20251202084058 — `create_expiring_items_queue_table`

Added `public.expiring_items_queue`:
- Queue rows for expiry notification processing
- Optional links to `food_items` or `cosmetics`
- Priority/status workflow fields

---

### 20260226070915 — `create_shopping_list_table`

Added `public.shopping_list`:
- Shopping items with quantity/unit/category
- Optional back-reference to inventory item (`linked_food_item_id`)
- Soft delete and sync metadata

---

### 20260226090820 — `create_recipe_management_tables`

Added recipe domain:
- `public.recipes`
- `public.recipe_ingredients`
- `public.recipe_steps`

Features:
- User or system recipe support
- Difficulty/serving/time metadata
- Ordered ingredients and ordered steps

---

### 20260314100418 — `create_diary_tables`

Added diary domain:
- `public.venues`
- `public.menu_items`
- `public.meal_logs`
- `public.meal_item_entries`

Features:
- Venue memory with status/tags/notes
- Menu item memory with rating/favorite flags
- Meal logging with meal type and optional venue
- Itemized meal entries linked to meal logs
- Trigger-based `updated_at`/`last_modified` maintenance on key diary tables

## Pre-Migration Baseline Tables

These tables existed before tracked migration history in this folder:

- `users`
- `user_settings`
- `food_items`
- `categories`
- `storage_locations`

## Notes on Referential Actions

The current schema uses mixed referential actions (not all `NO ACTION`):

- `CASCADE` examples:
  - `recipe_ingredients.recipe_id -> recipes.id`
  - `recipe_steps.recipe_id -> recipes.id`
  - `meal_item_entries.meal_log_id -> meal_logs.id`
  - `expiring_items_queue.food_item_id -> food_items.id`
  - `expiring_items_queue.cosmetic_id -> cosmetics.id`
- `SET NULL` example:
  - `shopping_list.linked_food_item_id -> food_items.id`

Refer to [relationships.md](./relationships.md) for the full matrix.
