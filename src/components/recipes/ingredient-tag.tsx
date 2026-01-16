import * as React from 'react';
import { cn } from '@/lib/utils';

interface IngredientTagProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: string;
  available?: boolean;
}

const IngredientTag = React.forwardRef<HTMLSpanElement, IngredientTagProps>(
  ({ className, name, available = true, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'px-2 py-1 rounded-md text-xs font-medium',
          available
            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
            : 'bg-muted text-muted-foreground line-through decoration-muted-foreground/50',
          className
        )}
        {...props}
      >
        {name}
      </span>
    );
  }
);
IngredientTag.displayName = 'IngredientTag';

export { IngredientTag };
