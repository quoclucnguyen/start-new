import { createMemoryRouter, RouterProvider } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { AuthGuard } from "@/components/AuthGuard";
import { MainLayout } from "@/components/layout";
import { InventoryDashboard } from "./pages/InventoryDashboard";
import { AddFoodItemPage } from "./pages/AddFoodItemPage";
import { BarcodeScannerPage } from "./pages/BarcodeScannerPage";
import { LoginPage } from "./pages/LoginPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ShoppingListPage } from "@/components/shopping/shopping-list-page";
import { RecipeManagementPage } from "@/components/recipes/recipe-management-page";
import { RecipeSuggestionsPage } from "@/components/recipes/recipe-suggestions-page";
import { DiaryDashboard } from "@/pages/diary/DiaryDashboard";
import { QuickLogPage } from "@/pages/diary/QuickLogPage";
import { MealHistoryPage } from "@/pages/diary/MealHistoryPage";
import { VenueDetailPage } from "@/pages/diary/VenueDetailPage";
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
