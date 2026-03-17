import * as React from 'react';
import { cn } from '@/lib/utils';

interface CostInputProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  placeholder?: string;
}

export const CostInput: React.FC<CostInputProps> = ({
  value,
  onChange,
  className,
  placeholder = '0',
}) => {
  const [displayValue, setDisplayValue] = React.useState(
    value > 0 ? new Intl.NumberFormat('vi-VN').format(value) : '',
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d]/g, '');
    const num = raw ? parseInt(raw, 10) : 0;
    onChange(num);
    setDisplayValue(num > 0 ? new Intl.NumberFormat('vi-VN').format(num) : '');
  };

  return (
    <div className={cn('relative', className)}>
      <input
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full text-base font-semibold bg-secondary border border-border rounded-lg px-3 py-2 pr-6 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
        đ
      </span>
    </div>
  );
};
