import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

const recipeMutations = read('src/pages/recipes/api/use-recipes-management-mutations.ts');
assert.match(recipeMutations, /Array\.isArray\(old\)/, 'recipe optimistic updates must only touch list arrays');

const recipeSuggestions = read('src/pages/recipes/api/use-recipe-suggestions.ts');
assert.match(
  recipeSuggestions,
  /queryKey:\s*\[\.\.\.RECIPE_SUGGESTIONS_QUERY_KEY,\s*userId,\s*'detail',\s*recipeId\]/,
  'recipe suggestion detail key must share the userId prefix for invalidation',
);

const shoppingMutations = read('src/pages/shopping/api/use-shopping-list-mutations.ts');
assert.doesNotMatch(shoppingMutations, /useMovePurchasedToInventory[\s\S]*?onSuccess:/, 'move purchased invalidates onSettled, including failures');
assert.match(shoppingMutations, /onSettled:/, 'move purchased must invalidate after settle');

const hardeningSql = 'supabase/database/20260705000000_harden_user_data.sql';
assert.ok(existsSync(new URL(`../${hardeningSql}`, import.meta.url)), 'hardening SQL migration exists');
const sql = read(hardeningSql);
for (const fragment of [
  'create index if not exists food_items_user_id_idx',
  'create index if not exists food_items_expiration_date_idx',
  'create index if not exists shopping_list_user_id_idx',
  'alter table public.food_items enable row level security',
  '(select auth.uid()) = user_id',
  'food_items_quantity_positive',
]) {
  assert.ok(sql.includes(fragment), `hardening SQL missing: ${fragment}`);
}

console.log('regression checks passed');
