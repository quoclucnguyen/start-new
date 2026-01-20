# Food Inventory Manager - Telegram Mini App

A modern food inventory management Telegram Mini App built with React, TypeScript, and Supabase. Track your food items, receive expiry notifications, manage shopping lists, and get recipe suggestions based on your inventory.

## 🚀 Features

### Core Functionality
- **📦 Inventory Dashboard** - View and manage all your food items with expiry tracking
- **➕ Add Food Items** - Quickly add new items with photos, categories, and expiry dates
- **✏️ Edit Food Items** - Update item details, quantities, and dates
- **🔔 Smart Notifications** - Get alerted when items are expiring soon or running low
- **🛒 Shopping Lists** - Track items you need to purchase (Coming Soon)
- **🍳 Recipe Suggestions** - Get recipe ideas based on your available ingredients (Coming Soon)
- **📸 Receipt Scanning** - Scan shopping receipts to automatically add items (Planned)
- **⚙️ Custom Configuration** - Configure categories, storage locations, and preferences

### Technical Features
- **🔐 Telegram Authentication** - Seamless login using Telegram Mini App SDK
- **📱 Mobile-First Design** - Optimized for Telegram Mini App experience
- **🌐 Offline-Ready** - Local data storage with Supabase sync
- **🎨 Modern UI** - Built with Ant Design Mobile components and Tailwind CSS
- **⚡ Fast Performance** - React Compiler and TanStack Query for optimal performance

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library with React Compiler enabled
- **TypeScript** - Type safety and better developer experience
- **Vite** - Fast build tool and dev server
- **TanStack Query** - Powerful data fetching and caching
- **Zustand** - Lightweight state management
- **React Router** - Client-side routing (MemoryRouter for TMA)

### UI & Styling
- **Ant Design Mobile 5** - Mobile UI component library
- **Tailwind CSS 4** - Utility-first CSS framework
- **Lucide React** - Icon library
- **class-variance-authority** - Component variant management
- **clsx & tailwind-merge** - Conditional class utilities

### Backend & Services
- **Supabase** - Authentication, database, and real-time features
- **Telegram Mini App SDK** - Integration with Telegram platform

### Development Tools
- **Storybook** - Component documentation and testing
- **ESLint** - Code linting and style enforcement
- **TypeScript ESLint** - Type-aware linting rules
- **Git** - Version control

## 📁 Project Structure

```
src/
├── api/                    # API layer and data fetching
│   ├── food-items.api.ts   # Food item CRUD operations
│   ├── settings.api.ts     # Settings and configuration
│   ├── types.ts            # TypeScript type definitions
│   ├── use-food-items.ts   # React Query hooks for food items
│   ├── use-food-mutations.ts # Mutation hooks
│   └── use-settings.ts     # Settings hooks
├── components/
│   ├── food/               # Food-related components
│   │   ├── category-picker.tsx
│   │   ├── date-picker-input.tsx
│   │   ├── food-form.tsx
│   │   ├── food-item-card.tsx
│   │   ├── quantity-stepper.tsx
│   │   ├── storage-location-picker.tsx
│   │   └── unit-selector.tsx
│   ├── layout/             # Layout components
│   │   ├── app-shell.tsx
│   │   ├── bottom-navigation.tsx
│   │   ├── dashboard-top-bar.tsx
│   │   ├── main-layout.tsx
│   │   └── top-app-bar.tsx
│   ├── notifications/      # Notification components
│   ├── recipes/            # Recipe-related components
│   ├── scanner/            # Camera/scanner components
│   ├── shared/             # Reusable shared components
│   │   ├── bottom-sheet.tsx
│   │   ├── confirmation-dialog.tsx
│   │   ├── empty-state.tsx
│   │   ├── filter-chips.tsx
│   │   ├── search-input.tsx
│   │   └── section-header.tsx
│   ├── shopping/           # Shopping list components
│   └── ui/                 # Base UI components
├── contexts/               # React contexts
├── lib/                    # Utility functions and libraries
│   ├── image-upload.ts     # Image handling and compression
│   ├── query-client.ts     # TanStack Query configuration
│   ├── supabaseClient.ts   # Supabase client setup
│   ├── tma.ts              # Telegram Mini App utilities
│   └── utils.ts            # General utility functions
├── pages/                  # Page components
│   ├── InventoryDashboard.tsx
│   ├── AddFoodItemPage.tsx
│   ├── EditFoodItemSheet.tsx
│   ├── LoginPage.tsx
│   └── SettingsPage.tsx
├── store/                  # State management
│   ├── auth.store.ts       # Authentication state
│   ├── ui-store.ts         # UI state
│   └── index.ts
├── App.tsx                 # Main app component
└── main.tsx                # Entry point

mockup/                     # UI mockup designs
├── add_food_item/
├── add_or_edit_configuration_*/
├── app_configuration_settings/
├── confirm_expiry_dates/
├── edit_food_item_*/
├── inventory_dashboard_*/
├── notifications_center_*/
├── recipe_suggestions/
├── scan_shopping_receipt/
├── shopping_list_*/
└── verify_scanned_items/
```

