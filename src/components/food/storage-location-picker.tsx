import * as React from 'react';
import { cn } from '@/lib/utils';
import { Selector } from 'antd-mobile';

export interface StorageLocation {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface StorageLocationPickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  locations: StorageLocation[];
  value?: string;
  onChange?: (id: string) => void;
}

const StorageLocationPicker = React.forwardRef<HTMLDivElement, StorageLocationPickerProps>(
  ({ className, locations, value, onChange, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('storage-location-picker', className)}
        {...props}
      >
        <Selector
          columns={3}
          options={locations.map((location) => ({
            label: (
              <div className="flex flex-col items-center justify-center gap-2 py-2">
                <span className="text-2xl">{location.icon}</span>
                <span className="text-sm font-medium">{location.name}</span>
              </div>
            ),
            value: location.id,
          }))}
          value={value ? [value] : []}
          onChange={(v) => {
            if (v.length > 0) {
              onChange?.(v[0]);
            }
          }}
          style={{
            '--border-radius': '12px',
            '--padding': '8px',
            '--gap': '12px',
          } as React.CSSProperties}
        />
      </div>
    );
  }
);
StorageLocationPicker.displayName = 'StorageLocationPicker';

// Default storage locations
const defaultLocations: StorageLocation[] = [
  { id: 'fridge', name: 'Fridge', icon: '🧊' },
  { id: 'freezer', name: 'Freezer', icon: '❄️' },
  { id: 'pantry', name: 'Pantry', icon: '🚪' },
];

export { StorageLocationPicker, defaultLocations };
