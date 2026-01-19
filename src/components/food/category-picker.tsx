import * as React from 'react';
import { cn } from '@/lib/utils';
import { Selector } from 'antd-mobile';
import type { FoodCategory, CategoryConfig } from '@/api/types';
import { useCategories } from '@/api';

interface CategoryPickerProps {
  value?: FoodCategory;
  onChange?: (value: FoodCategory) => void;
  className?: string;
  /** Optional: provide categories directly instead of fetching from API */
  categories?: CategoryConfig[];
}

const CategoryPicker = React.forwardRef<HTMLDivElement, CategoryPickerProps>(
  ({ value, onChange, className, categories: propCategories }, ref) => {
    const { data: fetchedCategories = [] } = useCategories();
    
    // Use provided categories or fetch from API
    const categories = propCategories || fetchedCategories;

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
            options={categories.map((cat) => ({
              value: cat.id,
              label: (
                <div className="flex items-center gap-1.5">
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
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

export { CategoryPicker };
