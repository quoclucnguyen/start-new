import * as React from 'react';
import { cn } from '@/lib/utils';
import { Selector } from 'antd-mobile';
import type { StorageLocationConfig } from '@/api/types';
import { useStorageLocations } from '@/api';

interface StorageLocationPickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** Optional: provide locations directly instead of fetching from API */
  locations?: StorageLocationConfig[];
  value?: string;
  onChange?: (id: string) => void;
}

function resolveSelectedStorageValue(
  value: string | undefined,
  locations: StorageLocationConfig[]
): string | undefined {
  if (!value) return undefined;

  const directNameMatch = locations.find((location) => location.name === value);
  if (directNameMatch) return directNameMatch.name;

  const idMatch = locations.find((location) => location.id === value);
  if (idMatch) return idMatch.name;

  const caseInsensitiveMatch = locations.find(
    (location) => location.name.toLowerCase() === value.toLowerCase()
  );
  if (caseInsensitiveMatch) return caseInsensitiveMatch.name;

  return value;
}

const StorageLocationPicker = React.forwardRef<HTMLDivElement, StorageLocationPickerProps>(
  ({ className, locations: propLocations, value, onChange, ...props }, ref) => {
    const { data: fetchedLocations = [] } = useStorageLocations();
    
    // Use provided locations or fetch from API
    const locations = propLocations || fetchedLocations;
    const selectedValue = resolveSelectedStorageValue(value, locations);

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
            value: location.name,
          }))}
          value={selectedValue ? [selectedValue] : []}
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

export { StorageLocationPicker };
