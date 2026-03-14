# Food Diary — Implementation Checklist

**Created:** 2026-03-14

---

## MVP A — Log nhanh + Memory quán–món

### Phase 1: Foundation
- [ ] **1.1** Create `supabase/database/diary-tables.sql` (4 tables: venues, menu_items, meal_logs, meal_item_entries)
- [ ] **1.2** Create RLS policies for all 4 tables
- [ ] **1.3** Create indexes (user_id, venue_id, logged_at)
- [ ] **1.4** Create updated_at triggers
- [ ] **1.5** Create `src/api/diary/types.ts` (Venue, MenuItem, MealLog, MealItemEntry + Db types + inputs + helpers)

### Phase 2: Data Layer
- [ ] **2.1** Create `src/api/diary/venues.api.ts` (IVenuesApi interface + supabase impl + mock impl + mappers)
- [ ] **2.2** Create `src/api/diary/meal-logs.api.ts` (IMealLogsApi + supabase + mock + mappers)
- [ ] **2.3** Create `src/api/diary/menu-items.api.ts` (IMenuItemsApi + supabase + mock + mappers)
- [ ] **2.4** Create `src/api/diary/meal-item-entries.api.ts` (IMealItemEntriesApi + supabase + mock + mappers)
- [ ] **2.5** Create `src/api/diary/use-venues.ts` (useVenues, useVenue, useVenueSearch)
- [ ] **2.6** Create `src/api/diary/use-venue-mutations.ts` (useAddVenue, useUpdateVenue, useDeleteVenue)
- [ ] **2.7** Create `src/api/diary/use-meal-logs.ts` (useMealLogs, useMealLog, useRecentMealLogs)
- [ ] **2.8** Create `src/api/diary/use-meal-log-mutations.ts` (useAddMealLog, useUpdateMealLog, useDeleteMealLog)
- [ ] **2.9** Create `src/api/diary/use-menu-items.ts` (useMenuItems, useAllMenuItems)
- [ ] **2.10** Create `src/api/diary/use-menu-item-mutations.ts` (useAddMenuItem, useUpdateMenuItem, useDeleteMenuItem)
- [ ] **2.11** Create `src/api/diary/index.ts` (barrel export)

### Phase 3: UI Foundation
- [ ] **3.1** Create `src/store/diary.store.ts` (filters + modal state)
- [ ] **3.2** Update `src/components/layout/main-bottom-nav.tsx` — add 5th "Diary" tab (UtensilsCrossed icon)
- [ ] **3.3** Update `src/App.tsx` — add diary routes (/diary, /diary/log, /diary/history, /diary/venue/:id)
- [ ] **3.4** Update `src/components/layout/main-layout.tsx` — FAB behavior for /diary routes
- [ ] **3.5** Create `src/components/diary/rating-input.tsx`
- [ ] **3.6** Create `src/components/diary/cost-input.tsx`
- [ ] **3.7** Create `src/components/diary/meal-type-selector.tsx`
- [ ] **3.8** Create `src/components/diary/meal-type-badge.tsx`
- [ ] **3.9** Create `src/components/diary/venue-status-badge.tsx`

### Phase 4: Core Pages
- [ ] **4.1** Create `src/components/diary/meal-log-card.tsx`
- [ ] **4.2** Create `src/pages/diary/DiaryDashboard.tsx` (quick log buttons + recent meals + favorite venues)
- [ ] **4.3** Create `src/pages/diary/QuickLogPage.tsx` (type → cost → save, progressive disclosure)
- [ ] **4.4** Create `src/pages/diary/MealHistoryPage.tsx` (filters, grouped by date)

### Phase 5: CRM Features
- [ ] **5.1** Create `src/components/diary/venue-picker.tsx` (autocomplete + create new)
- [ ] **5.2** Create `src/components/diary/venue-card.tsx`
- [ ] **5.3** Create `src/components/diary/dish-entry-form.tsx`
- [ ] **5.4** Create `src/pages/diary/VenueDetailPage.tsx` (info + món tủ + visit history)
- [ ] **5.5** Create `src/pages/diary/MealLogDetailSheet.tsx` (full edit bottom sheet)
- [ ] **5.6** Enhance QuickLogPage with venue picker + progressive disclosure

### Phase 6: Polish
- [ ] **6.1** Add suggestions logic in DiaryDashboard (recent + frequent venues, món tủ)
- [ ] **6.2** Add empty states for all diary lists
- [ ] **6.3** Add loading skeletons for diary pages
- [ ] **6.4** Add error handling for diary mutations
- [ ] **6.5** Create `src/components/diary/index.ts` (barrel export)
- [ ] **6.6** Update `src/components/index.ts` with diary exports
- [ ] **6.7** Update `src/store/index.ts` with diary store export
- [ ] **6.8** Update `src/api/index.ts` with diary API re-exports
- [ ] **6.9** `npm run lint` passes
- [ ] **6.10** `npm run build` passes

### Verification — MVP A
- [ ] **V.1** Bottom nav shows 5 tabs, Diary tab active at /diary
- [ ] **V.2** Quick log: type → amount → save in < 20 seconds
- [ ] **V.3** Meal appears in history after save
- [ ] **V.4** Create venue → log at venue → venue detail shows visit
- [ ] **V.5** Add dishes to meal → mark favorite → venue shows "món tủ"
- [ ] **V.6** History filters work (type, search, sort)
- [ ] **V.7** Mock API works with VITE_USE_MOCK_API=true

