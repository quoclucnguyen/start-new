# Database Documentation Summary

Quick reference for the current Supabase database state.

## Quick Stats

- **Total Tables (`public`)**: 15
- **Authentication Source**: `auth.users`
- **RLS**: Enabled on all 15 tables
- **Primary Keys**: UUID (mostly `gen_random_uuid()`)
- **Latest Migration**: `20260314100418` (`create_diary_tables`)

## Table Overview (Current Rows)

| Domain | Table | Rows | RLS |
|---|---|---:|:---:|
| User | `users` | 1 | ✓ |
| User | `user_settings` | 2 | ✓ |
| Inventory | `food_items` | 7 | ✓ |
| Inventory | `cosmetics` | 0 | ✓ |
| Config | `categories` | 7 | ✓ |
| Config | `storage_locations` | 4 | ✓ |
| Shopping | `shopping_list` | 3 | ✓ |
| Recipes | `recipes` | 1 | ✓ |
| Recipes | `recipe_ingredients` | 1 | ✓ |
| Recipes | `recipe_steps` | 1 | ✓ |
| Notifications | `expiring_items_queue` | 0 | ✓ |
| Diary | `venues` | 2 | ✓ |
| Diary | `menu_items` | 0 | ✓ |
| Diary | `meal_logs` | 4 | ✓ |
| Diary | `meal_item_entries` | 2 | ✓ |

## Key Foreign-Key Paths

```text
auth.users
├── users.id
├── user_settings.user_id
├── food_items.user_id
├── cosmetics.user_id
├── shopping_list.user_id
├── recipes.user_id (nullable)
├── expiring_items_queue.user_id
├── venues.user_id
├── menu_items.user_id
└── meal_logs.user_id

food_items
├── shopping_list.linked_food_item_id (nullable, ON DELETE SET NULL)
└── expiring_items_queue.food_item_id (nullable, ON DELETE CASCADE)

cosmetics
└── expiring_items_queue.cosmetic_id (nullable, ON DELETE CASCADE)

recipes
├── recipe_ingredients.recipe_id (ON DELETE CASCADE)
└── recipe_steps.recipe_id (ON DELETE CASCADE)

venues
├── menu_items.venue_id
└── meal_logs.venue_id (nullable)

meal_logs
└── meal_item_entries.meal_log_id (ON DELETE CASCADE)

menu_items
└── meal_item_entries.menu_item_id (nullable)
```

## RLS Snapshot (Important)

- RLS is enabled everywhere, but policies are **not uniform**.
- Tightly user-scoped (`auth.uid()` checks):
  - `cosmetics`, `venues`, `menu_items`, `meal_logs`, `meal_item_entries`, recipe child tables
- More permissive `ALL`-style policies currently exist on:
  - `users`, `user_settings`, `food_items`, `shopping_list`, `expiring_items_queue`
- Config tables (`categories`, `storage_locations`) are open to `authenticated` role by policy.

## Trigger Snapshot

- `venues_updated_at` (BEFORE UPDATE on `venues`)
- `menu_items_updated_at` (BEFORE UPDATE on `menu_items`)
- `meal_logs_updated_at` (BEFORE UPDATE on `meal_logs`)
- `set_shopping_list_timestamps_trigger` (BEFORE UPDATE on `shopping_list`)
- `expiring_items_queue` (AFTER INSERT webhook trigger)

## Migration History

| Date | Version | Migration |
|---|---|---|
| 2025-12-02 | 20251202084037 | create_cosmetics_table |
| 2025-12-02 | 20251202084058 | create_expiring_items_queue_table |
| 2026-02-26 | 20260226070915 | create_shopping_list_table |
| 2026-02-26 | 20260226090820 | create_recipe_management_tables |
| 2026-03-14 | 20260314100418 | create_diary_tables |

## Documentation Map

- `README.md` — high-level overview
- `schema.md` — detailed table schema reference
- `relationships.md` — FK matrix + cardinality + referential actions
- `diagram.md` — ER diagram (Mermaid)
- `migrations.md` — migration-by-migration details

---

**Last Updated**: 2026-04-01 (from Supabase MCP)
