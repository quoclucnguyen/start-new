import { createMemoryRouter, RouterProvider, Outlet } from 'react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { AuthGuard } from '@/components/AuthGuard';
import { InventoryDashboard } from './pages/InventoryDashboard';
import { AddFoodItemPage } from './pages/AddFoodItemPage';
import { LoginPage } from './pages/LoginPage';
import './App.css';

// Layout wrapper with AppShell context
function RootLayout() {
  return <Outlet />;
}

// Use MemoryRouter for Telegram Mini App (no browser history)
const router = createMemoryRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <AuthGuard>
        <RootLayout />
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: <InventoryDashboard />,
      },
      {
        path: 'add',
        element: <AddFoodItemPage />,
      },
    ],
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
