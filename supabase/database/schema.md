# Database Schema Documentation

Detailed schema documentation for all tables in the Food Inventory Manager database.

## Table: users

User profiles linked to Supabase Authentication.

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | - | Primary key, references auth.users |
| telegram_id | bigint | NO | - | Telegram user ID (unique) |
| chat_id | bigint | NO | - | Telegram chat ID for notifications |
| email | text | NO | - | User email (unique) |
| first_name | text | YES | - | User's first name |
| last_name | text | YES | - | User's last name |
| username | text | YES | - | Telegram username |
| last_login | timestamptz | YES | - | Last login timestamp |
| created_at | timestamptz | YES | now() | Account creation time |
| updated_at | timestamptz | YES | now() | Last update time |

### Constraints
- Primary Key: `id`
- Foreign Key: `id` → `auth.users.id`
- Unique: `telegram_id`, `email`

---

## Table: user_settings

User preferences and application settings.

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| user_id | uuid | NO | - | References auth.users |
| gemini_api_key | text | YES | - | Gemini API key for AI features |
| preferences | jsonb | YES | '{}'::jsonb | User preferences JSON |
| created_at | timestamptz | YES | now() | Creation time |
| updated_at | timestamptz | YES | now() | Last update time |

### Constraints
- Primary Key: `id`
- Foreign Key: `user_id` → `auth.users.id`
- Unique: `user_id`

---

## Table: food_items

Main food inventory tracking with expiry dates.

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| user_id | uuid | NO | - | References auth.users |
| name | text | NO | - | Food item name |
| quantity | numeric | NO | - | Quantity amount |
| unit | text | NO | - | Unit of measurement |
| expiration_date | date | YES | - | Expiration date |
| category | text | YES | - | Food category |
| storage | text | NO | 'pantry' | Storage location |
| image_url | text | YES | - | Image URL |
| purchase_date | date | YES | - | Purchase date |
| notes | text | YES | - | Additional notes |
| created_at | timestamptz | YES | (now() AT TIME ZONE 'Asia/Ho_Chi_Minh') | Creation time |
| updated_at | timestamptz | YES | now() | Last update time |
| last_modified | timestamptz | YES | now() | Last modification time |
| deleted | boolean | YES | false | Soft delete flag |
| synced | boolean | YES | false | Sync status |

### Constraints
- Primary Key: `id`
- Foreign Key: `user_id` → `auth.users.id`

---

## Table: cosmetics

Cosmetics inventory with expiry tracking.

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| user_id | uuid | NO | - | References auth.users |
| name | text | NO | - | Cosmetic product name |
| brand | text | YES | - | Brand name |
| category | text | YES | - | Cosmetic category |
| expiry_date | date | YES | - | Expiry date |
| opened_date | date | YES | - | Date opened |
| status | text | YES | 'active' | Product status |
| image_url | text | YES | - | Image URL |
| notes | text | YES | - | Additional notes |
| created_at | timestamptz | NO | now() | Creation time |
| updated_at | timestamptz | NO | now() | Last update time |

### Constraints
- Primary Key: `id`
- Foreign Key: `user_id` → `auth.users.id`

---

## Table: categories

Configurable food categories with visual customization.

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| name | text | NO | - | Category name |
| icon | text | NO | '📦' | Icon emoji |
| color | text | NO | '#6b7280' | Display color |
| show_in_filters | boolean | YES | true | Show in filter UI |
| sort_order | integer | NO | 0 | Display order |
| created_at | timestamptz | YES | now() | Creation time |

### Constraints
- Primary Key: `id`

---

## Table: storage_locations

Configurable storage locations with visual customization.

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| name | text | NO | - | Location name |
| icon | text | NO | '📦' | Icon emoji |
| color | text | NO | '#6b7280' | Display color |
| show_in_filters | boolean | YES | true | Show in filter UI |
| sort_order | integer | NO | 0 | Display order |
| created_at | timestamptz | YES | now() | Creation time |

### Constraints
- Primary Key: `id`

---

## Table: shopping_list

Shopping list management with food item linking.

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| user_id | uuid | NO | - | References auth.users |
| name | text | NO | - | Item name |
| category | text | NO | - | Item category |
| quantity | numeric | NO | 1 | Quantity to buy |
| unit | text | NO | 'pieces' | Unit of measurement |
| checked | boolean | NO | false | Purchase completed |
| linked_food_item_id | uuid | YES | - | Links to food_items |
| notes | text | YES | - | Additional notes |
| purchased_at | timestamptz | YES | - | When purchased |
| created_at | timestamptz | NO | now() | Creation time |
| updated_at | timestamptz | NO | now() | Last update time |
| last_modified | timestamptz | NO | now() | Last modification time |
| deleted | boolean | NO | false | Soft delete flag |
| synced | boolean | NO | false | Sync status |

