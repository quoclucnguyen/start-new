import * as React from 'react';
import { useNavigate, useLocation } from 'react-router';
import { BottomNavigation, type NavItem } from './bottom-navigation';
import { 
  LayoutDashboard, 
  ClipboardList, 
  UtensilsCrossed,
  Utensils, 
  Settings 
} from 'lucide-react';

// Default navigation items for the app
const defaultNavItems: NavItem[] = [
  { id: 'home', label: 'Trang chủ', icon: <LayoutDashboard size={24} />, href: '/' },
  { id: 'list', label: 'Danh sách', icon: <ClipboardList size={24} />, href: '/list' },
  { id: 'diary', label: 'Nhật ký', icon: <UtensilsCrossed size={24} />, href: '/diary' },
  { id: 'recipes', label: 'Công thức', icon: <Utensils size={24} />, href: '/recipes' },
  { id: 'settings', label: 'Cài đặt', icon: <Settings size={24} />, href: '/settings' },
];

// Map paths to tab IDs
const pathToTabId: Record<string, string> = {
  '/': 'home',
  '/list': 'list',
  '/diary': 'diary',
  '/recipes': 'recipes',
  '/settings': 'settings',
};

interface MainBottomNavProps {
  items?: NavItem[];
}

/**
 * Main bottom navigation component with built-in nav items and routing.
 * Automatically syncs active tab with current route.
 */
export const MainBottomNav: React.FC<MainBottomNavProps> = ({ 
  items = defaultNavItems 
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab from current path
  const activeTab = React.useMemo(() => {
    // Check exact match first
    if (pathToTabId[location.pathname]) {
      return pathToTabId[location.pathname];
    }
    // Check if path starts with any tab path
    for (const [path, tabId] of Object.entries(pathToTabId)) {
      if (path !== '/' && location.pathname.startsWith(path)) {
        return tabId;
      }
    }
    // Default to home
    return 'home';
  }, [location.pathname]);

  const handleItemClick = (id: string) => {
    const item = items.find(i => i.id === id);
    if (item?.href) {
      navigate(item.href);
    }
  };

  return (
    <BottomNavigation
      items={items}
      activeId={activeTab}
      onItemClick={handleItemClick}
    />
  );
};
