# Copilot Instructions

## Project Overview

This is a **Food Inventory Tracker** mobile-first React application built with Vite, TypeScript, and Tailwind CSS v4. The app helps users manage kitchen inventory, track expiry dates, and reduce food waste.

## Tech Stack & Key Libraries

- **React 19** with React Compiler enabled (via `babel-plugin-react-compiler`)
- **Tailwind CSS v4** using `@tailwindcss/vite` plugin (NOT v3 config style)
- **antd-mobile v5** for mobile UI primitives (Cards, Tags, ProgressBar, etc.)
- **shadcn/ui** components (New York style) in `src/components/ui/`
- **lucide-react** for icons
- **Zustand** for state management (store not yet implemented)
- **react-router v7** for routing
- **Storybook 10** for component development

## Architecture & File Organization

```
src/
├── components/
│   ├── ui/           # shadcn/ui base components (Button, Card, Badge, etc.)
│   ├── shared/       # Reusable app components (SearchInput, FilterChips, etc.)
│   ├── layout/       # AppShell, TopAppBar, BottomNavigation
│   ├── food/         # Domain: FoodItemCard, QuantityStepper, StorageLocationPicker
│   ├── shopping/     # Domain: Shopping list components
│   ├── recipes/      # Domain: RecipeCard, IngredientTag
│   ├── notifications/# Domain: NotificationItem, NotificationList
│   └── scanner/      # Domain: CameraViewfinder, ScannerFrame, ShutterButton
├── pages/            # Page-level components (InventoryDashboard)
├── lib/utils.ts      # cn() utility for className merging
└── store/            # Zustand stores (empty, awaiting implementation)
```

## Component Patterns

### Creating Components
- Use `React.forwardRef` pattern with explicit prop interfaces
- Use `cn()` from `@/lib/utils` for conditional classNames
- Co-locate Storybook stories: `component-name.stories.tsx` next to `component-name.tsx`
- Export from domain `index.ts`, then from root `components/index.ts`

Example structure:
```tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

interface MyComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  customProp: string;
}

const MyComponent = React.forwardRef<HTMLDivElement, MyComponentProps>(
  ({ className, customProp, ...props }, ref) => (
    <div ref={ref} className={cn('base-classes', className)} {...props} />
  )
);
MyComponent.displayName = 'MyComponent';
export { MyComponent };
```

### UI Component Conventions
- **shadcn/ui components** (`src/components/ui/`): Use `class-variance-authority` for variants
- **antd-mobile**: Wrap in AppShell's `ConfigProvider` for locale; customize via Tailwind
- Combine both: shadcn for buttons/inputs, antd-mobile for mobile-specific UI (swipe, gestures)

## Styling

### Tailwind CSS v4 (Important!)
- Uses CSS-first config in `src/index.css` with `@theme inline {}` block
- Custom CSS variables defined in `:root` (see `--primary`, `--background`, etc.)
- Color utilities: `bg-primary`, `text-muted-foreground`, `border-destructive`
- App-specific colors: `--surface`, `--warning`, `--success`

### Design Tokens
```css
--primary: #13ec5b;        /* Green accent */
--background: #f6f8f6;      /* Light gray-green */
--destructive: #e11d48;     /* Red for expiring items */
```

## Development Commands

```bash
npm run dev          # Start Vite dev server
npm run storybook    # Start Storybook on port 6006
npm run build        # TypeScript check + Vite build
npm run lint         # ESLint
```

## Mockups Reference

The `mockup/` folder contains HTML mockups with `code.html` and `screen.png` for each screen. Use these as design references when implementing pages:
- `inventory_dashboard_1-4/` - Main dashboard variations
- `add_food_item/`, `edit_food_item_1-5/` - Food item CRUD
- `shopping_list_1-3/`, `scan_shopping_receipt/` - Shopping features
- `recipe_suggestions/` - Recipe discovery
- `notifications_center_1-2/` - Alerts and notifications

## Import Aliases

Use `@/` alias for all src imports (configured in `vite.config.ts` and `tsconfig.json`):
```tsx
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
```

## Key Domain Concepts

- **ExpiryStatus**: `'expiring' | 'soon' | 'good' | 'fresh'` - color-coded urgency levels
- **Storage locations**: Fridge, Pantry, Freezer, Spices
- **Food categories**: Fruits, Vegetables, Dairy, Meat, Drinks