### Constraints
- Primary Key: `id`
- Foreign Key: `user_id` → `auth.users.id`
- Foreign Key: `linked_food_item_id` → `food_items.id`

---

## Table: recipes

Recipe management with metadata and tags.

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| user_id | uuid | YES | - | References auth.users (nullable for system recipes) |
| title | text | NO | - | Recipe title |
| description | text | YES | - | Recipe description |
| image_url | text | YES | - | Recipe image |
| prep_time_minutes | integer | YES | - | Preparation time |
| cook_time_minutes | integer | NO | - | Cooking time (> 0) |
| difficulty | text | NO | - | Difficulty: easy/medium/hard |
| servings | integer | NO | 1 | Number of servings (> 0) |
| tags | text[] | NO | '{}' | Text array of tags |
| visibility | text | NO | 'private' | Visibility: private/shared |
| source | text | NO | 'user' | Source: system/user |
| created_at | timestamptz | NO | now() | Creation time |
| updated_at | timestamptz | NO | now() | Last update time |
| last_modified | timestamptz | NO | now() | Last modification time |
| deleted | boolean | NO | false | Soft delete flag |
| synced | boolean | NO | false | Sync status |

### Constraints
- Primary Key: `id`
- Foreign Key: `user_id` → `auth.users.id`
- Check: `cook_time_minutes > 0`
- Check: `difficulty IN ('easy', 'medium', 'hard')`
- Check: `servings > 0`
- Check: `visibility IN ('private', 'shared')`
- Check: `source IN ('system', 'user')`

---

## Table: recipe_ingredients

Recipe ingredients with quantities and ordering.

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| recipe_id | uuid | NO | - | References recipes |
| name | text | NO | - | Ingredient name |
| normalized_name | text | NO | - | Normalized name for matching |
| quantity | numeric | YES | - | Quantity amount |
| unit | text | YES | - | Unit of measurement |
| optional | boolean | NO | false | Is optional ingredient |
| sort_order | integer | NO | 0 | Display order |
| created_at | timestamptz | NO | now() | Creation time |

### Constraints
- Primary Key: `id`
- Foreign Key: `recipe_id` → `recipes.id`

---

## Table: recipe_steps

Recipe preparation steps with time estimates.

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| recipe_id | uuid | NO | - | References recipes |
| step_number | integer | NO | - | Step order (> 0) |
| instruction | text | NO | - | Step instructions |
| estimated_minutes | integer | YES | - | Time estimate for step |
| created_at | timestamptz | NO | now() | Creation time |

### Constraints
- Primary Key: `id`
- Foreign Key: `recipe_id` → `recipes.id`
- Check: `step_number > 0`

---

## Table: expiring_items_queue

Queue for managing expiry notifications via Telegram.

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| user_id | uuid | NO | - | References auth.users |
| chat_id | bigint | NO | - | Telegram chat ID |
| food_item_id | uuid | YES | - | References food_items |
| cosmetic_id | uuid | YES | - | References cosmetics |
| item_name | text | NO | - | Item name |
| quantity | numeric | NO | - | Item quantity |
| unit | text | NO | - | Unit of measurement |
| expiration_date | date | NO | - | Expiration date |
| category | text | NO | - | Item category |
| days_until_expiry | integer | NO | - | Days until expiration |
| notification_priority | text | NO | - | Priority: urgent/high/medium/low |
| status | text | NO | 'pending' | Status: pending/processing/sent/failed |
| scheduled_at | timestamptz | YES | - | Scheduled notification time |
| processed_at | timestamptz | YES | - | Actual processing time |
| created_at | timestamptz | NO | (now() AT TIME ZONE 'Asia/Ho_Chi_Minh') | Creation time |
| updated_at | timestamptz | NO | (now() AT TIME ZONE 'Asia/Ho_Chi_Minh') | Last update time |

### Constraints
- Primary Key: `id`
- Foreign Key: `user_id` → `auth.users.id`
- Foreign Key: `food_item_id` → `food_items.id`
- Foreign Key: `cosmetic_id` → `cosmetics.id`
- Check: `notification_priority IN ('urgent', 'high', 'medium', 'low')`
- Check: `status IN ('pending', 'processing', 'sent', 'failed')`

---

## Timezone Note

All timestamps in `food_items` and `expiring_items_queue` tables use `Asia/Ho_Chi_Minh` timezone, while other tables use UTC.
