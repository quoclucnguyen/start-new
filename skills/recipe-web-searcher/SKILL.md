---
name: recipe-web-searcher
description: >
  Tìm kiếm công thức nấu ăn trên internet, trích lọc thông tin chi tiết,
  sau đó chuyển giao cho skill food-system-orchestrator để lưu vào database.
  Sử dụng khi người dùng muốn tìm và nhập công thức mới từ web.
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
  - food-system-orchestrator
---

# Recipe Web Searcher

## Mục đích

Skill này chịu trách nhiệm:
1. Nhận yêu cầu tìm công thức từ người dùng
2. Sử dụng search tool để tìm công thức trên internet
3. Trích lọc và chuẩn hoá dữ liệu công thức
4. Chuyển giao dữ liệu đã chuẩn hoá cho skill **food-system-orchestrator** để INSERT vào bảng `recipes`

## Quy trình thực hiện

### Bước 1 — Xác định yêu cầu

Hỏi hoặc suy luận từ ngữ cảnh các thông tin sau:
- **Tên món ăn** hoặc từ khoá tìm kiếm (bắt buộc)
- **Ẩm thực / vùng miền** (tuỳ chọn, ví dụ: Việt Nam, Hàn Quốc, Ý)
- **Hạn chế / yêu cầu đặc biệt** (tuỳ chọn, ví dụ: chay, ít calo, không gluten)
- **Số lượng kết quả mong muốn** (mặc định: 3)

### Bước 2 — Tìm kiếm trên web

Thực hiện search với các chiến lược query sau (ưu tiên từ trên xuống):

```
"{tên món} recipe"
"{tên món} công thức nấu ăn"
"{tên món} {ẩm thực} recipe ingredients instructions"
```

Nếu kết quả không đủ chất lượng, thử mở rộng:
```
"best {tên món} recipe site:allrecipes.com OR site:cookpad.com OR site:cooky.vn"
```

Ưu tiên nguồn đáng tin cậy:
- cooky.vn, dienmayxanh.com/vao-bep, cookpad.com (tiếng Việt)
- allrecipes.com, seriouseats.com, budgetbytes.com (tiếng Anh)

### Bước 3 — Fetch và trích lọc

Với mỗi kết quả tìm được, dùng `web_fetch` để lấy nội dung trang. Trích lọc chính xác các trường sau:

| Trường | Mô tả | Bắt buộc |
|--------|--------|----------|
| `title` | Tên công thức | ✅ |
| `description` | Mô tả ngắn về món ăn | ❌ |
| `ingredients` | Danh sách nguyên liệu kèm số lượng | ✅ |
| `instructions` | Các bước thực hiện theo thứ tự | ✅ |
| `prep_time` | Thời gian chuẩn bị (phút, kiểu integer) | ❌ |
| `cook_time` | Thời gian nấu (phút, kiểu integer) | ❌ |
| `servings` | Số phần ăn (kiểu integer) | ❌ |
| `source_url` | URL gốc của công thức | ✅ |
| `image_url` | URL ảnh minh hoạ | ❌ |
| `tags` | Mảng tag phân loại | ❌ |

### Bước 4 — Chuẩn hoá dữ liệu

Chuyển đổi dữ liệu trích lọc sang đúng format của bảng `recipes`:

```json
{
  "title": "Phở Bò Hà Nội",
  "description": "Công thức phở bò truyền thống Hà Nội với nước dùng ninh xương 12 tiếng",
  "ingredients": [
    { "name": "xương ống bò", "quantity": "1.5", "unit": "kg" },
    { "name": "thịt bò tái", "quantity": "300", "unit": "g" },
    { "name": "bánh phở tươi", "quantity": "500", "unit": "g" },
    { "name": "hành tây", "quantity": "2", "unit": "củ" },
    { "name": "gừng", "quantity": "1", "unit": "nhánh" },
    { "name": "hoa hồi", "quantity": "3", "unit": "cánh" },
    { "name": "quế", "quantity": "1", "unit": "thanh" },
    { "name": "nước mắm", "quantity": "3", "unit": "tbsp" }
  ],
  "instructions": [
    "Rửa sạch xương, chần qua nước sôi, rửa lại.",
    "Nướng hành tây và gừng đến khi cháy xém vỏ ngoài.",
    "Cho xương vào nồi với 4 lít nước, đun sôi, hớt bọt.",
    "Thêm hành nướng, gừng nướng, hoa hồi, quế. Ninh lửa nhỏ 6-12 tiếng.",
    "Lọc nước dùng, nêm nước mắm và muối vừa ăn.",
    "Trụng bánh phở qua nước sôi, cho vào tô.",
    "Xếp thịt bò tái lên trên, chan nước dùng sôi.",
    "Thêm hành lá, rau mùi. Ăn kèm giá, húng quế, chanh, ớt."
  ],
  "prep_time": 30,
  "cook_time": 720,
  "servings": 6,
  "source_url": "https://example.com/pho-bo-ha-noi",
  "image_url": "https://example.com/pho.jpg",
  "tags": ["vietnamese", "soup", "beef", "traditional"]
}
```

