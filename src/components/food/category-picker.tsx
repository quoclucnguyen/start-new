import * as React from 'react';
import { cn } from '@/lib/utils';
import { Selector } from 'antd-mobile';
import type { FoodCategory } from '@/api/types';
import { Apple, Carrot, Milk, Beef, CupSoda, Package, MoreHorizontal } from 'lucide-react';

interface CategoryPickerProps {
  value?: FoodCategory;
  onChange?: (value: FoodCategory) => void;
  className?: string;
}

const categoryOptions: { value: FoodCategory; label: string; icon: React.ReactNode }[] = [
  { value: 'fruits', label: 'Fruits', icon: <Apple size={16} /> },
  { value: 'vegetables', label: 'Vegetables', icon: <Carrot size={16} /> },
  { value: 'dairy', label: 'Dairy', icon: <Milk size={16} /> },
  { value: 'meat', label: 'Meat', icon: <Beef size={16} /> },
  { value: 'drinks', label: 'Drinks', icon: <CupSoda size={16} /> },
  { value: 'pantry', label: 'Pantry', icon: <Package size={16} /> },
  { value: 'other', label: 'Other', icon: <MoreHorizontal size={16} /> },
];

const CategoryPicker = React.forwardRef<HTMLDivElement, CategoryPickerProps>(
  ({ value, onChange, className }, ref) => {
    const handleChange = (values: string[]) => {
      if (values.length > 0) {
        onChange?.(values[0] as FoodCategory);
      }
    };

    return (
      <div ref={ref} className={cn('w-full', className)}>
        <div className="overflow-x-auto -mx-4 px-4 scrollbar-hide">
          <Selector
            value={value ? [value] : []}
            onChange={handleChange}
            options={categoryOptions.map((opt) => ({
              value: opt.value,
              label: (
                <div className="flex items-center gap-1.5">
                  {opt.icon}
                  <span>{opt.label}</span>
                </div>
              ),
            }))}
            showCheckMark={false}
            style={{
              '--border-radius': '9999px',
              '--border': '1px solid var(--border)',
              '--checked-border': '1px solid var(--primary)',
              '--padding': '8px 16px',
              '--checked-color': 'var(--primary)',
              '--checked-text-color': 'var(--foreground)',
            } as React.CSSProperties}
            className="flex gap-2 flex-nowrap"
          />
        </div>
      </div>
    );
  }
);
CategoryPicker.displayName = 'CategoryPicker';

export { CategoryPicker, categoryOptions };
