# Database Migration History

Complete history of database migrations applied to the Food Inventory Manager database.

## Migration Summary

| Version | Date | Name | Description |
|---------|------|------|-------------|
| 20251202084037 | 2025-12-02 | create_cosmetics_table | Added cosmetics inventory tracking |
| 20251202084058 | 2025-12-02 | create_expiring_items_queue_table | Added notification queue for expiry alerts |
| 20260226070915 | 2026-02-26 | create_shopping_list_table | Added shopping list functionality |
| 20260226090820 | 2026-02-26 | create_recipe_management_tables | Added recipe management features |

## Migration Details

### 20251202084037: create_cosmetics_table

**Applied**: December 2, 2025
**Description**: Initial cosmetics inventory management

**Features**:
- Cosmetics table with brand, category, and expiry tracking
- Opened date tracking for PAO (Period After Opening) calculations
- Status field for product lifecycle management
- Image support for product identification
- RLS enabled for user data isolation

**Key Fields**:
- `brand` - Manufacturer/brand name
- `category` - Product categorization
- `expiry_date` - Shelf life tracking
- `opened_date` - For PAO calculations
- `status` - Product lifecycle status

---

### 20251202084058: create_expiring_items_queue_table

**Applied**: December 2, 2025
**Description**: Queue system for Telegram notifications

**Features**:
- Notification queue for both food and cosmetics
- Priority-based notification system (urgent/high/medium/low)
- Status tracking (pending/processing/sent/failed)
- Scheduled and processed timestamps
- Telegram chat_id integration
- Flexible item referencing (food or cosmetics)

**Key Fields**:
- `notification_priority` - Priority classification
- `status` - Processing state tracking
- `scheduled_at` - Planned notification time
- `processed_at` - Actual execution time
- `food_item_id` / `cosmetic_id` - Polymorphic item reference

**Business Logic**:
- Items are queued based on expiry proximity
- Priority calculated from days_until_expiry
- Supports both food and cosmetic expiry notifications
- Timezone-aware (Asia/Ho_Chi_Minh)

---

### 20260226070915: create_shopping_list_table

**Applied**: February 26, 2026
**Description**: Shopping list management with inventory integration

**Features**:
- Shopping list items with quantities and units
- Optional linking to food inventory items
- Purchase completion tracking
- Category-based organization
- Soft delete and sync status
- Purchase timestamp tracking

**Key Fields**:
- `linked_food_item_id` - Optional link to inventory
- `checked` - Purchase completion flag
- `purchased_at` - Purchase timestamp
- `quantity` / `unit` - Amount measurements
- `deleted` / `synced` - Soft delete and sync tracking

**Business Logic**:
- Can link to existing food items for easy restocking
- Supports both standalone items and inventory-linked items
- Purchase history tracking
- Category-based organization for efficient shopping

---

### 20260226090820: create_recipe_management_tables

**Applied**: February 26, 2026
**Description**: Complete recipe management system

**Features**:
- Recipe metadata management
- Ingredient lists with quantities and units
- Step-by-step instructions with time estimates
- Recipe categorization and tagging
- User and system recipe support
- Difficulty and time tracking
- Soft delete and sync status

**Tables Created**:
1. **recipes** - Main recipe table
2. **recipe_ingredients** - Ingredient lists
3. **recipe_steps** - Preparation instructions

**Key Fields (recipes)**:
- `prep_time_minutes` / `cook_time_minutes` - Time estimates
- `difficulty` - easy/medium/hard classification
- `servings` - Yield information
- `tags` - Categorization array
- `visibility` - private/shared access
- `source` - system/user origin

**Key Fields (recipe_ingredients)**:
- `normalized_name` - For ingredient matching
- `optional` - Optional ingredient flag
- `sort_order` - Display sequence

**Key Fields (recipe_steps)**:
- `step_number` - Sequential ordering
- `estimated_minutes` - Per-step time estimates

**Business Logic**:
- Recipes can be user-created or system-provided
- Ingredients support optional flags and ordering
- Steps are sequential with time estimates
- Tag-based categorization for discoverability
- Can link ingredients to inventory for meal planning

## Pre-Migration Tables

The following tables existed before the migration history tracking began:

### Core Authentication & User Management
- **users** - User profiles with Telegram integration
- **user_settings** - User preferences and API keys

### Inventory Management
- **food_items** - Main food inventory with expiry tracking
- **categories** - Configurable food categories
- **storage_locations** - Configurable storage locations

These tables were part of the initial database schema.

## Migration Patterns

### Common Patterns

**Timestamps**:
- `created_at` - Record creation time
- `updated_at` - Last modification time
- Timezone: Most tables use UTC, some use Asia/Ho_Chi_Minh

**Soft Delete**:
- `deleted` boolean flag
- `last_modified` timestamp for sync

**Sync Status**:
- `synced` boolean flag
- Supports offline-first functionality

**UUID Primary Keys**:
- All tables use UUID primary keys
- Default: `gen_random_uuid()`

**RLS Enabled**:
- All tables have Row Level Security
- User data isolation enforced

### Naming Conventions

- **Snake case**: All column names use snake_case
- **Foreign keys**: `{table}_{column}_id` pattern
- **Timestamps**: Past tense (`created_at`, `updated_at`)
- **Booleans**: Descriptive names (`deleted`, `synced`, `checked`)

## Future Migration Considerations

When planning new migrations:

1. **Timezone Consistency**: Decide on UTC vs Asia/Ho_Chi_Minh for new tables
2. **Soft Delete Pattern**: Consider adding `deleted` flag to new tables
3. **Sync Support**: Add `synced` flag if offline support is needed
4. **RLS Policies**: All new tables need RLS policies
5. **Foreign Key Actions**: Consider CASCADE vs NO ACTION for relationships
6. **Index Requirements**: Add indexes for frequently queried columns

## Rollback Considerations

Migrations in this schema use `NO ACTION` for foreign keys:
- Rolling back requires explicit cleanup of child records
- Consider migration scripts for safe rollbacks
- Test rollback procedures in development environment
