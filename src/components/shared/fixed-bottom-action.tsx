import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface FixedBottomActionProps {
  children?: React.ReactNode;
  className?: string;
  primaryLabel?: string;
  primaryOnClick?: () => void;
  primaryLoading?: boolean;
  primaryDisabled?: boolean;
  secondaryLabel?: string;
  secondaryOnClick?: () => void;
  secondaryVariant?: 'outline' | 'ghost' | 'destructive';
}

const FixedBottomAction = React.forwardRef<HTMLDivElement, FixedBottomActionProps>(
  ({ 
    children, 
    className, 
    primaryLabel, 
    primaryOnClick, 
    primaryLoading,
    primaryDisabled,
    secondaryLabel,
    secondaryOnClick,
    secondaryVariant = 'outline',
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/80 backdrop-blur-xl border-t border-border safe-area-inset-bottom',
          className
        )}
      >
        {children || (
          <div className="flex gap-3">
            {secondaryLabel && (
              <Button
                variant={secondaryVariant}
                size="lg"
                className="flex-1 h-14 rounded-xl text-base"
                onClick={secondaryOnClick}
              >
                {secondaryLabel}
              </Button>
            )}
            {primaryLabel && (
              <Button
                variant="default"
                size="lg"
                className="flex-1 h-14 rounded-xl text-base font-semibold"
                onClick={primaryOnClick}
                disabled={primaryLoading || primaryDisabled}
              >
                {primaryLoading ? 'Saving...' : primaryLabel}
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }
);
FixedBottomAction.displayName = 'FixedBottomAction';

export { FixedBottomAction };
