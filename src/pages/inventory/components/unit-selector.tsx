/* eslint-disable react-refresh/only-export-components */
import * as React from 'react';
import { cn } from '@/lib/utils';
import { Picker } from 'antd-mobile';
import { ChevronDown } from 'lucide-react';
import type { QuantityUnit } from '@/api/types';

interface UnitSelectorProps {
  value?: QuantityUnit;
  onChange?: (value: QuantityUnit) => void;
  className?: string;
}

const unitOptions: { value: QuantityUnit; label: string }[] = [
  { value: 'pieces', label: 'Cái' },
  { value: 'kg', label: 'Kg' },
  { value: 'g', label: 'Gram' },
  { value: 'l', label: 'Lít' },
  { value: 'ml', label: 'mL' },
  { value: 'bottles', label: 'Chai' },
  { value: 'packs', label: 'Gói' },
];

const UnitSelector = React.forwardRef<HTMLDivElement, UnitSelectorProps>(
  ({ value = 'pieces', onChange, className }, ref) => {
    const [visible, setVisible] = React.useState(false);

    const selectedLabel = unitOptions.find((opt) => opt.value === value)?.label || 'Cái';

    return (
      <div ref={ref} className={cn('inline-flex', className)}>
        <div
          className="flex items-center gap-1 px-3 py-2 rounded-lg border border-input bg-card cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => setVisible(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setVisible(true)}
        >
          <span className="text-sm text-foreground">{selectedLabel}</span>
          <ChevronDown className="size-4 text-muted-foreground" />
        </div>
        
        <Picker
          visible={visible}
          onClose={() => setVisible(false)}
          columns={[unitOptions]}
          value={[value]}
          onConfirm={(val) => {
            if (val[0]) {
              onChange?.(val[0] as QuantityUnit);
            }
            setVisible(false);
          }}
          cancelText="Hủy"
          confirmText="Xong"
        >
          {() => null}
        </Picker>
      </div>
    );
  }
);
UnitSelector.displayName = 'UnitSelector';

export { UnitSelector, unitOptions };
