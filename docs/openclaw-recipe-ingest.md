# OpenClaw Recipe Ingestion via MCPorter + Supabase MCP

Tài liệu này mô tả cách dùng một workflow kiểu OpenClaw skill để:

1. tìm công thức từ nguồn ngoài,
2. chuẩn hóa payload,
3. ghi vào Supabase (`recipes`, `recipe_ingredients`, `recipe_steps`) qua MCP.

Repository đã có script scaffold:

- `scripts/openclaw-recipe-ingest.mjs`
- npm script: `npm run openclaw:ingest-recipe`

---

## 1) Yêu cầu

- Node.js + npm
- MCPorter chạy được qua `npx`
- Cấu hình MCP server `supabase` trong `.mcp.json` (repo đã có)
- Quyền DB phù hợp để ghi vào bảng recipes

> Lưu ý bảo mật: không đặt service-role key ở frontend client. Skill này nên chạy ở môi trường server/trusted automation.

---

## 2) Kết nối MCPorter với Supabase MCP

Nếu bạn đã dùng `.mcp.json` hiện tại thì thường có thể gọi trực tiếp.

Nếu cần thêm bằng MCPorter CLI:

```bash
npx mcporter config add supabase https://mcp.supabase.com/mcp?project_ref=<your_project_ref>
```

Nếu endpoint yêu cầu xác thực OAuth qua MCPorter:

```bash
npx mcporter auth https://mcp.supabase.com/mcp
```

---

## 3) Payload recipe đầu vào

Tạo file JSON, ví dụ `tmp/recipe-pho-bo.json`:

```json
{
  "title": "Phở bò đơn giản",
  "description": "Phiên bản nhanh cho bữa sáng",
  "sourceUrl": "https://example.com/pho-bo",
  "imageUrl": "https://images.example.com/pho-bo.jpg",
  "cookTimeMinutes": 40,
  "prepTimeMinutes": 20,
  "servings": 2,
  "difficulty": "medium",
  "visibility": "private",
  "tags": ["vietnamese", "beef", "soup"],
  "ingredients": [
    { "name": "thịt bò", "quantity": 300, "unit": "g" },
    { "name": "bánh phở", "quantity": 400, "unit": "g" },
    { "name": "hành lá", "quantity": 2, "unit": "stalk" },
    { "name": "gừng", "quantity": 20, "unit": "g", "optional": true }
  ],
  "steps": [
    { "instruction": "Nấu nước dùng với gừng và gia vị.", "estimatedMinutes": 20 },
    { "instruction": "Trụng bánh phở và xếp vào tô.", "estimatedMinutes": 8 },
    { "instruction": "Chần thịt bò, chan nước dùng và thêm hành lá.", "estimatedMinutes": 12 }
  ]
}
```

### Rule validation trong script

- `title`, `ingredients[]`, `steps[]` bắt buộc
- `difficulty`: `easy | medium | hard`
- `visibility`: `private | shared`
- `cookTimeMinutes > 0`, `servings > 0`
- Ingredient sẽ được normalize (`normalized_name`) để match với inventory tốt hơn

---

## 4) Chạy ingest

```bash
npm run openclaw:ingest-recipe -- \
  --user-id <auth.users.id> \
  --payload tmp/recipe-pho-bo.json
```

Tuỳ chọn:

- `--server <name_or_url>` (default: `supabase`)
- `--timeout-ms <number>` (default: `120000`)
- `--dry-run` (chỉ in SQL, không ghi DB)

Ví dụ dry-run:

```bash
npm run openclaw:ingest-recipe -- \
  --user-id <auth.users.id> \
  --payload tmp/recipe-pho-bo.json \
  --dry-run
```

---

## 5) Hành vi dedupe

Script hiện dedupe theo:

- `user_id`
- `source = 'user'`
- `deleted = false`
- `lower(title)`

Nếu recipe đã tồn tại theo rule trên, script **không** chèn bản mới và trả về trạng thái `deduplicated: true`.

Bạn có thể mở rộng sang dedupe theo `sourceUrl` (nếu thêm cột riêng trong schema).

---

## 6) Cách gắn vào OpenClaw skill

Trong OpenClaw, bạn có thể tạo skill pipeline 3 bước:

1. `find_recipes_by_inventory` (web/search API)
2. `normalize_recipe_payload` (chuẩn thành JSON theo contract ở trên)
3. `run_ingest` (shell command gọi script này)

Ví dụ bước 3:

```bash
npm run openclaw:ingest-recipe -- --user-id "$USER_ID" --payload "$PAYLOAD_FILE"
```

---

## 7) Lưu ý production

- Chạy ingestion ở môi trường backend/trusted runner
- Bật log ingest job (input hash, kết quả, lỗi)
- Giới hạn rate ingest để tránh spam DB
- Rà soát RLS để đúng quyền user trước khi scale automation
