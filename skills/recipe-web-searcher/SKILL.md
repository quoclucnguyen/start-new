---
name: recipe-web-searcher
description: >
  Tìm kiếm công thức nấu ăn trên internet, trích lọc dữ liệu chuẩn hoá,
  rồi chuyển giao cho skill openclaw-food-system-orchestrator để lưu đúng
  cấu trúc recipes + recipe_ingredients + recipe_steps trong database.
triggers:
  - tìm công thức
  - search recipe
  - tìm cách nấu
  - món ăn
  - recipe lookup
  - tìm món
tools:
  - web_search
  - web_fetch
delegates_to:
  - openclaw-food-system-orchestrator
---

# Recipe Web Searcher

## Mục đích

Skill này chịu trách nhiệm:

1. Nhận yêu cầu tìm công thức từ người dùng.
2. Tìm nguồn đáng tin cậy trên web.
3. Trích lọc và chuẩn hoá payload recipe theo schema hiện tại.
4. Delegate cho `openclaw-food-system-orchestrator` để ghi dữ liệu vào DB.

> Skill này **không tự chạy SQL**.

---

## Database Shape (must-follow)

### `public.recipes`

Lưu metadata công thức:

- `title`, `description`
- `source_url`, `image_url`
- `cook_time_minutes`, `prep_time_minutes`, `servings`
- `difficulty` (`easy|medium|hard`)
- `visibility` (`private|shared`)
- `source` (`user|system`)
- `tags` (`text[]`)

### `public.recipe_ingredients`

Lưu nguyên liệu theo recipe:

- `recipe_id`, `name`, `normalized_name`
- `quantity`, `unit`, `optional`, `sort_order`

### `public.recipe_steps`

Lưu các bước nấu:

- `recipe_id`, `step_number`, `instruction`, `estimated_minutes`

> Không có cột `ingredients` hay `instructions` trực tiếp trong bảng `recipes`.

---

## Quy trình thực hiện

### Bước 1 — Làm rõ yêu cầu

Thu thập:

- Tên món/từ khóa (bắt buộc)
- Ẩm thực/vùng miền (tùy chọn)
- Ràng buộc (chay, ít calo, dị ứng...) (tùy chọn)
- Số kết quả mong muốn (mặc định 3)

### Bước 2 — Tìm kiếm

Query gợi ý:

```text
"{tên món} recipe"
"{tên món} công thức nấu ăn"
"{tên món} {ẩm thực} recipe ingredients instructions"
```

Fallback:

```text
"best {tên món} recipe site:cookpad.com OR site:dienmayxanh.com OR site:allrecipes.com"
```

Nguồn ưu tiên: cookpad, dienmayxanh/vao-bep, cooky, allrecipes, serious eats, budgetbytes.

### Bước 3 — Fetch và trích lọc

Mỗi candidate cần cố gắng trích các field:

- `title` (required)
- `description` (optional)
- `ingredients` (required)
- `steps` (required)
- `prepTimeMinutes` (optional)
- `cookTimeMinutes` (optional)
- `servings` (optional)
- `sourceUrl` (required)
- `imageUrl` (optional)
- `tags` (optional)

### Bước 4 — Chuẩn hoá payload

Payload trao cho orchestrator nên theo format app-level (camelCase):

```json
{
  "title": "Phở bò Hà Nội",
  "description": "Công thức phở bò truyền thống",
  "sourceUrl": "https://example.com/pho-bo",
  "imageUrl": "https://example.com/pho-bo.jpg",
  "cookTimeMinutes": 240,
  "prepTimeMinutes": 30,
  "servings": 6,
  "difficulty": "medium",
  "visibility": "private",
  "source": "user",
  "tags": ["món việt", "món nước", "thịt bò"],
  "ingredients": [
    { "name": "xương bò", "quantity": 1.5, "unit": "kg", "optional": false },
    { "name": "gừng", "quantity": 1, "unit": "nhánh", "optional": false }
  ],
  "steps": [
    { "instruction": "Chần xương bò", "estimatedMinutes": 15 },
    { "instruction": "Ninh nước dùng", "estimatedMinutes": 180 }
  ]
}
```

Rules:

- `sourceUrl` phải là URL gốc bài công thức.
- `ingredients[].name` bắt buộc, giữ thứ tự xuất hiện.
- `steps[].instruction` bắt buộc, giữ thứ tự bước.
- `difficulty` nếu không chắc: dùng `easy`.
- `tags` **luôn là tiếng Việt**, viết thường, không trộn tiếng Anh.
- Nếu nguồn gốc dùng tag tiếng Anh thì phải dịch nghĩa sang tiếng Việt trước khi lưu.
- Ưu tiên tag ngắn, rõ nghĩa theo ngữ cảnh món ăn (ví dụ: `món nước`, `chiên`, `hải sản`, `ăn sáng`).
- Không bịa dữ liệu khi nguồn không có.

### Bước 5 — Xác nhận user trước khi lưu

Luôn tóm tắt:

```text
📋 Công thức: {title}
🔗 Nguồn: {sourceUrl}
🥬 Nguyên liệu: {n} mục
🧾 Các bước: {m} bước
⏱️ Thời gian: chuẩn bị {prepTimeMinutes} phút, nấu {cookTimeMinutes} phút
🍽️ Khẩu phần: {servings}
```

Hỏi rõ: “Bạn muốn lưu công thức này vào hệ thống không?”

### Bước 6 — Delegate cho orchestrator

Khi user đồng ý, chuyển payload cho `openclaw-food-system-orchestrator` với yêu cầu ghi **multi-table**:

1. Insert `recipes`.
2. Insert `recipe_ingredients` theo `recipe_id` vừa tạo.
3. Insert `recipe_steps` theo `recipe_id` vừa tạo.

Kèm nhắc orchestrator:

- Dùng `source_url` từ payload `sourceUrl`.
- Dùng `apply_migration` nếu phải đổi schema.
- Dùng `execute_sql` cho DML.

---

## Error Handling

| Tình huống | Cách xử lý |
|---|---|
| Không có kết quả phù hợp | Đổi query, nới nguồn tìm kiếm |
| Fetch lỗi / trang chặn bot | Bỏ qua và thử nguồn khác |
| Thiếu ingredients hoặc steps | Báo user là nguồn không đủ dữ liệu để lưu |
| User từ chối lưu | Hỏi có muốn tìm công thức khác |
| Nghi ngờ trùng công thức | Báo orchestrator dedupe theo title trước khi insert |
