# Food Diary / Personal Foodie CRM (Single-user)

Tài liệu này tổng hợp toàn bộ nội dung brainstorm cho hệ thống **quản lý ăn ngoài** theo hướng **food diary / ghi nhớ quán–món (Personal Foodie CRM)**, triển khai bằng **Supabase + React (Vite)**. Mục tiêu là **ghi nhớ trải nghiệm cá nhân** (quán, món, ghi chú, ảnh, rating) và hỗ trợ ra quyết định cho các lần ăn sau — không tập trung vào PFM nặng.

---

## 1) Mục tiêu sản phẩm (Product Goals)

### Mục tiêu cốt lõi

1. **Ghi nhớ**: Quán này ngon không? Món nào đáng gọi? Lần trước ăn gì? Có lưu ý gì (ít ngọt/không hành)?
2. **Tối ưu trải nghiệm**: Lưu rating/notes/ảnh để lần sau không “quên” cảm nhận.
3. **Ra quyết định nhanh**: Hôm nay ăn gì dựa trên lịch sử, sở thích, bối cảnh.

### Triết lý thiết kế

- **Giảm ma sát nhập liệu**: người dùng ghét nhập tay; log phải cực nhanh.
- **Dữ liệu đủ sâu để có giá trị**: không chỉ 1 dòng “chi tiêu”, mà có thể nhớ đến mức **món**.

---

## 2) Phạm vi & giả định

- **Single-user**: chỉ 1 người dùng sử dụng, không cần chia sẻ/nhóm ngay từ đầu.
- Theo dõi “ăn ngoài” gồm:
  - **Delivery** (ship đồ ăn)
  - **Dine-in** (ăn tại quán)
  - **Ready-made** (mua đồ ăn nấu sẵn ở siêu thị/cửa hàng tiện lợi)

---

## 3) Câu hỏi cốt lõi hệ thống cần trả lời

1. **Tài chính nhẹ**: tiêu bao nhiêu (đủ để tự awareness + budget optional).
2. **Trải nghiệm**: quán/món có hợp không? lần trước đánh giá thế nào?
3. **Quyết định**: hôm nay nên ăn gì/quán nào?

---

## 4) Nhóm chức năng chính (Modules)

### A. Logging & Tracking (nhập liệu thông minh)

Mục tiêu: log 1 bữa trong **10–20 giây**.

- **Quick Log / 1-tap log**: chọn loại hình (Delivery/Dine-in/Ready-made) → nhập `tổng tiền` → lưu.
- **Time auto-fill**: mặc định `now`, chỉnh nếu cần.
- **Progressive disclosure**: quán/món/ảnh/rating/notes là *optional* và có thể thêm sau.
- **Recent suggestions**:
  - Top quán gần đây
  - Top món gần đây
  - “món tủ” của quán
- (Nâng cao sau) **Geolocation**: gợi ý quán gần nhất.
- (Nâng cao sau) **OCR hóa đơn**: chụp hóa đơn → tách thông tin.
- (Nâng cao sau) **Transaction parsing**: gợi ý log từ SMS/notif biến động số dư.

### B. Foodie CRM (quản lý Quán & Món)

- **Venue (quán)** có:
  - Tags ngữ cảnh: `#date-night`, `#quick-lunch`, `#late-night`, `#work-lunch`
  - Trạng thái: **favorite / blacklist / neutral**
  - Notes: “đỗ xe ở đâu”, “wifi/pass”, “tránh giờ đông”…
- **Dish-level memory**:
  - Rating theo **món** (quan trọng hơn rating quán)
  - Notes theo món: “ít ngọt”, “đừng gọi quẩy”, “nước mắm ngon”…
  - “món tủ” + “món cần tránh” (blacklist món)

### C. Analytics thực dụng (nhẹ, phục vụ nhớ & quyết định)

- **Top quán** theo tần suất / theo tổng tiền
- **Top món** theo lượt ăn / rating
- **Chi tiêu theo thời gian** (tuần/tháng) — chỉ mức awareness.
- **Delivery fee tracking** (nếu có): tách phí ship/phí dịch vụ.

### D. Decision Support (hỗ trợ ra quyết định)

- **Random có trọng số**: ưu tiên quán rating cao, lâu chưa ăn.
- **Forgotten gems**: gợi ý quán ngon lâu chưa quay lại.
- **Rule-based nudges**:
  - ăn trùng loại món nhiều lần → gợi ý đổi món
  - phí ship cao → gợi ý dine-in gần

### E. Delivery-specific (nếu ưu tiên delivery)

- Tách **phí ship / phí dịch vụ / tip / voucher** khỏi tiền món.
- Lưu **thời gian đặt → nhận** và rating trải nghiệm giao.
- “Re-order” concept: lưu combo hay gọi để log nhanh lần sau.

### F. Ready-made-specific

- Tách **đồ ăn chính** vs **snack/đồ uống**.
- **Multi-portion**: 1 lần mua ăn được `n` bữa → tính cost per serving.
- Nhắc “ưu tiên ăn trước” (optional) dựa trên ngày mua/hạn dùng.

---

## 5) Luồng MVP (A) — Log nhanh + Memory quán–món

