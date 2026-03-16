import * as React from 'react';
import { cn } from '@/lib/utils';
import { DatePicker } from 'antd-mobile';
import type { DatePickerRef } from 'antd-mobile/es/components/date-picker';
import { Calendar } from 'lucide-react';
import { getDaysUntilExpiry } from '@/api/types';

interface DatePickerInputProps {
  value?: Date | null;
  onChange?: (value: Date | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  min?: Date;
  max?: Date;
}

const DatePickerInput = React.forwardRef<DatePickerRef, DatePickerInputProps>(
  ({ value, onChange, placeholder = 'Select expiry date', className, disabled, min, max }, ref) => {
    const datePickerRef = React.useRef<DatePickerRef>(null);
    
    // Forward ref
    React.useImperativeHandle(ref, () => datePickerRef.current as DatePickerRef);

    const daysLeft = value ? getDaysUntilExpiry(value.toISOString()) : null;

    const getBadgeColor = () => {
      if (daysLeft === null) return '';
      if (daysLeft <= 1) return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
      if (daysLeft <= 3) return 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400';
      if (daysLeft <= 7) return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400';
      return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
    };

    const formatDate = (date: Date | null | undefined): string => {
      if (!date) return placeholder;
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    };

    return (
      <div
        className={cn(
          'flex items-center justify-between gap-2 h-14 px-4 rounded-xl border border-input bg-card cursor-pointer transition-colors hover:border-primary/50',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        onClick={() => {
          if (!disabled) {
            datePickerRef.current?.open();
          }
        }}
      >
        <div className="flex items-center gap-3 flex-1">
          <Calendar className="size-5 text-muted-foreground" />
          <span className={cn(
            'text-base',
            value ? 'text-foreground' : 'text-muted-foreground'
          )}>
            {formatDate(value)}
          </span>
        </div>
        
        {daysLeft !== null && (
          <span className={cn(
            'text-xs font-medium px-2 py-1 rounded-full',
            getBadgeColor()
          )}>
            {daysLeft <= 0 ? 'Expired' : `${daysLeft}d left`}
          </span>
        )}
        
        <DatePicker
          ref={datePickerRef}
          value={value || undefined}
          onConfirm={(val) => onChange?.(val)}
          min={min}
          max={max}
          cancelText="Cancel"
          confirmText="Confirm"
        >
          {() => null}
        </DatePicker>
      </div>
    );
  }
);
DatePickerInput.displayName = 'DatePickerInput';

export { DatePickerInput };
