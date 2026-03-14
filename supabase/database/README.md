# Food Inventory Manager - Database Structure

This directory contains the documentation for the Supabase database structure used in the Food Inventory Manager Telegram Mini App.

## Overview

The database uses PostgreSQL with Row Level Security (RLS) enabled on all tables to ensure data isolation between users. All user-specific tables reference `auth.users` from Supabase Authentication.

## Database Tables

### Core Tables
- **users** - User profiles and authentication data
- **user_settings** - User preferences and API keys

### Inventory Management
- **food_items** - Food inventory with expiry tracking
- **cosmetics** - Cosmetics inventory with expiry tracking
- **categories** - Configurable food categories
- **storage_locations** - Configurable storage locations

### Shopping & Recipes
- **shopping_list** - Shopping list management
- **recipes** - Recipe management
- **recipe_ingredients** - Recipe ingredients
- **recipe_steps** - Recipe preparation steps

### Notifications
- **expiring_items_queue** - Queue for expiry notifications via Telegram

## Key Features

- **RLS Enabled**: All tables have Row Level Security enabled
- **Timezone**: Uses `Asia/Ho_Chi_Minh` timezone for timestamps
- **Soft Delete**: Some tables use `deleted` flag for soft deletes
- **Sync Status**: Some tables track synchronization status with `synced` flag
- **UUID Primary Keys**: All tables use UUID primary keys with `gen_random_uuid()` defaults

## Documentation Files

- [schema.md](./schema.md) - Detailed table schemas
- [relationships.md](./relationships.md) - Table relationships and foreign keys
- [migrations.md](./migrations.md) - Migration history

## Database Statistics

- **Total Tables**: 11 tables
- **RLS Enabled**: All tables
- **Current Migration**: 20260226090820 (recipe_management_tables)
