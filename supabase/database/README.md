# Food Inventory Manager - Database Structure

This directory contains the Supabase/PostgreSQL database documentation for the Food Inventory Manager Telegram Mini App.

## Overview

- Database: PostgreSQL (Supabase)
- Primary schema: `public`
- Auth source: `auth.users`
- Row Level Security (RLS): enabled on all `public` tables
- Table count (current): **15 tables**

> Notes:
> - RLS is enabled everywhere, but policy strictness differs by table (some are tightly user-scoped, some are permissive for authenticated/public roles).
> - Timestamp defaults are mixed (mostly `now()`, with `Asia/Ho_Chi_Minh` defaults on selected inventory/notification columns).

## Database Tables

### Core User Data
- **users** - User profiles linked 1:1 to `auth.users`
- **user_settings** - User preferences and API keys

### Inventory & Configuration
- **food_items** - Food inventory with expiry tracking
- **cosmetics** - Cosmetic inventory with expiry tracking
- **categories** - Global category configuration
- **storage_locations** - Global storage-location configuration

### Shopping & Recipes
- **shopping_list** - Shopping list items (optional link to inventory)
- **recipes** - Recipe metadata
- **recipe_ingredients** - Recipe ingredients
- **recipe_steps** - Recipe instructions

### Notifications
- **expiring_items_queue** - Expiry notification queue for Telegram/webhook processing

### Food Diary
- **venues** - Places/restaurants user has logged
- **menu_items** - Dishes for each venue
- **meal_logs** - User meal logs (delivery/dine-in/ready-made)
- **meal_item_entries** - Per-meal itemized dish entries

## Documentation Files

- [schema.md](./schema.md) - Detailed table schemas
- [relationships.md](./relationships.md) - Foreign keys, cardinality, and delete/update behavior
- [diagram.md](./diagram.md) - ER diagram (Mermaid)
- [migrations.md](./migrations.md) - Migration history
- [summary.md](./summary.md) - Quick reference snapshot

## Current Snapshot (from Supabase MCP)

- **Total Tables**: 15 (`public`)
- **RLS Enabled**: 15/15 tables
- **Latest Migration**: `20260314100418` (`create_diary_tables`)
