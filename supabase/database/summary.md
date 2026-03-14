# Database Documentation Summary

Quick reference guide for the Food Inventory Manager database.

## Quick Stats

- **Total Tables**: 11
- **Primary Schema**: public
- **Authentication**: Supabase Auth (auth.users)
- **RLS**: Enabled on all tables
- **Primary Keys**: UUID with gen_random_uuid()
- **Current Migration**: 20260226090820

## Table Overview

### User Management
| Table | Purpose | Rows | RLS |
|-------|---------|------|-----|
| users | User profiles with Telegram | 1 | ✓ |
| user_settings | Preferences & API keys | 2 | ✓ |

### Inventory
| Table | Purpose | Rows | RLS |
|-------|---------|------|-----|
| food_items | Food inventory with expiry | 7 | ✓ |
| cosmetics | Cosmetics inventory | 0 | ✓ |
| categories | Food categories config | 7 | ✓ |
| storage_locations | Storage locations config | 4 | ✓ |

### Shopping & Recipes
| Table | Purpose | Rows | RLS |
|-------|---------|------|-----|
| shopping_list | Shopping list items | 3 | ✓ |
| recipes | Recipe management | 1 | ✓ |
| recipe_ingredients | Recipe ingredients | 1 | ✓ |
| recipe_steps | Recipe instructions | 1 | ✓ |

### Notifications
| Table | Purpose | Rows | RLS |
|-------|---------|------|-----|
| expiring_items_queue | Telegram notification queue | 0 | ✓ |

## Key Foreign Keys

```
auth.users (Supabase Auth)
├── users.id
├── user_settings.user_id
├── food_items.user_id
├── cosmetics.user_id
├── shopping_list.user_id
├── recipes.user_id (nullable)
└── expiring_items_queue.user_id

food_items
└── shopping_list.linked_food_item_id (nullable)
└── expiring_items_queue.food_item_id (nullable)

cosmetics
└── expiring_items_queue.cosmetic_id (nullable)

recipes
├── recipe_ingredients.recipe_id
└── recipe_steps.recipe_id
```

## Common Patterns

### Standard Columns
- `id` - UUID primary key (gen_random_uuid())
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp
- `user_id` - Foreign key to auth.users

### Soft Delete Pattern
- `deleted` - boolean flag
- `last_modified` - timestamp for sync

### Sync Status
- `synced` - boolean for offline-first

### Timezones
- **UTC**: Most tables
- **Asia/Ho_Chi_Minh**: food_items, expiring_items_queue

## Data Types

| Type | Usage | Examples |
|------|-------|----------|
| uuid | Primary keys, Foreign keys | id, user_id |
| text | Strings | name, email, category |
| bigint | Large integers | telegram_id, chat_id |
| numeric | Precise decimals | quantity |
| integer | Whole numbers | sort_order, step_number |
| date | Calendar dates | expiration_date, purchase_date |
| timestamptz | Timestamps with timezone | created_at, updated_at |
| boolean | True/False flags | deleted, synced, checked |
| jsonb | JSON data | user_settings.preferences |
| text[] | String arrays | recipes.tags |

## Constraints

### Check Constraints
- `recipes.cook_time_minutes > 0`
- `recipes.servings > 0`
- `recipes.difficulty IN ('easy', 'medium', 'hard')`
- `recipes.visibility IN ('private', 'shared')`
- `recipes.source IN ('system', 'user')`
- `recipe_steps.step_number > 0`
- `expiring_items_queue.notification_priority IN ('urgent', 'high', 'medium', 'low')`
- `expiring_items_queue.status IN ('pending', 'processing', 'sent', 'failed')`

### Unique Constraints
- `users.telegram_id`
- `users.email`
- `user_settings.user_id`

### Default Values
- UUIDs: `gen_random_uuid()`
- Timestamps: `now()`
- Booleans: `false` or `true`
- Arrays: `'{}'::text[]`
- Text: Specific defaults per column