**Quy tắc chuẩn hoá:**
- `ingredients` phải là mảng JSON, mỗi phần tử có ít nhất `name`; `quantity` và `unit` nếu có
- `instructions` phải là mảng string, mỗi phần tử là một bước riêng biệt, đúng thứ tự
- `prep_time` và `cook_time` luôn tính bằng phút (integer)
- `tags` là mảng string, viết thường, không dấu tiếng Việt, dùng tiếng Anh
- Nếu nguồn gốc không cung cấp một trường tuỳ chọn → bỏ qua trường đó, KHÔNG bịa dữ liệu

### Bước 5 — Xác nhận với người dùng

Trước khi lưu, LUÔN trình bày tóm tắt công thức đã trích lọc cho người dùng xem:

```
📋 Công thức tìm được: {title}
   Nguồn: {source_url}
   Nguyên liệu: {số lượng} items
   Các bước: {số bước} bước
   Thời gian: chuẩn bị {prep_time} phút, nấu {cook_time} phút
   Khẩu phần: {servings} người
```

Hỏi: "Bạn muốn lưu công thức này vào hệ thống không?"

### Bước 6 — Chuyển giao cho food-system-orchestrator

Khi người dùng xác nhận, **uỷ quyền** (delegate) cho skill `food-system-orchestrator` thực hiện INSERT vào bảng `recipes`.

Câu lệnh INSERT mẫu mà food-system-orchestrator sẽ chạy:

```sql
INSERT INTO public.recipes (
  user_id,
  title,
  description,
  ingredients,
  instructions,
  prep_time,
  cook_time,
  servings,
  source_url,
  image_url,
  tags,
  created_at,
  updated_at
) VALUES (
  :current_user_id,
  :title,
  :description,
  :ingredients::jsonb,
  :instructions::jsonb,
  :prep_time,
  :cook_time,
  :servings,
  :source_url,
  :image_url,
  :tags::text[],
  now(),
  now()
);
```

**Lưu ý:** skill này KHÔNG tự chạy SQL. Nó chuẩn bị payload rồi delegate cho food-system-orchestrator xử lý phần ghi dữ liệu, tuân thủ đúng quy trình bảo mật (RLS, xác nhận user, v.v.) đã định nghĩa trong skill đó.

## Xử lý lỗi

| Tình huống | Hành động |
|-----------|-----------|
| Không tìm thấy kết quả | Thử query thay thế, nếu vẫn không có → báo người dùng |
| Trang web không fetch được | Bỏ qua, thử kết quả tiếp theo |
| Thiếu ingredients hoặc instructions | Không đủ điều kiện lưu → báo người dùng trang nguồn không đầy đủ |
| Người dùng từ chối lưu | Hỏi muốn tìm công thức khác hay dừng |
| Trùng title trong DB | Cảnh báo người dùng, hỏi có muốn lưu thêm bản mới không |

## Ví dụ tương tác

**User:** Tìm giúp tôi công thức làm bánh mì Việt Nam
**Agent:**
1. Search: `"bánh mì Việt Nam recipe"`, `"Vietnamese banh mi recipe ingredients"`
2. Fetch top 3 kết quả, trích lọc thông tin
3. Trình bày tóm tắt 3 công thức cho user chọn
4. User chọn → chuẩn hoá → xác nhận → delegate INSERT cho food-system-orchestrator
```
