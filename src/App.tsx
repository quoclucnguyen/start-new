import { createBrowserRouter, RouterProvider, Outlet } from 'react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { InventoryDashboard } from './pages/InventoryDashboard';
import { AddFoodItemPage } from './pages/AddFoodItemPage';
import './App.css';

// Layout wrapper with AppShell context
function RootLayout() {
  return <Outlet />;
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
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