## Indexes (Implied)

Based on foreign keys and unique constraints, these indexes should exist:

```sql
-- Primary keys (automatic)
ALL_TABLES.id

-- Foreign keys (automatic)
food_items.user_id
cosmetics.user_id
shopping_list.user_id
recipes.user_id
expiring_items_queue.user_id
recipe_ingredients.recipe_id
recipe_steps.recipe_id
shopping_list.linked_food_item_id
expiring_items_queue.food_item_id
expiring_items_queue.cosmetic_id

-- Unique constraints
users.telegram_id
users.email
user_settings.user_id
```

## Migration History

| Date | Version | Migration |
|------|---------|-----------|
| 2025-12-02 | 20251202084037 | create_cosmetics_table |
| 2025-12-02 | 20251202084058 | create_expiring_items_queue_table |
| 2026-02-26 | 20260226070915 | create_shopping_list_table |
| 2026-02-26 | 20260226090820 | create_recipe_management_tables |

## Documentation Files

- **README.md** - Overview and introduction
- **schema.md** - Detailed table schemas
- **relationships.md** - Table relationships and foreign keys
- **migrations.md** - Migration history
- **diagram.md** - Visual entity relationship diagram
- **summary.md** - This quick reference guide

## Query Patterns

### Get user's food items
```sql
SELECT * FROM food_items WHERE user_id = ? AND deleted = false;
```

### Get expiring items for notification
```sql
SELECT * FROM expiring_items_queue
WHERE user_id = ? AND status = 'pending'
ORDER BY notification_priority DESC;
```

### Get recipe with ingredients and steps
```sql
SELECT r.*, ri.*, rs.*
FROM recipes r
LEFT JOIN recipe_ingredients ri ON r.id = ri.recipe_id
LEFT JOIN recipe_steps rs ON r.id = rs.recipe_id
WHERE r.id = ?;
```

### Get shopping list with linked food items
```sql
SELECT sl.*, fi.name as food_item_name
FROM shopping_list sl
LEFT JOIN food_items fi ON sl.linked_food_item_id = fi.id
WHERE sl.user_id = ? AND sl.deleted = false;
```

## Common Operations

### Create new food item
```sql
INSERT INTO food_items (
  user_id, name, quantity, unit, expiration_date, category
) VALUES (?, ?, ?, ?, ?, ?);
```

### Update item quantity
```sql
UPDATE food_items
SET quantity = ?, updated_at = now()
WHERE id = ? AND user_id = ?;
```

### Soft delete item
```sql
UPDATE food_items
SET deleted = true, last_modified = now()
WHERE id = ? AND user_id = ?;
```

### Add recipe ingredient
```sql
INSERT INTO recipe_ingredients (
  recipe_id, name, normalized_name, quantity, unit, sort_order
) VALUES (?, ?, ?, ?, ?, ?);
```

## Security Notes

- **RLS**: All tables have Row Level Security enabled
- **User Isolation**: Users can only access their own data
- **System Recipes**: Recipes with null user_id are accessible to all
- **Foreign Keys**: Enforced at database level
- **Cascade Deletes**: Not used (NO ACTION default)

## Performance Considerations

- Index on foreign keys (automatic)
- Consider indexes on:
  - `food_items.expiration_date` for expiry queries
  - `food_items.category` for filtering
  - `food_items.storage` for filtering
  - `expiring_items_queue.status` for queue processing
  - `recipes.tags` for recipe search
  - `recipes.difficulty` for filtering

## Data Integrity

- All tables have primary keys
- Foreign keys ensure referential integrity
- Check constraints validate data
- Unique constraints prevent duplicates
- RLS policies enforce user isolation
- Timezone-aware timestamps

---

**Last Updated**: 2026-03-14
**Database Version**: PostgreSQL (Supabase)
**Documentation**: Supabase MCP Tools
