# Product Context

## Why This Project Exists

Food waste is a significant global issue. Households throw away billions of dollars worth of food annually, often because they forget what they have or when items expire. This app addresses the problem by providing a simple, accessible way to track kitchen inventory.

## Problems Solved

1. **"What's in my fridge?"** - Users can quickly see all items without digging through their kitchen
2. **"Is this still good?"** - Clear expiry status (expiring/soon/good/fresh) prevents eating unsafe food
3. **"I forgot I had this"** - Visual inventory with photos and search reduces forgotten items
4. **"What do I need to buy?"** - Shopping list tracking supports planned and purchased items
5. **"What can I make?"** - Recipe suggestions use current inventory and show missing ingredients

## How It Should Work

### Core User Journey

1. **Onboarding** - User opens Telegram Mini App → Auto-authenticates via Telegram or enters email/password
2. **Dashboard** - See all food items organized by expiry urgency, with color-coded indicators
3. **Add Item** - Quick form with photo, name, category, storage location, quantity, unit, expiry date
4. **Barcode Scan** - Scan product barcode → Auto-populate data from OpenFoodFacts
5. **Edit/Delete** - Modify quantities, update expiry dates, remove consumed items
6. **Filter/Search** - Find specific items by name, category, or storage location
7. **Configure** - Customize categories (emoji, color) and storage locations to match user's kitchen

### User Experience Goals

- **Speed** - Add items in under 10 seconds with barcode scanning
- **Clarity** - One-glance expiry status with color coding (red = expiring, yellow = soon, green = good)
- **Flexibility** - User-configurable categories and storage locations adapt to any kitchen
- **Reliability** - Offline-first with automatic sync when connection restored
- **Delight** - Smooth animations, touch-friendly interactions, mobile-optimized UI

## Key User Flows

### Adding a Food Item

1. Tap "+" button on dashboard
2. Optionally: Scan barcode → Auto-fill product data
3. Enter name (required)
4. Select category (fruits, vegetables, dairy, meat, etc.)
5. Select storage location (fridge, pantry, freezer, spices)
6. Optionally: Add photo
7. Set quantity and unit
8. Optionally: Set expiry date
9. Optionally: Add notes
10. Tap "Save"

### Viewing Inventory Status

1. Dashboard shows all items sorted by expiry (default)
2. Color badges indicate status: red (expiring ≤1 day), orange (≤3 days), yellow (≤7 days), green (>7 days)
3. Tap item for details or edit
4. Use search to find specific items
5. Use filters to show specific categories or storage locations

### Managing Shopping List

1. Open **List** tab from bottom navigation
2. Add items with quantity/category in a bottom sheet form
3. Mark items as purchased using checkbox toggle
4. Move checked items into inventory or clear checked items
5. Review grouped items by category for faster shopping flow

### Getting Recipe Suggestions

1. Open **Recipes** tab to see suggested recipes
2. Review match percentage and missing ingredients per recipe
3. Open recipe detail to inspect ingredients and steps
4. Add missing ingredients directly to shopping list
5. Optionally manage custom recipes in recipe management screen

### Configuration Management

1. Go to Settings → Categories or Storage Locations
2. See list of current options with emoji, color, filter visibility
3. Tap "+" to add new custom option
4. Tap existing item to edit or delete
5. Toggle "Show in Filters" to control which appear in filter chips

## Design Principles

1. **Mobile-First** - Everything designed for touch, not mouse
2. **Visual Hierarchy** - Most important info (expiry status) is most prominent
3. **Progressive Enhancement** - Core features work without photos or barcode scanning
4. **User Control** - Categories, storage locations, and filters are fully customizable
5. **Telegram Native** - Feels like part of Telegram, not a separate website
