import * as React from 'react';
import { cn } from '@/lib/utils';

interface ShutterButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'default' | 'large';
  variant?: 'default' | 'recording';
}

const ShutterButton = React.forwardRef<HTMLButtonElement, ShutterButtonProps>(
  ({ className, size = 'default', variant = 'default', ...props }, ref) => {
    const sizeClasses = {
      default: 'size-16',
      large: 'size-20',
    };

    const innerSizeClasses = {
      default: 'size-12',
      large: 'size-16',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'group flex shrink-0 items-center justify-center rounded-full bg-transparent p-1 transition-transform active:scale-95',
          className
        )}
        {...props}
      >
        <div className={cn(
          'flex items-center justify-center rounded-full border-[5px] border-white group-hover:border-primary transition-colors duration-300',
          sizeClasses[size]
        )}>
          <div className={cn(
            'rounded-full transition-all duration-300 shadow-lg',
            variant === 'default' 
              ? 'bg-white group-hover:bg-primary' 
              : 'bg-red-500 group-hover:bg-red-600 scale-50 rounded-lg',
            innerSizeClasses[size]
          )} />
        </div>
      </button>
    );
  }
);
ShutterButton.displayName = 'ShutterButton';

export { ShutterButton };
