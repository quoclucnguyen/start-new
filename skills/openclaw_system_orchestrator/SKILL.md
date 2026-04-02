---
name: openclaw-food-system-orchestrator
description: Standalone orchestrator skill for full-system operations (inventory, shopping, diary, recipes, settings, code, and Supabase) via npx mcporter.
metadata:
  openclaw:
    os: ["linux", "darwin", "windows"]
---

# OpenClaw System Orchestrator Skill

Use this skill when the user asks OpenClaw to work with the **whole system**, not only one feature.

OpenClaw **không gọi MCP Supabase trực tiếp**. Mọi lệnh MCP Supabase đều thực hiện qua **`npx mcporter call supabase.<tool_name>`**.

> Phiên bản này ưu tiên **database operations**: hiểu schema, đọc/ghi data, migration, RLS/security checks.

## Prerequisites

- Node.js + npm/npx đã cài.
- MCP Supabase server đã cấu hình trong mcporter config (auto-discover từ Cursor/Claude/OpenCode/VS Code, hoặc file `config/mcporter.json`).
- Chạy `npx mcporter list supabase` để verify server available.

## System Scope

- **Supabase data operations**: read/write app data qua `npx mcporter call supabase.execute_sql`.
- **Supabase schema operations**: migration-based DDL qua `npx mcporter call supabase.apply_migration`.

## Project Database Context (quan trọng)

### 1) Data lưu ở đâu?

- **Primary source of truth**: Supabase Postgres, schema `public`.
- **Auth source**: `auth.users` (các bảng domain liên kết về `auth.users.id`).
- **RLS**: bật trên toàn bộ bảng `public`.
- **Current snapshot**: 15 bảng trong `public` (inventory/shopping/recipes/diary/settings/user).

### 2) Data lưu như thế nào? (domain → bảng)

- **Inventory**
  - `food_items`
  - (phần notification pipeline: `expiring_items_queue`)
- **Settings/Configuration**
  - `categories`
  - `storage_locations`
  - `user_settings`
- **Shopping**
  - `shopping_list`
- **Recipes**
  - `recipes`
  - `recipe_ingredients`
  - `recipe_steps`
- **Diary**
  - `venues`
  - `menu_items`
  - `meal_logs`
  - `meal_item_entries`

### 3) Quy tắc lưu trữ cần nhớ

- DB dùng **snake_case** (ví dụ `expiration_date`, `created_at`, `user_id`).
- App layer map sang camelCase (ví dụ `expiration_date` ↔ `expiryDate`).
- Nhiều bảng dùng **soft delete** với cột `deleted`:
  - Khi đọc data nghiệp vụ, thường cần thêm `deleted = false`.
- **Chỉ INSERT bắt buộc có `user_id`** để xác định ai tạo dữ liệu.
- Với SELECT/UPDATE/DELETE, **không bắt buộc filter theo `user_id`**; ưu tiên scope bằng ID cụ thể/điều kiện hẹp.

### 4) FK paths quan trọng

- `recipes` → `recipe_ingredients`, `recipe_steps` (cascade delete).
- `meal_logs` → `meal_item_entries` (cascade delete).
- `venues` → `menu_items`, `meal_logs`.
- `shopping_list.linked_food_item_id` → `food_items.id` (set null on delete).

## MCP Supabase Tools qua mcporter

### Cú pháp chung

```bash
# Function-call syntax (khuyến nghị — dễ đọc, hỗ trợ nested objects)
npx mcporter call 'supabase.execute_sql(query: "SELECT 1")'

# Flag syntax (phù hợp cho tham số đơn giản)
npx mcporter call supabase.execute_sql query="SELECT 1"

# Xem danh sách tools có sẵn
npx mcporter list supabase

# Xem schema chi tiết của tools
npx mcporter list supabase --schema
```

### Tham chiếu tools

#### Đọc dữ liệu & Schema

| Tool | mcporter call | Mục đích |
|------|---------------|----------|
| `list_tables` | `npx mcporter call supabase.list_tables schemas='["public"]' verbose=true` | Liệt kê bảng, cột, PK, FK. |
| `execute_sql` | `npx mcporter call 'supabase.execute_sql(query: "SELECT ...")'` | Chạy SQL (SELECT/INSERT/UPDATE/DELETE). |
| `list_extensions` | `npx mcporter call supabase.list_extensions` | Kiểm tra extensions đang bật. |
| `list_migrations` | `npx mcporter call supabase.list_migrations` | Xem migrations đã chạy. |
| `search_docs` | `npx mcporter call 'supabase.search_docs(graphql_query: "...")'` | Tìm docs Supabase. |

#### Ghi schema (DDL)

| Tool | mcporter call | Mục đích |
|------|---------------|----------|
| `apply_migration` | `npx mcporter call 'supabase.apply_migration(name: "add_foo", query: "CREATE TABLE ...")'` | Tạo migration. **LUÔN dùng cho DDL.** |

#### Logs & Advisors