---

## MVP B — CRM Sâu + Dashboard Nhẹ

### Database
- [ ] **B.1** Add delivery columns to `meal_logs` (delivery_fee, service_fee, tip, voucher_discount, order_time, delivery_time, delivery_rating)
- [ ] **B.2** Create `price_history` table + RLS
- [ ] **B.3** Create `rating_history` table + RLS

### Data Layer
- [ ] **B.4** Update MealLog types with delivery fields
- [ ] **B.5** Create PriceHistory types + API + hooks
- [ ] **B.6** Create RatingHistory types + API + hooks
- [ ] **B.7** Update meal-logs.api.ts to handle delivery fields
- [ ] **B.8** Create analytics computation hooks (top venues, spending trends)

### UI
- [ ] **B.9** Create `src/components/diary/delivery-detail-form.tsx`
- [ ] **B.10** Create `src/components/diary/price-history-chart.tsx`
- [ ] **B.11** Create `src/components/diary/rating-timeline.tsx`
- [ ] **B.12** Create `src/pages/diary/AnalyticsDashboard.tsx`
- [ ] **B.13** Create `src/components/diary/reorder-combo-card.tsx`
- [ ] **B.14** Add /diary/analytics route

### Verification — MVP B
- [ ] **BV.1** Delivery log correctly splits fees
- [ ] **BV.2** Analytics charts display with correct data
- [ ] **BV.3** Price history chart shows when ≥2 data points
- [ ] **BV.4** Rating timeline shows change history
- [ ] **BV.5** Re-order combo pre-fills QuickLogPage

---

## MVP C — Discovery Nâng Cao

### Data & Logic
- [ ] **C.1** Add `cuisine TEXT[]` column to venues
- [ ] **C.2** Create `src/api/diary/use-diary-suggestions.ts` (useForgottenGems, useRandomSuggestion)
- [ ] **C.3** Create `src/lib/diary/nudge-engine.ts` (rule evaluation functions)
- [ ] **C.4** Forgotten gems query: favorite/high-rated venues, last visit > 30 days
- [ ] **C.5** Random weighted logic: weight by rating, recency, exclude blacklisted

### UI
- [ ] **C.6** Create `src/components/diary/forgotten-gems-section.tsx`
- [ ] **C.7** Create `src/components/diary/random-suggestion.tsx` ("Suggest me" button + reveal)
- [ ] **C.8** Create `src/components/diary/nudge-banner.tsx`
- [ ] **C.9** Create `src/components/diary/cuisine-filter.tsx`
- [ ] **C.10** Add forgotten gems + nudge banners to DiaryDashboard
- [ ] **C.11** Add cuisine filter to MealHistoryPage

### Nudge Rules
- [ ] **C.12** Rule: "Ăn delivery N lần liên tiếp → gợi ý dine-in"
- [ ] **C.13** Rule: "Phí ship tuần này cao hơn trung bình"
- [ ] **C.14** Rule: "Menu chưa thử tại quán yêu thích"

### Verification — MVP C
- [ ] **CV.1** Forgotten gems shows favorite venues not visited in 30+ days
- [ ] **CV.2** Random suggestion returns non-blacklisted venue
- [ ] **CV.3** Nudge banner appears when conditions met
- [ ] **CV.4** Cuisine filter works in history

---

## MVP D — Automation

### OCR Receipt Scanning
- [ ] **D.1** Create Supabase Edge Function `supabase/functions/ocr-receipt/index.ts`
- [ ] **D.2** Create `src/api/diary/ocr.api.ts` + `use-ocr.ts`
- [ ] **D.3** Create `src/pages/diary/ScanReceiptPage.tsx` (camera capture)
- [ ] **D.4** Create `src/pages/diary/VerifyScannedItemsPage.tsx` (confirm/edit extracted data)
- [ ] **D.5** Add `receipt_image_url` + `source` columns to meal_logs

### Transaction Parsing
- [ ] **D.6** Create `src/lib/diary/transaction-parser.ts` (regex: extract amount + merchant from SMS)
- [ ] **D.7** Create `src/components/diary/transaction-paste.tsx` (paste SMS → suggest log)
- [ ] **D.8** Fuzzy match merchant name → existing venues

### Data Export
- [ ] **D.9** Create `src/lib/diary/export.ts` (CSV + JSON generation)
- [ ] **D.10** Create `src/pages/diary/ExportPage.tsx` (date range filter + download)
- [ ] **D.11** Add /diary/export route

### Geolocation
- [ ] **D.12** Create `src/hooks/use-user-location.ts` (Browser Geolocation API)
- [ ] **D.13** Create `src/components/diary/nearby-venues.tsx`
- [ ] **D.14** Proximity sorting for venues on Dashboard

### Verification — MVP D
- [ ] **DV.1** OCR: capture receipt → extract ≥80% items correctly
- [ ] **DV.2** Transaction parse: paste SMS → correct amount + merchant
- [ ] **DV.3** Export CSV contains correct filtered data
- [ ] **DV.4** Nearby venues sorted by distance when location available
