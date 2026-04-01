---
name: openclaw-food-system-orchestrator
description: Standalone orchestrator skill for full-system operations (inventory, shopping, diary, recipes, settings, code, and Supabase) without repo-local script dependencies.
metadata:
  openclaw:
    os: ["linux", "darwin", "windows"]
---

# OpenClaw System Orchestrator Skill

Use this skill when the user asks OpenClaw to work with the **whole system**, not only one feature.

This version is **standalone**: copy `SKILL.md` only, no dependency on local repo scripts/files.

## System Scope

This skill covers:

- **Codebase operations**: inspect/update files, run lint/build checks when available.
- **Supabase data operations**: read/write app data across all domains.
- **Supabase schema operations**: migration-based DDL changes.
- **Domain workflows**:
  - Inventory (`food_items`, categories, storage locations)
  - Shopping list
  - Recipes (create/edit/import-like write flows)
  - Food diary / venue tracking
  - Settings/configuration

## Intent Routing (choose one first)

1. **read_only**
   - Inspect project files, docs, logs, DB rows, and schema metadata.
   - No writes.

2. **workspace_change**
   - Modify code/docs/config inside repository.
   - Validate with `npm run lint` and `npm run build` when relevant.

3. **data_write**
   - Insert/update/delete runtime data (non-DDL) in Supabase.
   - Prefer dry-run/preview strategy and precise scoping (`user_id`, IDs, limits).

4. **schema_change**
   - DDL only (tables/columns/indexes/policies/functions).
   - Require explicit user confirmation and migration-based execution.

## Global Operating Procedure

1. Classify request into one of the intents above.
2. Collect required inputs (IDs, user_id scope, target environment, expected outcome).
3. Run lowest-risk validation first (read-only checks, dry-run, or SQL preview).
4. Execute minimal necessary actions.
5. Verify outcomes and return concise report.

## Safety Boundaries

- Default to **read-only first**.
- Never execute destructive or broad write actions without explicit user confirmation.
- Never interpolate untrusted text directly into shell commands.
- Prefer parameterized/structured DB tool calls where available.
- For `schema_change`, always use migration flow and include rollback considerations.
- For data writes, always scope by `user_id` and/or specific IDs where possible.

## Domain Playbooks

### A) Inventory / Shopping / Diary / Settings

For domain operations:

1. Identify affected entities and key filters (`user_id`, date range, status).
2. Read current state first (avoid blind writes).
3. Perform targeted changes.
4. Re-check resulting state and report changed row counts/IDs.

### B) Recipes — Generic Import/Upsert Playbook (Standalone)

When user asks to ingest/import recipes, use DB/API tools directly:

1. Validate required fields in request payload:
   - `title`
   - `ingredients[]`
   - `steps[]`
2. Read-first dedupe check in scope:
   - `user_id`
   - case-insensitive title comparison
   - non-deleted records only
3. Preview write plan (what rows/tables will be affected).
4. Execute targeted inserts/updates:
   - `recipes`
   - `recipe_ingredients`
   - `recipe_steps`
5. Return structured result:
   - `recipeId`
   - `deduplicated` (true/false)
   - `rowsAffected` summary

Recommended enums (if app schema uses them):
- `difficulty`: `easy | medium | hard`
- `visibility`: `private | shared`

## Response Format

When returning result, include:

1. **Intent used** (`read_only` / `workspace_change` / `data_write` / `schema_change`)
2. **Actions executed** (commands, files, SQL/migration names)
3. **Outcome** (success/failure + key IDs/counts)
4. **Next safest step** (optional)