| Tool | mcporter call | Mục đích |
|------|---------------|----------|
| `get_logs` | `npx mcporter call supabase.get_logs service=postgres` | Lấy logs 24h gần nhất. Service: `api`, `postgres`, `auth`, `storage`, `edge-function`, `realtime`. |
| `get_advisors` | `npx mcporter call supabase.get_advisors type=security` | Kiểm tra security/performance issues. |
| `get_project_url` | `npx mcporter call supabase.get_project_url` | Lấy project API URL. |
| `get_publishable_keys` | `npx mcporter call supabase.get_publishable_keys` | Lấy anon/publishable keys. |

#### Edge Functions

| Tool | mcporter call | Mục đích |
|------|---------------|----------|
| `list_edge_functions` | `npx mcporter call supabase.list_edge_functions` | Liệt kê edge functions. |
| `get_edge_function` | `npx mcporter call 'supabase.get_edge_function(function_slug: "my-func")'` | Đọc source. |
| `deploy_edge_function` | `npx mcporter call 'supabase.deploy_edge_function(name: "my-func", entrypoint_path: "index.ts", verify_jwt: true, files: [...])'` | Deploy function. |

#### Branching (Development)

| Tool | mcporter call | Mục đích |
|------|---------------|----------|
| `create_branch` | `npx mcporter call 'supabase.create_branch(name: "develop", confirm_cost_id: "...")'` | Tạo branch. |
| `list_branches` | `npx mcporter call supabase.list_branches` | Liệt kê branches. |
| `merge_branch` | `npx mcporter call 'supabase.merge_branch(branch_id: "...")'` | Merge vào production. |
| `rebase_branch` | `npx mcporter call 'supabase.rebase_branch(branch_id: "...")'` | Rebase trên production. |
| `reset_branch` | `npx mcporter call 'supabase.reset_branch(branch_id: "...")'` | Reset branch (mất data!). |
| `delete_branch` | `npx mcporter call 'supabase.delete_branch(branch_id: "...")'` | Xóa branch. |

#### TypeScript

| Tool | mcporter call | Mục đích |
|------|---------------|----------|
| `generate_typescript_types` | `npx mcporter call supabase.generate_typescript_types` | Generate TS types. |

## Intent Routing (choose one first)

1. **read_only**
   - Inspect files, docs, logs, DB rows, schema metadata.
   - mcporter tools: `execute_sql` (SELECT), `list_tables`, `list_migrations`, `get_logs`.
   - No writes.

2. **workspace_change**
   - Modify database docs/config/playbooks inside repository (không thay đổi runtime data).

3. **data_write**
   - Insert/update/delete runtime data (non-DDL) in Supabase.
   - mcporter tool: `execute_sql` (INSERT/UPDATE/DELETE).
   - **Luôn SELECT trước** qua mcporter để kiểm tra hiện trạng.
   - **INSERT phải có `user_id`**; UPDATE/DELETE dùng specific IDs hoặc điều kiện hẹp, không bắt buộc `user_id`.

4. **schema_change**
   - DDL only (tables/columns/indexes/policies/functions).
   - mcporter tool: `apply_migration`.
   - Require explicit user confirmation.
   - **Sau khi apply, chạy `get_advisors`** để kiểm tra RLS/security.

## Global Operating Procedure

1. Classify request into one of the intents above.
2. Collect required inputs (IDs/bộ lọc cụ thể, `user_id` nếu là INSERT, target environment, expected outcome).
3. **Schema discovery**: chạy `npx mcporter call 'supabase.list_tables(schemas: ["public"], verbose: true)'` để nắm bảng/cột/PK/FK trước khi viết SQL.
4. Run lowest-risk validation first:
   - `npx mcporter call 'supabase.execute_sql(query: "SELECT ...")'` để kiểm tra hiện trạng.
   - Dry-run SQL preview cho data writes.
5. Execute minimal necessary actions qua `npx mcporter call`.
6. Verify outcomes:
   - SELECT lại data sau khi ghi.
   - `npx mcporter call supabase.get_advisors type=security` sau schema changes.
7. Return concise report.

## Safety Boundaries

- Default to **read-only first** (`execute_sql` SELECT).
- Never execute destructive or broad write actions without explicit user confirmation.
- Never interpolate untrusted text directly into shell commands — dùng function-call syntax của mcporter để escaping an toàn.
- **Luôn dùng `apply_migration` cho DDL** — không dùng `execute_sql` cho CREATE/ALTER/DROP.
- **Luôn dùng `execute_sql` cho DML** (INSERT/UPDATE/DELETE).
- Với UPDATE/DELETE, luôn có WHERE clause target hẹp (specific IDs/business keys) — không chạy broad writes.
- Với INSERT, luôn include `user_id` để ghi nhận người tạo.
- For `schema_change`, always use migration flow and include rollback considerations.
- For SELECT/UPDATE/DELETE, không bắt buộc scope theo `user_id`; ưu tiên specific IDs hoặc điều kiện nghiệp vụ rõ ràng.
- Chạy `get_advisors` (type: security) sau mỗi schema change.
- SQL examples phải bám đúng tên cột/bảng thật trong schema hiện tại (không suy diễn).

## Domain Playbooks

### A) Inventory / Shopping / Diary / Settings

