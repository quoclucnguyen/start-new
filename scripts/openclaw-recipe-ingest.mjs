#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import { resolve as resolvePath } from 'node:path';
import { promisify } from 'node:util';
import { execFile as execFileCallback } from 'node:child_process';

const execFile = promisify(execFileCallback);

const ALLOWED_DIFFICULTY = new Set(['easy', 'medium', 'hard']);
const ALLOWED_VISIBILITY = new Set(['private', 'shared']);

function parseArgs(argv) {
  const args = {
    payloadPath: '',
    userId: '',
    server: process.env.MCPORTER_SERVER ?? 'supabase',
    timeoutMs: Number(process.env.MCPORTER_TIMEOUT_MS ?? 120000),
    dryRun: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];

    if (token === '--payload') {
      args.payloadPath = argv[i + 1] ?? '';
      i += 1;
      continue;
    }

    if (token === '--user-id') {
      args.userId = argv[i + 1] ?? '';
      i += 1;
      continue;
    }

    if (token === '--server') {
      args.server = argv[i + 1] ?? args.server;
      i += 1;
      continue;
    }

    if (token === '--timeout-ms') {
      const parsed = Number(argv[i + 1]);
      if (!Number.isNaN(parsed) && parsed > 0) {
        args.timeoutMs = parsed;
      }
      i += 1;
      continue;
    }

    if (token === '--dry-run') {
      args.dryRun = true;
      continue;
    }

    if (token === '--help' || token === '-h') {
      printHelp(0);
    }
  }

  if (!args.payloadPath || !args.userId) {
    printHelp(1);
  }

  return args;
}

function printHelp(code) {
  const message = `
OpenClaw Recipe Ingest (MCPorter -> Supabase MCP)

Usage:
  npm run openclaw:ingest-recipe -- \
    --user-id <auth.users.id> \
    --payload <path/to/recipe.json> \
    [--server supabase] \
    [--timeout-ms 120000] \
    [--dry-run]

Required:
  --user-id     Supabase auth user id that owns the recipe
  --payload     JSON recipe payload

Optional:
  --server      MCPorter server name or URL (default: supabase)
  --timeout-ms  MCPorter timeout in milliseconds (default: 120000)
  --dry-run     Print SQL only, no write
`;

  console.log(message.trim());
  process.exit(code);
}

function normalizeIngredientName(name) {
  return name.toLowerCase().trim().replace(/\s+/g, ' ');
}

