# Database Entity Relationship Diagram

Visual representation of the current `public` schema (Supabase).

```mermaid
erDiagram
    AUTH_USERS {
      uuid id PK
    }

    USERS {
      uuid id PK, FK
      bigint telegram_id
      bigint chat_id
      text email
    }

    USER_SETTINGS {
      uuid id PK
      uuid user_id FK
      jsonb preferences
      text gemini_api_key
    }

    FOOD_ITEMS {
      uuid id PK
      uuid user_id FK
      text name
      numeric quantity
      text unit
      date expiration_date
      text category
      text storage
    }

    COSMETICS {
      uuid id PK
      uuid user_id FK
      text name
      text brand
      date expiry_date
      text status
    }

    EXPIRING_ITEMS_QUEUE {
      uuid id PK
      uuid user_id FK
      uuid food_item_id FK
      uuid cosmetic_id FK
      bigint chat_id
      text item_name
      date expiration_date
      text status
    }

    CATEGORIES {
      uuid id PK
      text name
      text icon
      text color
    }

    STORAGE_LOCATIONS {
      uuid id PK
      text name
      text icon
      text color
    }

    SHOPPING_LIST {
      uuid id PK
      uuid user_id FK
      uuid linked_food_item_id FK
      text name
      numeric quantity
      boolean checked
    }

    RECIPES {
      uuid id PK
      uuid user_id FK
      text title
      text difficulty
      text source
      boolean deleted
    }

    RECIPE_INGREDIENTS {
      uuid id PK
      uuid recipe_id FK
      text name
      numeric quantity
      boolean optional
    }

    RECIPE_STEPS {
      uuid id PK
      uuid recipe_id FK
      integer step_number
      text instruction
    }

    VENUES {
      uuid id PK
      uuid user_id FK
      text name
      text status
      boolean deleted
    }

    MENU_ITEMS {
      uuid id PK
      uuid user_id FK
      uuid venue_id FK
      text name
      numeric last_price
      smallint personal_rating
    }

    MEAL_LOGS {
      uuid id PK
      uuid user_id FK
      uuid venue_id FK
      text meal_type
      numeric total_cost
      timestamptz logged_at
    }

    MEAL_ITEM_ENTRIES {
      uuid id PK
      uuid meal_log_id FK
      uuid menu_item_id FK
      text item_name
      numeric price
      smallint quantity
    }

    AUTH_USERS ||--|| USERS : "id"
    AUTH_USERS ||--|| USER_SETTINGS : "user_id"
    AUTH_USERS ||--o{ FOOD_ITEMS : "user_id"
    AUTH_USERS ||--o{ COSMETICS : "user_id"
    AUTH_USERS ||--o{ SHOPPING_LIST : "user_id"
    AUTH_USERS ||--o{ RECIPES : "user_id (nullable)"
    AUTH_USERS ||--o{ EXPIRING_ITEMS_QUEUE : "user_id"
    AUTH_USERS ||--o{ VENUES : "user_id"
    AUTH_USERS ||--o{ MENU_ITEMS : "user_id"
    AUTH_USERS ||--o{ MEAL_LOGS : "user_id"

    FOOD_ITEMS ||--o{ EXPIRING_ITEMS_QUEUE : "food_item_id (nullable)"
    COSMETICS ||--o{ EXPIRING_ITEMS_QUEUE : "cosmetic_id (nullable)"
    FOOD_ITEMS ||--o{ SHOPPING_LIST : "linked_food_item_id (nullable)"

    RECIPES ||--o{ RECIPE_INGREDIENTS : "recipe_id"
    RECIPES ||--o{ RECIPE_STEPS : "recipe_id"

    VENUES ||--o{ MENU_ITEMS : "venue_id"
    VENUES ||--o{ MEAL_LOGS : "venue_id (nullable)"
    MEAL_LOGS ||--o{ MEAL_ITEM_ENTRIES : "meal_log_id"
    MENU_ITEMS ||--o{ MEAL_ITEM_ENTRIES : "menu_item_id (nullable)"
```

## Referential Action Notes

- `CASCADE` delete examples:
  - `expiring_items_queue.food_item_id -> food_items.id`
  - `expiring_items_queue.cosmetic_id -> cosmetics.id`
  - `recipe_ingredients.recipe_id -> recipes.id`
  - `recipe_steps.recipe_id -> recipes.id`
  - `meal_item_entries.meal_log_id -> meal_logs.id`
- `SET NULL` delete:
  - `shopping_list.linked_food_item_id -> food_items.id`
- Many auth-linked FKs are `NO ACTION` on delete; some are `CASCADE` (see `relationships.md` matrix).

## Non-FK Logical References

- `food_items.category` logically references category names in `categories`
- `food_items.storage` logically references names in `storage_locations`
