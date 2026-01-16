import * as React from 'react';
import { cn } from '@/lib/utils';
import { Stepper } from 'antd-mobile';

interface QuantityStepperProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  value: number;
  min?: number;
  max?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
}

const QuantityStepper = React.forwardRef<HTMLDivElement, QuantityStepperProps>(
  ({ className, value, min = 0, max = 99, onChange, disabled = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-center h-14 bg-card border border-input rounded-xl px-2',
          disabled && 'opacity-50',
          className
        )}
        {...props}
      >
        <Stepper
          value={value}
          min={min}
          max={max}
          onChange={(val) => onChange?.(val)}
          disabled={disabled}
          style={{
            '--height': '40px',
            '--button-width': '40px',
            '--input-width': '60px',
            '--border-radius': '8px',
            '--input-font-size': '18px',
            '--button-font-size': '20px',
            width: '100%'
          } as React.CSSProperties}
        />
      </div>
    );
  }
);
QuantityStepper.displayName = 'QuantityStepper';

export { QuantityStepper };
