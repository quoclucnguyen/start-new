# Tech Context

## Technology Stack

### Frontend Framework
- **React 19.2.0** - Latest React with React Compiler enabled
- **TypeScript 5.9.3** - Type safety across codebase
- **Vite 7.2.4** - Build tool and dev server

### UI Libraries
- **antd-mobile 5.42.3** - Mobile UI component library (primary component source)
- **Tailwind CSS 4.1.18** - Utility-first CSS (CSS-first config, not JS-based)
- **Lucide React 0.562.0** - Icon library
- **class-variance-authority 0.7.1** - Component variant management
- **@dnd-kit 6.3.1** - Drag and drop for future sorting features

### State & Data
- **TanStack Query 5.90.19** - Server state management, caching, mutations
- **@tanstack/query-sync-storage-persister** - localStorage persistence for queries
- **Zustand 5.0.10** - Lightweight UI state management

### Routing & Navigation
- **React Router 7.12.0** - Client-side routing with MemoryRouter for TMA

### Backend Integration
- **Supabase 2.48.0** - Authentication and active database integration across inventory/shopping/recipes/diary/settings
- **@tma.js/sdk-react 3.0.8** - Telegram Mini App SDK integration

### External APIs
- **OpenFoodFacts** - Product data via barcode (custom integration)
- **@ericblade/quagga2 1.12.1** - Barcode scanning library

### Image Processing
- **pica 9.0.1** - High-quality image compression

### Development Tools
- **ESLint 9.39.1** - Code linting
- **typescript-eslint 8.46.4** - TypeScript-aware linting
- **babel-plugin-react-compiler 1.0.0** - React Compiler optimization

## Development Setup

### Prerequisites
- Node.js (v20+ recommended)
- npm or package manager of choice

### Installation
```bash
npm install
```

### Environment Variables
Create `.env` file in project root:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

See `.env.sample` for reference.

### Running Development Server
```bash
npm run dev          # Starts Vite dev server on default port
```

### Building
```bash
npm run build        # TypeScript check + Vite production build
npm run preview      # Preview production build locally
```

### Code Quality
```bash
npm run lint         # Run ESLint on all TypeScript files
```

## Project Configuration

### Vite Configuration
[vite.config.ts](../vite.config.ts)
- Path alias: `@/*` → `./src/*`
- React plugin with babel-plugin-react-compiler
- Tailwind CSS Vite plugin

### TypeScript Configuration
[tsconfig.json](../tsconfig.json)
- Project references for app and node configs
- Path mapping matches Vite alias

### Tailwind CSS Configuration
[src/index.css](../src/index.css)
- CSS-first theme config (not tailwind.config.js)
- Primary color: `#13ec5b` (green)
- Destructive color: `#e11d48` (red)
- Uses `@theme inline` directive

### ESLint Configuration
[eslint.config.js](../eslint.config.js)
- Flat config format
- TypeScript recommended rules
- React Hooks rules
- React Refresh for Vite

## Technical Constraints

### Platform Constraints
- **Telegram Mini App**: Must work within Telegram's webview
- **Mobile-First**: Optimized for touch, not mouse/keyboard
- **No Browser History**: MemoryRouter required, affects deep linking
- **Viewport**: Telegram controls viewport, must adapt

### Browser Support
- Modern browsers with ES2020+ support
- WebView environment in Telegram app
- No IE11 or legacy browser support

### Performance Considerations
- **Image Compression**: All images compressed client-side before upload
- **Query Caching**: 5-minute default stale time, OpenFoodFacts cached for 7 days
- **Optimistic Updates**: All mutations use optimistic updates for perceived performance

### Data Limitations
- **localStorage**: Limited to ~5MB (still used in mock mode for several domains)
- **Mixed runtime mode**: Some APIs toggle mock/supabase via `VITE_USE_MOCK_API`, while settings currently use direct Supabase
- **Base64 Images**: Stored in localStorage in mock-mode development
- **Barcode Scanning**: Quality varies by device camera and lighting
- **Diary detail persistence gap**: meal dish-entry edits are not fully wired through update flows yet

## Dependency Patterns

### Component Libraries
- Prefer antd-mobile components over custom implementations
- Custom shadcn-style components in `src/components/ui/` for specialized needs

### State Management
- Always use TanStack Query for server state
- Always use Zustand for UI state
- Never use Zustand for data that comes from an API

### Styling
- Tailwind utility classes for 95% of styling
- antd-mobile's built-in styles for those components
- Custom CSS only when absolutely necessary

### Type Definitions
- Central domain types in `src/api/types.ts`
- Component prop types defined inline or in separate interfaces
- Db* prefix for database row types (snake_case)
- CamelCase for application types

## Tool Usage Patterns

### Git
- Project uses standard Git workflow
- See recent commits via `git log` for development history

### Import Aliases
- Use `@/` prefix for all src imports
- Example: `import { Button } from '@/components/ui/button'`
- Configured in both Vite and TypeScript

## Known Issues & Limitations

1. **Mixed data-source behavior**: Mock mode is not uniformly applied across all domains
2. **Barcode Scanning**: Quagga2 can be unreliable in poor lighting or with certain barcode types
3. **Image Compression**: pica can be slow on lower-end devices
4. **MemoryRouter**: Can't share deep links to specific screens
5. **No Offline Detection**: App doesn't currently detect offline state
6. **Diary edit depth**: `MealLogDetailSheet` currently updates meal-log fields but not end-to-end dish-entry persistence

## Future Technical Work

1. **Runtime Mode Consistency**: Unify mock/supabase behavior for all domains (including settings)
2. **Service Worker**: Add offline capability and caching
3. **Push Notifications**: Integrate Telegram push notifications for expiry alerts
4. **Receipt OCR**: Integrate OCR service for receipt scanning
5. **Performance Monitoring**: Add analytics and error tracking
6. **Testing**: Add unit and integration tests
7. **E2E Testing**: Add Playwright or similar for critical flows
