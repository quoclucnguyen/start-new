import { createMemoryRouter, RouterProvider } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { AuthGuard } from "@/components/AuthGuard";
import { MainLayout } from "@/components/layout";
import { InventoryDashboard } from "./pages/InventoryDashboard";
import { AddFoodItemPage } from "./pages/AddFoodItemPage";
import { LoginPage } from "./pages/LoginPage";
import { SettingsPage } from "./pages/SettingsPage";
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
        element: (
          <div className="p-4 text-center text-muted-foreground">
            Shopping List (Coming Soon)
          </div>
        ),
      },
      {
        path: "recipes",
        element: (
          <div className="p-4 text-center text-muted-foreground">
            Recipes (Coming Soon)
          </div>
        ),
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
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
