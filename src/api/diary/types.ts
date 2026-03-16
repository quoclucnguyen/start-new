// ============================================================================
// Enums as Union Types (erasableSyntaxOnly)
// ============================================================================

export type MealType = 'delivery' | 'dine_in' | 'ready_made';
export type VenueStatus = 'favorite' | 'blacklisted' | 'neutral';

// ============================================================================
// Venue (quán ăn)
// ============================================================================

export interface Venue {
  id: string;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  status: VenueStatus;
  tags: string[];
  notes?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVenueInput {
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  status?: VenueStatus;
  tags?: string[];
  notes?: string;
  imageUrl?: string;
}

export interface UpdateVenueInput {
  id: string;
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  status?: VenueStatus;
  tags?: string[];
  notes?: string;
  imageUrl?: string;
}

export interface DbVenue {
  id: string;
  user_id: string;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  status: string;
  tags: string[] | null;
  notes: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  last_modified: string;
  deleted: boolean;
  synced: boolean;
}

// ============================================================================
// MenuItem (món ăn tại 1 quán)
// ============================================================================

export interface MenuItem {
  id: string;
  venueId: string;
  name: string;
  lastPrice?: number;
  personalRating?: number;
  isFavorite: boolean;
  isBlacklisted: boolean;
  notes?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMenuItemInput {
  venueId: string;
  name: string;
  lastPrice?: number;
  personalRating?: number;
  isFavorite?: boolean;
  isBlacklisted?: boolean;
  notes?: string;
  imageUrl?: string;
}

export interface UpdateMenuItemInput {
  id: string;
  name?: string;
  lastPrice?: number;
  personalRating?: number;
  isFavorite?: boolean;
  isBlacklisted?: boolean;
  notes?: string;
  imageUrl?: string;
}

export interface DbMenuItem {
  id: string;
  user_id: string;
  venue_id: string;
  name: string;
  last_price: number | null;
  personal_rating: number | null;
  is_favorite: boolean;
  is_blacklisted: boolean;
  notes: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  deleted: boolean;
}

// ============================================================================
// MealLog (1 bữa ăn)
// ============================================================================

export interface MealLog {
  id: string;
  venueId?: string;
  venue?: Venue;
  mealType: MealType;
  totalCost: number;
  overallRating?: number;
  notes?: string;
  photos: string[];
  tags: string[];
  loggedAt: string;
  createdAt: string;
  updatedAt: string;
  items?: MealItemEntry[];
}

export interface CreateMealLogInput {
  venueId?: string;
  mealType: MealType;
  totalCost: number;
  overallRating?: number;
  notes?: string;
  photos?: string[];
  tags?: string[];
  loggedAt?: string;
  items?: CreateMealItemEntryInput[];
}

export interface UpdateMealLogInput {
  id: string;
  venueId?: string;
  mealType?: MealType;
  totalCost?: number;
  overallRating?: number;
  notes?: string;
  photos?: string[];
  tags?: string[];
  loggedAt?: string;
}

export interface DbMealLog {
  id: string;
  user_id: string;
  venue_id: string | null;
  meal_type: string;
  total_cost: number;
  overall_rating: number | null;
  notes: string | null;
  photos: string[] | null;
  tags: string[] | null;
  logged_at: string;
  created_at: string;
  updated_at: string;
  last_modified: string;
  deleted: boolean;
  synced: boolean;
}

// ============================================================================
// MealItemEntry (chi tiết 1 món trong bữa ăn)
// ============================================================================

export interface MealItemEntry {
  id: string;
  mealLogId: string;
  menuItemId?: string;
  itemName: string;
  price?: number;
  quantity: number;
  rating?: number;
  notes?: string;
}

export interface CreateMealItemEntryInput {
  menuItemId?: string;
  itemName: string;
  price?: number;
  quantity?: number;
  rating?: number;
  notes?: string;
}

export interface UpdateMealItemEntryInput {
  id: string;
  menuItemId?: string;
  itemName?: string;
  price?: number;
  quantity?: number;
  rating?: number;
  notes?: string;
}

export interface DbMealItemEntry {
  id: string;
  meal_log_id: string;
  menu_item_id: string | null;
  item_name: string;
  price: number | null;
  quantity: number;
  rating: number | null;
  notes: string | null;
}

// ============================================================================
// Helpers
// ============================================================================

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  delivery: 'Giao hàng',
  dine_in: 'Tại chỗ',
  ready_made: 'Mang đi',
};

export const MEAL_TYPE_ICONS: Record<MealType, string> = {
  delivery: '🛵',
  dine_in: '🍽️',
  ready_made: '🏪',
};

export const VENUE_STATUS_LABELS: Record<VenueStatus, string> = {
  favorite: 'Yêu thích',
  blacklisted: 'Đưa vào danh sách đen',
  neutral: 'Bình thường',
};

export function formatCost(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
}

export function formatLogDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hôm nay';
  if (diffDays === 1) return 'Hôm qua';
  if (diffDays < 7) return `${diffDays} ngày trước`;

  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function groupLogsByDate(logs: MealLog[]): Record<string, MealLog[]> {
  const groups: Record<string, MealLog[]> = {};
  for (const log of logs) {
    const dateKey = new Date(log.loggedAt).toISOString().split('T')[0];
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(log);
  }
  return groups;
}

export function getDateGroupLabel(dateKey: string): string {
  const date = new Date(dateKey + 'T00:00:00');
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hôm nay';
  if (diffDays === 1) return 'Hôm qua';
  return date.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
  });
}