function toSqlString(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function sanitizePayload(raw) {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Payload must be a JSON object.');
  }

  const title = String(raw.title ?? '').trim();
  if (!title) throw new Error('payload.title is required.');

  const ingredientsRaw = Array.isArray(raw.ingredients) ? raw.ingredients : [];
  if (ingredientsRaw.length === 0) {
    throw new Error('payload.ingredients must be a non-empty array.');
  }

  const ingredients = ingredientsRaw.map((item, index) => {
    if (!item || typeof item !== 'object') {
      throw new Error(`payload.ingredients[${index}] must be an object.`);
    }

    const name = String(item.name ?? '').trim();
    if (!name) throw new Error(`payload.ingredients[${index}].name is required.`);

    const quantity = item.quantity == null ? null : Number(item.quantity);
    if (quantity != null && Number.isNaN(quantity)) {
      throw new Error(`payload.ingredients[${index}].quantity must be numeric.`);
    }

    return {
      name,
      normalized_name: normalizeIngredientName(name),
      quantity,
      unit: item.unit == null ? null : String(item.unit).trim() || null,
      optional: Boolean(item.optional ?? false),
    };
  });

  const stepsRaw = Array.isArray(raw.steps) ? raw.steps : [];
  if (stepsRaw.length === 0) {
    throw new Error('payload.steps must be a non-empty array.');
  }

  const steps = stepsRaw.map((item, index) => {
    if (!item || typeof item !== 'object') {
      throw new Error(`payload.steps[${index}] must be an object.`);
    }

    const instruction = String(item.instruction ?? '').trim();
    if (!instruction) {
      throw new Error(`payload.steps[${index}].instruction is required.`);
    }

    const estimatedMinutes = item.estimatedMinutes == null ? null : Number(item.estimatedMinutes);
    if (estimatedMinutes != null && Number.isNaN(estimatedMinutes)) {
      throw new Error(`payload.steps[${index}].estimatedMinutes must be numeric.`);
    }

    return {
      instruction,
      estimated_minutes: estimatedMinutes,
    };
  });

  const difficulty = String(raw.difficulty ?? 'easy').trim().toLowerCase();
  if (!ALLOWED_DIFFICULTY.has(difficulty)) {
    throw new Error(`payload.difficulty must be one of: ${Array.from(ALLOWED_DIFFICULTY).join(', ')}`);
  }

  const visibility = String(raw.visibility ?? 'private').trim().toLowerCase();
  if (!ALLOWED_VISIBILITY.has(visibility)) {
    throw new Error(`payload.visibility must be one of: ${Array.from(ALLOWED_VISIBILITY).join(', ')}`);
  }

  const cookTimeMinutes = Number(raw.cookTimeMinutes ?? 30);
  if (Number.isNaN(cookTimeMinutes) || cookTimeMinutes <= 0) {
    throw new Error('payload.cookTimeMinutes must be > 0.');
  }

  const prepTimeMinutes = raw.prepTimeMinutes == null ? null : Number(raw.prepTimeMinutes);
  if (prepTimeMinutes != null && Number.isNaN(prepTimeMinutes)) {
    throw new Error('payload.prepTimeMinutes must be numeric.');
  }

  const servings = Number(raw.servings ?? 1);
  if (Number.isNaN(servings) || servings <= 0) {
    throw new Error('payload.servings must be > 0.');
  }

  const tags = Array.isArray(raw.tags)
    ? raw.tags.map((tag) => String(tag).trim()).filter(Boolean)
    : [];

  if (!tags.includes('imported-by-openclaw')) {
    tags.push('imported-by-openclaw');
  }

  const sourceUrl = raw.sourceUrl == null ? '' : String(raw.sourceUrl).trim();
  const baseDescription = raw.description == null ? '' : String(raw.description).trim();
  const description = sourceUrl
    ? [baseDescription, `Source: ${sourceUrl}`].filter(Boolean).join('\n\n')
    : baseDescription;

  return {
    title,
    description,
    image_url: raw.imageUrl == null ? null : String(raw.imageUrl).trim() || null,
    cook_time_minutes: Math.round(cookTimeMinutes),
    prep_time_minutes: prepTimeMinutes == null ? null : Math.round(prepTimeMinutes),
    servings: Math.round(servings),
    difficulty,
    visibility,
    tags,
    ingredients,
    steps,
  };
}

function buildIngestSql(payload, userId) {
  const titleSql = toSqlString(payload.title);
  const descriptionSql = toSqlString(payload.description);
  const imageSql = payload.image_url ? toSqlString(payload.image_url) : 'NULL';
  const difficultySql = toSqlString(payload.difficulty);
  const visibilitySql = toSqlString(payload.visibility);
  const tagsSql = toSqlString(JSON.stringify(payload.tags));
  const ingredientsSql = toSqlString(JSON.stringify(payload.ingredients));
  const stepsSql = toSqlString(JSON.stringify(payload.steps));
  const userSql = toSqlString(userId);

  const prepTimeSql = payload.prep_time_minutes == null ? 'NULL' : String(payload.prep_time_minutes);

  return `
WITH input AS (
  SELECT
    ${userSql}::uuid AS user_id,
    ${titleSql}::text AS title,
    NULLIF(${descriptionSql}::text, '') AS description,
    ${imageSql === 'NULL' ? 'NULL::text' : `${imageSql}::text`} AS image_url,
    ${payload.cook_time_minutes}::integer AS cook_time_minutes,
    ${prepTimeSql}::integer AS prep_time_minutes,
    ${payload.servings}::integer AS servings,
    ${difficultySql}::text AS difficulty,
    ${visibilitySql}::text AS visibility,
    ${tagsSql}::jsonb AS tags,
    ${ingredientsSql}::jsonb AS ingredients,
    ${stepsSql}::jsonb AS steps
),
existing AS (
  SELECT r.id
  FROM recipes r
  JOIN input i ON i.user_id = r.user_id
  WHERE r.deleted = false
    AND r.source = 'user'
    AND lower(r.title) = lower(i.title)
  ORDER BY r.updated_at DESC
  LIMIT 1
),
insert_recipe AS (
  INSERT INTO recipes (
    user_id,
    title,
    description,
    image_url,
    cook_time_minutes,
    prep_time_minutes,
    servings,
    difficulty,
    tags,
    visibility,
    source,
    deleted,
    synced
  )
  SELECT
    i.user_id,
    i.title,
    i.description,
    i.image_url,
    i.cook_time_minutes,
    i.prep_time_minutes,
    i.servings,
    i.difficulty,
    ARRAY(SELECT jsonb_array_elements_text(i.tags)),
    i.visibility,
    'user',
    false,
    false
  FROM input i
  WHERE NOT EXISTS (SELECT 1 FROM existing)
  RETURNING id
),
target AS (
  SELECT id, false AS existed FROM insert_recipe
  UNION ALL
  SELECT id, true AS existed FROM existing
),
insert_ingredients AS (
  INSERT INTO recipe_ingredients (
    recipe_id,
    name,
    normalized_name,
    quantity,
    unit,
    optional,
    sort_order
  )
  SELECT
    t.id,
    elem->>'name',
    COALESCE(NULLIF(elem->>'normalized_name', ''), lower(trim(elem->>'name'))),
    (elem->>'quantity')::numeric,
    NULLIF(elem->>'unit', ''),
    COALESCE((elem->>'optional')::boolean, false),
    ordinality - 1
  FROM input i
  JOIN target t ON true
  CROSS JOIN LATERAL jsonb_array_elements(i.ingredients) WITH ORDINALITY AS e(elem, ordinality)
  WHERE t.existed = false
),
insert_steps AS (
  INSERT INTO recipe_steps (
    recipe_id,
    step_number,
    instruction,
    estimated_minutes
  )
  SELECT
    t.id,
    ordinality,
    elem->>'instruction',
    (elem->>'estimated_minutes')::integer
  FROM input i
  JOIN target t ON true
  CROSS JOIN LATERAL jsonb_array_elements(i.steps) WITH ORDINALITY AS e(elem, ordinality)
  WHERE t.existed = false
)
SELECT id AS recipe_id, existed
FROM target
LIMIT 1;
`.trim();
}

