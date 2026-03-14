# Database Entity Relationship Diagram

Visual representation of the Food Inventory Manager database structure.

## Legend

```
┌─────────────────┐
│   Table Name    │
├─────────────────┤
│ PK  primary_key │
│ FK  foreign_key │
│    column_name  │
└─────────────────┘

     │
     │ Relationship
     │
     ▼

  1:1  = One-to-One
  1:N  = One-to-Many
  N:1  = Many-to-One
  ?    = Optional (nullable)
```

## Complete Database Schema

```
                    ┌─────────────────┐
                    │   auth.users    │
                    │ (Supabase Auth) │
                    └────────┬────────┘
                             │
           ┌─────────────────┼─────────────────┐
           │                 │                 │
           │ 1:1             │ 1:N             │ 1:N
           │                 │                 │
           ▼                 ▼                 ▼
    ┌─────────────┐  ┌──────────────┐  ┌──────────────┐
    │    users    │  │ user_settings│  │ food_items   │
    ├─────────────┤  ├──────────────┤  ├──────────────┤
    │ PK id       │  │ PK id        │  │ PK id        │
    │    telegram │  │ FK user_id   │  │ FK user_id   │
    │    chat_id  │  │    gemini_   │  │    name      │
    │    email    │  │    api_key   │  │    quantity  │
    │    first_   │  │    preferen  │  │    unit      │
    │    last_    │  └──────────────┘  │    expiratio │
    │    username │                     │    category  │
    │    last_log │                     │    storage   │
    │    created  │                     │    image_url │
    │    updated  │                     │    purchase  │
    └─────────────┘                     │    notes     │
                                         │    created  │
                                         │    updated  │
                                         │    last_mod │
                                         │    deleted  │
                                         │    synced   │
                                         └──────┬───────┘
                                                │
                                                │ 1:N
                                                │
                                                ▼
                                         ┌──────────────────┐
                                         │expiring_items_   │
                                         │     queue        │
                                         ├──────────────────┤
                                         │ PK id            │
                                         │ FK user_id       │
                                         │    chat_id       │
                                         │ FK food_item_id ?│
                                         │ FK cosmetic_id  ?│
                                         │    item_name     │
                                         │    quantity      │
                                         │    unit          │
                                         │    expiration    │
                                         │    category      │
                                         │    days_until    │
                                         │    notific_prior │
                                         │    status        │
                                         │    scheduled_at  │
                                         │    processed_at  │
                                         │    created_at    │
                                         │    updated_at    │
                                         └──────────────────┘

    ┌─────────────┐                ┌──────────────┐
    │ cosmetics   │                │ shopping_list│
    ├─────────────┤                ├──────────────┤
    │ PK id       │                │ PK id        │
    │ FK user_id  │                │ FK user_id   │
    │    name     │                │    name      │
    │    brand    │                │    category  │
    │    category │                │    quantity  │
    │    expiry   │                │    unit      │
    │    opened   │                │    checked   │
    │    status   │                │ FK linked_   │
    │    image    │                │    food_item?│
    │    notes    │                │    notes     │
    │    created  │                │    purchased │
    │    updated  │                │    created   │
    └──────┬──────┘                │    updated   │
           │                       │    last_mod  │
           │ 1:N                   │    deleted   │
           │                       │    synced    │
           ▼                       └──────────────┘
    ┌──────────────────┐
    │expiring_items_   │
    │     queue        │
    │ (cosmetic_id FK) │
    └──────────────────┘

    ┌───────────────────────────────────┐
    │           recipes                 │
    ├───────────────────────────────────┤
    │ PK id                             │
    │ FK user_id ?                      │
    │    title                          │
    │    description                    │
    │    image_url                      │
    │    prep_time_minutes              │
    │    cook_time_minutes              │
    │    difficulty                     │
    │    servings                       │
    │    tags                           │
    │    visibility                     │
    │    source                         │
    │    created_at                     │
    │    updated_at                     │
    │    last_modified                  │
    │    deleted                        │
    │    synced                         │
    └────────┬──────────────────────────┘
             │
     ┌───────┴────────┐
     │                │
     │ 1:N            │ 1:N
     │                │
     ▼                ▼
┌──────────────┐  ┌──────────────┐
│recipe_       │  │recipe_steps  │
│ingredients   │  ├──────────────┤
├──────────────┤  │ PK id        │
│ PK id        │  │ FK recipe_id │
│ FK recipe_id │  │    step_num  │
│    name      │  │    instruct  │
│    normalized│  │    estimated │
│    quantity  │  │    created   │
│    unit      │  └──────────────┘
│    optional  │
│    sort_order│
│    created   │
└──────────────┘

    ┌─────────────┐       ┌──────────────────┐
    │ categories  │       │storage_locations │
    ├─────────────┤       ├──────────────────┤
    │ PK id       │       │ PK id            │
    │    name     │       │    name          │
    │    icon     │       │    icon          │
    │    color    │       │    color         │
    │    show_in_ │       │    show_in_      │
    │    filters  │       │    filters       │
    │    sort_ord │       │    sort_order    │
    │    created  │       │    created       │
    └─────────────┘       └──────────────────┘
```

