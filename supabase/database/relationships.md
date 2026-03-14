# Table Relationships and Foreign Keys

Documentation of all table relationships and foreign key constraints in the database.

## Entity Relationship Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         auth.users                              │
│                    (Supabase Auth)                              │
└─────────┬───────────────────────────────────────────────────────┘
          │
          │ 1:1
          │
    ┌─────┴─────┬───────────────┬───────────────┬──────────────┐
    │           │               │               │              │
    ▼           ▼               ▼               ▼              ▼
┌─────────┐ ┌──────────┐ ┌──────────────┐ ┌──────────┐ ┌─────────────┐
│ users   │ │user_     │ │ food_items   │ │shopping_ │ │  recipes    │
│         │ │settings  │ │              │ │  list    │ │             │
└─────────┘ └──────────┘ └──────┬───────┘ └────┬─────┘ └──────┬──────┘
                                  │               │              │
                                  │               │              │
                           1:N              N:1              1:N
                                  │               │              │
                                  ▼               │              │
                          ┌───────────────┐       │              │
                          │expiring_items │       │              │
                          │    _queue     │       │              │
                          └───────┬───────┘       │              │
                                  │                │              │
                                  │                │              │
                               1:N                │              │
                                  │                │              │
                                  ▼                │              │
                          ┌───────────────┐       │              │
                          │   cosmetics   │       │              │
                          └───────────────┘       │              │
                                                   │              │
                                                   │              │
                                        1:N         │         1:N  │
                                                   │              │
                                                   ▼              ▼
                                          ┌──────────────┐ ┌──────────────┐
                                          │recipe_       │ │recipe_       │
                                          │ingredients  │ │  steps       │
                                          └──────────────┘ └──────────────┘
```

## Foreign Key Relationships

### Authentication Relationships

#### users → auth.users
- **Type**: 1:1
- **Foreign Key**: `users.id` → `auth.users.id`
- **Description**: Links user profile to Supabase authentication record
- **Cascading**: None specified

#### user_settings → auth.users
- **Type**: 1:1
- **Foreign Key**: `user_settings.user_id` → `auth.users.id`
- **Description**: Each user has one settings record
- **Unique**: `user_id` is unique

### Content Relationships

#### food_items → auth.users
- **Type**: N:1
- **Foreign Key**: `food_items.user_id` → `auth.users.id`
- **Description**: Each food item belongs to one user
- **RLS**: Users can only see their own items

#### cosmetics → auth.users
- **Type**: N:1
- **Foreign Key**: `cosmetics.user_id` → `auth.users.id`
- **Description**: Each cosmetic item belongs to one user
- **RLS**: Users can only see their own items

#### shopping_list → auth.users
- **Type**: N:1
- **Foreign Key**: `shopping_list.user_id` → `auth.users.id`
- **Description**: Each shopping list item belongs to one user
- **RLS**: Users can only see their own items

#### recipes → auth.users
- **Type**: N:1 (nullable)
- **Foreign Key**: `recipes.user_id` → `auth.users.id`
- **Description**: Each recipe belongs to one user or is a system recipe
- **Note**: `user_id` can be null for system recipes

### Shopping List Integration

#### shopping_list → food_items
- **Type**: N:1 (optional)
- **Foreign Key**: `shopping_list.linked_food_item_id` → `food_items.id`
- **Description**: Shopping list items can be linked to food inventory items
- **Nullable**: `linked_food_item_id` can be null

### Expiry Notification Relationships

#### expiring_items_queue → auth.users
- **Type**: N:1
- **Foreign Key**: `expiring_items_queue.user_id` → `auth.users.id`
- **Description**: Each queued notification belongs to one user

#### expiring_items_queue → food_items
- **Type**: N:1 (optional)
- **Foreign Key**: `expiring_items_queue.food_item_id` → `food_items.id`
- **Description**: Queue entries can reference food items
- **Nullable**: `food_item_id` can be null

#### expiring_items_queue → cosmetics
- **Type**: N:1 (optional)
- **Foreign Key**: `expiring_items_queue.cosmetic_id` → `cosmetics.id`
- **Description**: Queue entries can reference cosmetic items
- **Nullable**: `cosmetic_id` can be null

### Recipe Relationships

#### recipe_ingredients → recipes
- **Type**: N:1
- **Foreign Key**: `recipe_ingredients.recipe_id` → `recipes.id`
- **Description**: Each ingredient belongs to one recipe
- **Ordering**: `sort_order` field for display sequence

#### recipe_steps → recipes
- **Type**: N:1
- **Foreign Key**: `recipe_steps.recipe_id` → `recipes.id`
- **Description**: Each step belongs to one recipe
- **Ordering**: `step_number` field for sequence

## Relationship Patterns

### 1:1 Relationships (One-to-One)
- `users` ↔ `auth.users`
- `user_settings` ↔ `auth.users`

These relationships typically have a unique constraint on the foreign key.

### N:1 Relationships (Many-to-One)
- `food_items` → `auth.users`
- `cosmetics` → `auth.users`
- `shopping_list` → `auth.users`
- `recipes` → `auth.users`
- `recipe_ingredients` → `recipes`
- `recipe_steps` → `recipes`
- `expiring_items_queue` → `auth.users`

These represent "has many" relationships from the parent perspective.

### Optional Relationships (Nullable Foreign Keys)
- `shopping_list.linked_food_item_id` → `food_items.id`
- `recipes.user_id` → `auth.users.id`
- `expiring_items_queue.food_item_id` → `food_items.id`
- `expiring_items_queue.cosmetic_id` → `cosmetics.id`

These relationships are optional and can be null.

## Cascade Behavior

All foreign keys in this schema use the default `NO ACTION` for referential actions. This means:
- **Deletes**: Will fail if child records exist
- **Updates**: Will fail if parent key is referenced

This ensures data integrity by preventing orphaned records.

## Row Level Security (RLS)

All tables have RLS enabled, which means:
- Users can only access their own data
- The `user_id` column is used in RLS policies
- System recipes (with null `user_id`) are accessible to all users
- Foreign key relationships are enforced within the user's data scope

## Data Isolation

The schema enforces complete data isolation between users:
- Every user-specific table has a `user_id` foreign key
- RLS policies filter by `user_id`
- Cross-user data access is prevented at the database level
