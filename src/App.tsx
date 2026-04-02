import { lazy, Suspense, type ReactNode } from "react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { AuthGuard } from "@/components/AuthGuard";
import { MainLayout } from "@/components/layout";
import "./App.css";

const InventoryDashboard = lazy(() =>
  import("@/pages/inventory").then((mod) => ({
    default: mod.InventoryDashboard,
  })),
);
const AddFoodItemPage = lazy(() =>
  import("@/pages/inventory").then((mod) => ({
    default: mod.AddFoodItemPage,
  })),
);
const BarcodeScannerPage = lazy(() =>
  import("@/pages/inventory").then((mod) => ({
    default: mod.BarcodeScannerPage,
  })),
);

const LoginPage = lazy(() =>
  import("@/pages/login").then((mod) => ({
    default: mod.LoginPage,
  })),
);
const SettingsPage = lazy(() =>
  import("@/pages/settings").then((mod) => ({
    default: mod.SettingsPage,
  })),
);
const ShoppingListPage = lazy(() =>
  import("@/pages/shopping").then((mod) => ({
    default: mod.ShoppingListPage,
  })),
);
const RecipeSuggestionsPage = lazy(() =>
  import("@/pages/recipes").then((mod) => ({
    default: mod.RecipeSuggestionsPage,
  })),
);
const RecipeManagementPage = lazy(() =>
  import("@/pages/recipes").then((mod) => ({
    default: mod.RecipeManagementPage,
  })),
);
const DiaryDashboard = lazy(() =>
  import("@/pages/diary").then((mod) => ({
    default: mod.DiaryDashboard,
  })),
);
const QuickLogPage = lazy(() =>
  import("@/pages/diary").then((mod) => ({
    default: mod.QuickLogPage,
  })),
);
const MealHistoryPage = lazy(() =>
  import("@/pages/diary").then((mod) => ({
    default: mod.MealHistoryPage,
  })),
);
const VenueDetailPage = lazy(() =>
  import("@/pages/diary").then((mod) => ({
    default: mod.VenueDetailPage,
  })),
);

function withSuspense(element: ReactNode) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[40vh] text-sm text-muted-foreground">
          Đang tải...
        </div>
      }
    >
      {element}
    </Suspense>
  );
}

// Use MemoryRouter for Telegram Mini App (no browser history)
const router = createMemoryRouter([
  {
    path: "/login",
    element: withSuspense(<LoginPage />),
  },
  {
    path: "/",
    element: (
      <AuthGuard>
        <MainLayout />
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: withSuspense(<InventoryDashboard />),
      },
      {
        path: "list",
        element: withSuspense(<ShoppingListPage />),
      },
      {
        path: "recipes",
        children: [
          {
            index: true,
            element: withSuspense(<RecipeSuggestionsPage />),
          },
          {
            path: "manage",
            element: withSuspense(<RecipeManagementPage />),
          },
        ],
      },
      {
        path: "settings",
        element: withSuspense(<SettingsPage />),
      },
      {
        path: "diary",
        children: [
          {
            index: true,
            element: withSuspense(<DiaryDashboard />),
          },
          {
            path: "history",
            element: withSuspense(<MealHistoryPage />),
          },
        ],
      },
    ],
  },
  {
    path: "add",
    element: (
      <AuthGuard>
        {withSuspense(<AddFoodItemPage />)}
      </AuthGuard>
    ),
  },
  {
    path: "scan",
    element: (
      <AuthGuard>
        {withSuspense(<BarcodeScannerPage />)}
      </AuthGuard>
    ),
  },
  {
    path: "diary/log",
    element: (
      <AuthGuard>
        {withSuspense(<QuickLogPage />)}
      </AuthGuard>
    ),
  },
  {
    path: "diary/venue/:id",
    element: (
      <AuthGuard>
        {withSuspense(<VenueDetailPage />)}
      </AuthGuard>
    ),
  },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