For domain operations:

1. Identify affected entities and key filters (specific IDs, date range, status).
2. `npx mcporter call 'supabase.list_tables(schemas: ["public"], verbose: true)'` để xem cấu trúc bảng nếu chưa rõ.
3. `npx mcporter call 'supabase.execute_sql(query: "SELECT ...")'` để đọc current state.
4. `npx mcporter call 'supabase.execute_sql(query: "INSERT/UPDATE/DELETE ...")'` để thực hiện targeted changes.
5. SELECT lại để verify và report changed row counts/IDs.

#### Ví dụ: Thêm food item vào inventory

```bash
# Step 1: Kiểm tra hiện trạng
npx mcporter call 'supabase.execute_sql(query: "SELECT * FROM food_items WHERE name ILIKE '\''%sữa%'\'' AND deleted = false")'

# Step 2: Thêm mới
npx mcporter call 'supabase.execute_sql(query: "INSERT INTO food_items (user_id, name, category, quantity, unit, storage, expiration_date, deleted) VALUES ('\''...'\'', '\''Sữa tươi'\'', '\''Dairy'\'', 2, '\''l'\'', '\''fridge'\'', '\''2026-04-10'\'', false) RETURNING id")'

# Step 3: Verify
npx mcporter call 'supabase.execute_sql(query: "SELECT * FROM food_items WHERE id = '\''returned-uuid'\''")'
```

### B) Recipes — Generic Import/Upsert Playbook

When user asks to ingest/import recipes:

1. Validate required fields in request payload:
   - `title`
   - `ingredients[]`
   - `steps[]`
2. Dedupe check:
   ```bash
   npx mcporter call 'supabase.execute_sql(query: "SELECT id FROM recipes WHERE LOWER(title) = LOWER('\''recipe title'\'') AND deleted = false")'
   ```
3. Preview write plan (what rows/tables will be affected).
4. Targeted inserts/updates:
   ```bash
   npx mcporter call 'supabase.execute_sql(query: "INSERT INTO recipes (...) VALUES (...) RETURNING id")'
   ```
5. SELECT lại để verify, return structured result:
   - `recipeId`
   - `deduplicated` (true/false)
   - `rowsAffected` summary

Recommended enums (if app schema uses them):
- `difficulty`: `easy | medium | hard`
- `visibility`: `private | shared`

### C) Schema Changes — Migration Playbook

Khi cần thay đổi schema:

1. `npx mcporter call 'supabase.list_tables(schemas: ["public"], verbose: true)'` để hiểu schema hiện tại.
2. Soạn migration SQL với rollback plan.
3. Hỏi user confirm trước khi chạy.
4. `npx mcporter call 'supabase.apply_migration(name: "migration_name", query: "CREATE TABLE ...")'`
5. `npx mcporter call supabase.get_advisors type=security` để kiểm tra RLS/security issues.
6. `npx mcporter call supabase.list_migrations` để verify migration đã apply.

### D) Debugging — Logs & Advisors

Khi cần debug:

1. `npx mcporter call supabase.get_logs service=postgres` để xem logs gần 24h.
2. `npx mcporter call supabase.get_advisors type=security` để kiểm tra issues.
3. `npx mcporter call 'supabase.execute_sql(query: "SELECT ...")'` để truy vấn data liên quan.

## Response Format

When returning result, include:

1. **Intent used** (`read_only` / `workspace_change` / `data_write` / `schema_change`)
2. **mcporter commands executed** (lệnh `npx mcporter call ...` đã chạy)
3. **Outcome** (success/failure + key IDs/counts)
4. **Next safest step** (optional)

## Quick DB Discovery Snippets (copy/paste)

```bash
# 1) Liệt kê toàn bộ bảng/cột/FK trong public
npx mcporter call 'supabase.list_tables(schemas: ["public"], verbose: true)'

# 2) Xem dữ liệu mẫu food_items (đã loại soft-deleted)
npx mcporter call 'supabase.execute_sql(query: "SELECT id, name, quantity, unit, category, storage, expiration_date FROM food_items WHERE deleted = false ORDER BY expiration_date NULLS LAST LIMIT 50")'

# 3) Xem recipe + ingredient + step theo 1 recipe id
npx mcporter call 'supabase.execute_sql(query: "SELECT r.id, r.title, ri.name AS ingredient_name, rs.step_number, rs.instruction FROM recipes r LEFT JOIN recipe_ingredients ri ON ri.recipe_id = r.id LEFT JOIN recipe_steps rs ON rs.recipe_id = r.id WHERE r.id = '\''<recipe-id>'\'' AND r.deleted = false ORDER BY rs.step_number")'

# 4) Xem meal log + item entries (đã loại soft-deleted)
npx mcporter call 'supabase.execute_sql(query: "SELECT ml.id AS meal_log_id, ml.logged_at, ml.meal_type, ml.total_cost, mie.item_name, mie.quantity, mie.price FROM meal_logs ml LEFT JOIN meal_item_entries mie ON mie.meal_log_id = ml.id WHERE ml.deleted = false ORDER BY ml.logged_at DESC LIMIT 100")'
```