### Luồng 1: Log siêu nhanh (đạt chuẩn MVP)

1. Chọn loại: Delivery / Dine-in / Ready-made
2. Nhập tổng tiền
3. Bấm lưu
4. Sau lưu: cho phép **Edit details** (quán/món/ảnh/notes/rating) — không bắt buộc ngay.

### Luồng 2: Bổ sung “memory” sau khi log

- Chọn/tạo quán
- Thêm món (1–n)
- Chấm rating cho món/quán
- Thêm tags + notes + ảnh

### Luồng 3: Tra cứu nhanh

- Tìm quán → xem “món tủ”, “món cần tránh”, lịch sử gần đây.
- Tìm món → xem quán nào làm món đó hợp nhất.

---

## 6) User Stories + Acceptance Criteria (MVP A)

### US1 — Log nhanh 1 tap cho 3 loại hình

- **AC**: Chỉ cần `tổng tiền` + `thời điểm (auto now)` là lưu được.
- **AC**: Sau lưu, record xuất hiện trong History.

### US2 — Quán & Món có thể bổ sung sau

- **AC**: MealLog có thể để trống venue/món lúc tạo.
- **AC**: Có thể edit để gắn venue/món/rating/notes/ảnh.

### US3 — Gợi ý dựa trên lịch sử

- **AC**: Màn log hiển thị gợi ý “quán gần đây” và “món gần đây/món tủ”.
- **AC**: Gợi ý không làm lag UI.

### US4 — CRM nhẹ (favorite/blacklist + notes)

- **AC**: Venue có trạng thái favorite/blacklist.
- **AC**: Món có rating + note.

### US5 — Offline-first tối thiểu

- **AC**: Offline vẫn log được vào local queue.
- **AC**: Khi online, tự sync lên Supabase, tránh duplicate.

### US6 — Dữ liệu đủ cho MVP 2

- **AC**: Lưu tối thiểu để sau này có PriceHistory/RatingHistory.

---

## 7) Mô hình dữ liệu (conceptual)

Không code, chỉ để định hình dữ liệu.

- **Venue**: name, location (lat/lng), tags, is_favorite, is_blacklisted, notes
- **MenuItem**: venue_id, name, last_price, personal_rating, notes
- **MealLog**: timestamp, venue_id (nullable), type, total_cost, photos, notes, overall_rating
- **MealItemEntry**: meal_log_id, item_name, price, rating, quantity, note
- **Tag**: name
- **MealLog_Tag**: meal_log_id, tag_id
- **Photo**: meal_log_id/venue_id, url, timestamp
- **Preference** (optional): budget, preferred cuisines/areas

Quan hệ:

- Venue 1:N MealLog
- MealLog 1:N MealItemEntry
- MealLog N:N Tag
- Venue 1:N MenuItem

---

## 8) UX screens đề xuất (React)

### Screen 1 — Home / Quick Log

- 3 nút loại hình
- Input tổng tiền
- Save
- Khu vực “Suggested” (quán gần đây, món tủ)

### Screen 2 — History (Meal Logs)

- List log theo ngày
- Filter theo type / venue / tag

### Screen 3 — Venue Detail

- Món tủ + món cần tránh
- Notes
- Lịch sử ghé

### Screen 4 — Item Detail

- Rating + notes theo thời gian
- Quán nào làm món này tốt

### Screen 5 — Memory Center

- Top venues
- Top items
- Tags

---

## 9) Backlog theo pha (ưu tiên)

### MVP 1 (A) — Log nhanh + memory quán–món

- Quick log (2 field bắt buộc)
- Edit details sau
- Venue + MenuItem cơ bản
- Tagging cơ bản
- Suggestions dựa trên history

### MVP 2 — CRM sâu hơn + dashboard nhẹ

- Item-level entries đầy đủ
- Price memory (history) + rating history
- Dashboard: top venues/items, xu hướng

### MVP 3 — Discovery nâng cao

- Forgotten gems
- Random weighted
- Nudges theo rule

### MVP 4 — Automation

- OCR bill
- Import/parse transaction
- Export dữ liệu

---

## 10) Success metrics (đo lường)

- Thời gian log trung bình: **< 20 giây**
- Số log/tuần (độ bám)
- Số venue/item có notes/rating (độ sâu memory)
- Tỷ lệ dùng suggestion (CTR)

---

## 11) Rủi ro & cách giảm

- **Nhập liệu nặng** → bỏ app
  - Giải pháp: progressive disclosure, recent suggestions, templates.
- **Dữ liệu không nhất quán (tên món/quán)**
  - Giải pháp: autocomplete + chuẩn hóa dần (merge).
- **Offline sync phức tạp**
  - Giải pháp: queue đơn giản + idempotent upsert + UI sync status.

---

## 12) Điểm quyết định tiếp theo

Nếu triển khai MVP (A), bước tiếp theo hợp lý là:

1. Chốt danh sách **trường bắt buộc** khi log.
2. Chốt 4–5 màn hình chính (Home/History/Venue/Item/Memory).
3. Chốt mức “chi tiết món” ngay MVP 1 hay đẩy sang MVP 2.
