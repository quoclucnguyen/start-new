import * as React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { AppShell } from './app-shell';
import { DashboardTopBar } from './dashboard-top-bar';
import { MainBottomNav } from './main-bottom-nav';
import { Plus } from 'lucide-react';

/** Routes that provide their own FAB */
const ROUTES_WITH_OWN_FAB = ['/list', '/recipes', '/recipes/manage'];

interface MainLayoutProps {
  /** Show floating action button */
  showFab?: boolean;
  /** FAB click handler or path to navigate */
  onFabClick?: string | (() => void);
  /** Custom top bar (replaces DashboardTopBar) */
  topBar?: React.ReactNode;
  /** Hide bottom navigation */
  hideBottomNav?: boolean;
  /** Notification count for top bar */
  notificationCount?: number;
}

/**
 * Main layout for dashboard pages.
 * Includes AppShell, TopBar, BottomNav, and optional FAB.
 */
export const MainLayout: React.FC<MainLayoutProps> = ({
  showFab = true,
  onFabClick = '/add',
  topBar,
  hideBottomNav = false,
  notificationCount = 0,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const shouldShowFab = showFab && !ROUTES_WITH_OWN_FAB.includes(location.pathname);

  const fabTarget = location.pathname.startsWith('/diary') ? '/diary/log' : onFabClick;

  const handleFabClick = () => {
    if (typeof fabTarget === 'string') {
      navigate(fabTarget);
    } else {
      fabTarget();
    }
  };

  return (
    <AppShell>
      {topBar ?? <DashboardTopBar notificationCount={notificationCount} />}

      <main className="flex-1 flex flex-col pb-28 px-4 pt-1">
        <Outlet />
      </main>

      {/* Floating Action Button */}
      {shouldShowFab && (
        <div className="fixed bottom-24 right-4 z-50">
          <button
            onClick={handleFabClick}
            className="flex items-center justify-center h-14 w-14 rounded-full bg-primary shadow-lg shadow-primary/40 text-primary-foreground transform active:scale-95 transition-transform"
          >
            <Plus size={28} />
          </button>
        </div>
      )}

      {!hideBottomNav && <MainBottomNav />}
    </AppShell>
  );
};
