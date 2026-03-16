import { createMemoryRouter, RouterProvider } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { AuthGuard } from "@/components/AuthGuard";
import { MainLayout } from "@/components/layout";
import { InventoryDashboard, AddFoodItemPage, BarcodeScannerPage } from "@/pages/inventory";
import { LoginPage } from "@/pages/login";
import { SettingsPage } from "@/pages/settings";
import { ShoppingListPage } from "@/pages/shopping";
import { RecipeManagementPage, RecipeSuggestionsPage } from "@/pages/recipes";
import { DiaryDashboard, QuickLogPage, MealHistoryPage, VenueDetailPage } from "@/pages/diary";
import "./App.css";

// Use MemoryRouter for Telegram Mini App (no browser history)
const router = createMemoryRouter([
  {
    path: "/login",
    element: <LoginPage />,
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
        element: <InventoryDashboard />,
      },
      {
        path: "list",
        element: <ShoppingListPage />,
      },
      {
        path: "recipes",
        children: [
          {
            index: true,
            element: <RecipeSuggestionsPage />,
          },
          {
            path: "manage",
            element: <RecipeManagementPage />,
          },
        ],
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
      {
        path: "diary",
        children: [
          {
            index: true,
            element: <DiaryDashboard />,
          },
          {
            path: "history",
            element: <MealHistoryPage />,
          },
        ],
      },
    ],
  },
  {
    path: "add",
    element: (
      <AuthGuard>
        <AddFoodItemPage />
      </AuthGuard>
    ),
  },
  {
    path: "scan",
    element: (
      <AuthGuard>
        <BarcodeScannerPage />
      </AuthGuard>
    ),
  },
  {
    path: "diary/log",
    element: (
      <AuthGuard>
        <QuickLogPage />
      </AuthGuard>
    ),
  },
  {
    path: "diary/venue/:id",
    element: (
      <AuthGuard>
        <VenueDetailPage />
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
