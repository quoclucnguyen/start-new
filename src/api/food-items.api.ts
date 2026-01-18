import type { FoodItem, CreateFoodItemInput, UpdateFoodItemInput } from './types';

/**
 * Abstract API interface for food items.
 * This allows swapping between mock and real implementations.
 */
export interface IFoodItemsApi {
  getAll(): Promise<FoodItem[]>;
  getById(id: string): Promise<FoodItem | null>;
  create(input: CreateFoodItemInput): Promise<FoodItem>;
  update(input: UpdateFoodItemInput): Promise<FoodItem>;
  delete(id: string): Promise<void>;
}

// Storage key for localStorage
const STORAGE_KEY = 'food-inventory-items';

// Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

// Simulated network delay
function delay(ms: number = 300): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Get items from localStorage
function getStoredItems(): FoodItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Save items to localStorage
function saveItems(items: FoodItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

/**
 * Mock implementation using localStorage
 */
export const mockFoodItemsApi: IFoodItemsApi = {
  async getAll(): Promise<FoodItem[]> {
    await delay();
    return getStoredItems();
  },

  async getById(id: string): Promise<FoodItem | null> {
    await delay();
    const items = getStoredItems();
    return items.find(item => item.id === id) || null;
  },

  async create(input: CreateFoodItemInput): Promise<FoodItem> {
    await delay();
    const now = new Date().toISOString();
    const newItem: FoodItem = {
      ...input,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    
    const items = getStoredItems();
    items.push(newItem);
    saveItems(items);
    
    return newItem;
  },

  async update(input: UpdateFoodItemInput): Promise<FoodItem> {
    await delay();
    const items = getStoredItems();
    const index = items.findIndex(item => item.id === input.id);
    
    if (index === -1) {
      throw new Error(`Food item with id ${input.id} not found`);
    }
    
    const updatedItem: FoodItem = {
      ...items[index],
      ...input,
      updatedAt: new Date().toISOString(),
    };
    
    items[index] = updatedItem;
    saveItems(items);
    
    return updatedItem;
  },

  async delete(id: string): Promise<void> {
    await delay();
    const items = getStoredItems();
    const filteredItems = items.filter(item => item.id !== id);
    
    if (filteredItems.length === items.length) {
      throw new Error(`Food item with id ${id} not found`);
    }
    
    saveItems(filteredItems);
  },
};

// Export the active implementation (can be swapped to real API later)
export const foodItemsApi: IFoodItemsApi = mockFoodItemsApi;