function extractResult(stdout) {
  const raw = stdout.trim();
  if (!raw) return null;

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  const queue = [parsed];
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) continue;

    if (Array.isArray(current)) {
      queue.push(...current);
      continue;
    }

    if (typeof current === 'object') {
      const maybeRecipeId = current.recipe_id ?? current.recipeId;
      const maybeExisted = current.existed;
      if (typeof maybeRecipeId === 'string' && typeof maybeExisted === 'boolean') {
        return { recipeId: maybeRecipeId, existed: maybeExisted };
      }

      if (typeof current.text === 'string') {
        try {
          const nested = JSON.parse(current.text);
          queue.push(nested);
        } catch {
          // ignore plain text
        }
      }

      for (const value of Object.values(current)) {
        queue.push(value);
      }
    }
  }

  return null;
}

async function callSupabaseExecuteSql(server, timeoutMs, sql) {
  const toolTarget = `${server}.execute_sql`;
  const args = [
    '-y',
    'mcporter',
    'call',
    toolTarget,
    '--output',
    'json',
    '--timeout',
    String(timeoutMs),
    `query=${sql}`,
  ];

  const { stdout, stderr } = await execFile('npx', args, {
    maxBuffer: 20 * 1024 * 1024,
  });

  if (stderr?.trim()) {
    console.error('[mcporter:stderr]', stderr.trim());
  }

  return stdout;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!isUuid(args.userId)) {
    throw new Error('--user-id must be a valid UUID.');
  }

  const payloadPath = resolvePath(process.cwd(), args.payloadPath);
  const payloadRaw = await readFile(payloadPath, 'utf8');
  const payloadJson = JSON.parse(payloadRaw);
  const payload = sanitizePayload(payloadJson);

  const sql = buildIngestSql(payload, args.userId);

  if (args.dryRun) {
    console.log(sql);
    console.log('\n[dry-run] SQL generated successfully.');
    return;
  }

  const stdout = await callSupabaseExecuteSql(args.server, args.timeoutMs, sql);
  const result = extractResult(stdout);

  if (result) {
    console.log(
      JSON.stringify(
        {
          ok: true,
          recipeId: result.recipeId,
          deduplicated: result.existed,
          server: args.server,
          title: payload.title,
        },
        null,
        2,
      ),
    );
    return;
  }

  console.log(stdout.trim());
  console.log('\n[warning] Could not parse recipe_id from MCP output. Inspect raw output above.');
}

main().catch((error) => {
  console.error('[openclaw-recipe-ingest] Failed:', error instanceof Error ? error.message : String(error));
  process.exit(1);
});