## Relationship Summary

### Core User Data
- **auth.users** (Supabase Auth)
  - 1:1 → **users** (profile data)
  - 1:1 → **user_settings** (preferences)
  - 1:N → **food_items** (inventory)
  - 1:N → **cosmetics** (inventory)
  - 1:N → **shopping_list** (items)
  - 1:N → **recipes** (created recipes)
  - 1:N → **expiring_items_queue** (notifications)

### Inventory Management
- **food_items** → **expiring_items_queue** (expiry notifications)
- **cosmetics** → **expiring_items_queue** (expiry notifications)
- **shopping_list** → **food_items** (optional inventory linking)

### Recipe Management
- **recipes** → **recipe_ingredients** (has many ingredients)
- **recipes** → **recipe_steps** (has many steps)

### Configuration Data
- **categories** (standalone, referenced by food_items.category)
- **storage_locations** (standalone, referenced by food_items.storage)

## Key Design Patterns

### User Isolation
- All user data tables have `user_id` foreign key
- RLS policies enforce user data isolation
- Complete separation between users' data

### Flexible References
- **expiring_items_queue** can reference either food_items OR cosmetics
- **shopping_list** can optionally reference food_items
- **recipes** can have null user_id for system recipes

### Timestamp Tracking
- Most tables have `created_at` and `updated_at`
- Some tables have additional timestamps (last_modified, processed_at)
- Timezone varies (UTC vs Asia/Ho_Chi_Minh)

### Soft Delete & Sync
- Several tables have `deleted` flag for soft delete
- `synced` flag for offline-first functionality
- `last_modified` for synchronization logic

## Cardinality Notes

### 1:1 Relationships
- users ↔ auth.users
- user_settings ↔ auth.users

### 1:N Relationships
- auth.users → food_items
- auth.users → cosmetics
- auth.users → shopping_list
- auth.users → recipes (when user_id is not null)
- recipes → recipe_ingredients
- recipes → recipe_steps
- food_items → expiring_items_queue
- cosmetics → expiring_items_queue

### Optional Relationships (nullable FKs)
- shopping_list → food_items (linked_food_item_id)
- expiring_items_queue → food_items (food_item_id)
- expiring_items_queue → cosmetics (cosmetic_id)
- recipes → auth.users (user_id - for system recipes)

## Standalone Tables

These tables don't have foreign keys to other tables:
- **categories** - Referenced by food_items.category column (not a FK)
- **storage_locations** - Referenced by food_items.storage column (not a FK)

These are configuration tables that use string references rather than foreign keys for flexibility in user-defined categories and locations.
