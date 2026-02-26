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
            element: <RecipeManagementPage />,
          },
        ],
      },
      {
        path: "settings",
        element: <SettingsPage />,
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
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
