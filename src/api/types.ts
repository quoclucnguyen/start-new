export type StorageLocation = 'fridge' | 'pantry' | 'freezer' | 'spices';
export type FoodCategory = 'fruits' | 'vegetables' | 'dairy' | 'meat' | 'drinks' | 'pantry' | 'other';
export type QuantityUnit = 'pieces' | 'kg' | 'g' | 'l' | 'ml' | 'bottles' | 'packs';
export type ExpiryStatus = 'expiring' | 'soon' | 'good' | 'fresh';

export interface FoodItem {
  id: string;
  name: string;
  category: FoodCategory;
  storage: StorageLocation;
  expiryDate: string | null; // ISO date string
  quantity: number;
  unit: QuantityUnit;
  notes?: string;
  imageUrl?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface CreateFoodItemInput {
  name: string;
  category: FoodCategory;
  storage: StorageLocation;
  expiryDate: string | null;
  quantity: number;
  unit: QuantityUnit;
  notes?: string;
  imageUrl?: string;
}

export interface UpdateFoodItemInput {
  id: string;
  name?: string;
  category?: FoodCategory;
  storage?: StorageLocation;
  expiryDate?: string | null;
  quantity?: number;
  unit?: QuantityUnit;
  notes?: string;
  imageUrl?: string;
}

// Helper function to calculate expiry status from date
export function getExpiryStatus(expiryDate: string | null): ExpiryStatus {
  if (!expiryDate) return 'fresh';
  
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 1) return 'expiring';
  if (diffDays <= 3) return 'soon';
  if (diffDays <= 7) return 'good';
  return 'fresh';
}

// Helper function to get days until expiry
export function getDaysUntilExpiry(expiryDate: string | null): number | null {
  if (!expiryDate) return null;
  
  const now = new Date();
  const expiry = new Date(expiryDate);
  return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

// Helper to format expiry text
export function getExpiryText(expiryDate: string | null): string {
  if (!expiryDate) return 'No expiry date';
  
  const days = getDaysUntilExpiry(expiryDate);
  if (days === null) return 'No expiry date';
  
  if (days < 0) return `Expired ${Math.abs(days)} days ago`;
  if (days === 0) return 'Expires today';
  if (days === 1) return 'Expires in 1 day';
  return `Expires in ${days} days`;
}