## 🏗️ Data Models

### Food Item
```typescript
interface FoodItem {
  id: string;
  name: string;
  category: string;
  storage: string;
  expiryDate: string | null; // ISO date (YYYY-MM-DD)
  quantity: number;
  unit: 'pieces' | 'kg' | 'g' | 'l' | 'ml' | 'bottles' | 'packs';
  notes?: string;
  imageUrl?: string;
  purchaseDate?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Expiry Status
- **expiring** - Expires within 1 day
- **soon** - Expires within 3 days
- **good** - Expires within 7 days
- **fresh** - More than 7 days until expiry

### Category & Storage Configuration
Users can configure custom categories and storage locations with:
- Custom names and icons (emoji)
- Color coding (hex colors)
- Filter visibility settings
- Sort order

## 🔑 Authentication

The app uses Telegram Mini App authentication flow:

1. **InitData Retrieval** - Gets Telegram init data from TMA SDK
2. **Token Exchange** - Exchanges init data with backend for auth tokens
3. **Session Setup** - Creates Supabase session with received tokens
4. **Auto-refresh** - Maintains session with automatic token refresh

Authentication is managed via `useAuthStore` Zustand store.

## 📝 Available Scripts

```bash
# Development
npm run dev              # Start Vite dev server

# Building
npm run build            # Build for production
npm run preview          # Preview production build

# Code Quality
npm run lint             # Run ESLint

# Storybook
npm run storybook        # Start Storybook dev server
npm run build-storybook  # Build Storybook for production
```

## 🎯 Key Components

### AuthGuard
Protects authenticated routes and handles authentication redirects.

### MainLayout
Provides the main app shell with bottom navigation and top app bar.

### FoodItemCard
Displays food items with expiry indicators, quantity, and quick actions.

### FoodForm
Form for adding/editing food items with validation and image upload.

### CategoryPicker & StorageLocationPicker
User-configurable pickers for categories and storage locations.

## 🔧 Configuration

### Environment Variables
Set up your environment variables in `.env`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Telegram Mini App Setup
1. Create a bot via @BotFather on Telegram
2. Configure your Mini App URL in bot settings
3. Set up Supabase Edge Function for token exchange
4. Configure Supabase Auth to accept custom tokens

## 📱 Telegram Mini App Considerations

- Uses `MemoryRouter` instead of `BrowserRouter` (no browser history in TMA)
- Implements Telegram Mini App SDK integration
- Optimized for mobile viewport and touch interactions
- Handles Telegram theme colors and system fonts

## 🎨 UI Design Principles

- **Mobile-First** - Designed primarily for mobile devices
- **Touch-Friendly** - Large tap targets and gestures
- **Visual Hierarchy** - Clear information architecture
- **Consistent Styling** - Ant Design Mobile + Tailwind CSS
- **Accessibility** - WCAG compliant color contrasts and focus states

## 🚦 Development Workflow

1. **Component Development** - Create components with Storybook stories
2. **State Management** - Use Zustand for global state, React Query for server state
3. **API Integration** - Create API functions and React Query hooks
4. **Testing** - Test components in Storybook, verify in dev mode
5. **Type Safety** - Leverage TypeScript throughout
6. **Code Review** - Follow ESLint rules and best practices

## 📚 Documentation

- **Storybook** - Component documentation: `npm run storybook`
- **Mockups** - UI designs in `mockup/` directory
- **API Types** - TypeScript types in `src/api/types.ts`

## 🔮 Planned Features

- [ ] Shopping list management
- [ ] Recipe suggestions based on inventory
- [ ] Receipt scanning and OCR
- [ ] Family sharing and collaboration
- [ ] Advanced analytics and insights
- [ ] Barcode scanning
- [ ] Voice input for adding items
- [ ] Export/import inventory data

## 📄 License

This project is private and proprietary.

## 🤝 Contributing

This is a personal project. For questions or suggestions, please contact the maintainer.

---

Built with ❤️ using React, TypeScript, and Supabase
