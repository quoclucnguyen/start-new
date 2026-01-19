import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card, Tag, ProgressBar, Button } from 'antd-mobile';
import { MoreVertical } from 'lucide-react';

export type ExpiryStatus = 'expiring' | 'soon' | 'good' | 'fresh';

export interface FoodItemCardProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  icon?: React.ReactNode;
  imageUrl?: string | null;
  expiryText: string;
  expiryStatus: ExpiryStatus;
  percentLeft?: number;
  showBadge?: boolean;
  onMoreClick?: (e: React.MouseEvent) => void;
}

const statusConfig: Record<ExpiryStatus, { 
  borderColor: string; 
  iconBg: string; 
  iconColor: string; 
  textColor: string;
  tagColor: 'danger' | 'warning' | 'success' | 'primary';
  tagText: string;
  progressColor: string;
}> = {
  expiring: {
    borderColor: 'border-l-red-500 border-red-200/60 dark:border-red-900/40',
    iconBg: 'bg-red-50 dark:bg-red-900/20',
    iconColor: 'text-red-500 dark:text-red-400',
    textColor: 'text-red-500',
    tagColor: 'danger',
    tagText: 'Expiring',
    progressColor: '#ef4444',
  },
  soon: {
    borderColor: 'border-l-orange-400',
    iconBg: 'bg-orange-50 dark:bg-orange-900/20',
    iconColor: 'text-orange-500 dark:text-orange-400',
    textColor: 'text-orange-500',
    tagColor: 'warning',
    tagText: 'Soon',
    progressColor: '#f97316',
  },
  good: {
    borderColor: 'border-l-yellow-400',
    iconBg: 'bg-yellow-50 dark:bg-yellow-900/20',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
    textColor: 'text-yellow-600 dark:text-yellow-400',
    tagColor: 'warning',
    tagText: 'Good',
    progressColor: '#eab308',
  },
  fresh: {
    borderColor: 'border-l-green-500',
    iconBg: 'bg-green-50 dark:bg-green-900/20',
    iconColor: 'text-green-600 dark:text-green-400',
    textColor: 'text-green-600 dark:text-green-400',
    tagColor: 'success',
    tagText: 'Fresh',
    progressColor: '#22c55e',
  },
};

const FoodItemCard = React.forwardRef<HTMLDivElement, FoodItemCardProps>(
  ({ className, name, icon, imageUrl, expiryText, expiryStatus, percentLeft, showBadge = false, onMoreClick, ...props }, ref) => {
    const config = statusConfig[expiryStatus];
    
    return (
      <div ref={ref} className={className} {...props}>
        <Card
          className={cn(
            'border-l-4 relative overflow-hidden',
            config.borderColor,
            expiryStatus === 'expiring' && 'border border-red-200/60 dark:border-red-900/40'
          )}
          style={{ borderRadius: '0.75rem' }}
        >
          {expiryStatus === 'expiring' && (
            <div className="absolute inset-0 bg-red-50/30 dark:bg-red-900/10 pointer-events-none" />
          )}
          
          <div className="flex items-center gap-4 z-10 relative">
            <div className={cn(
              'flex items-center justify-center rounded-lg shrink-0 size-12 overflow-hidden',
              !imageUrl && config.iconBg
            )}>
              {imageUrl ? (
                <img 
                  src={imageUrl} 
                  alt={name}
                  className="size-full object-cover"
                />
              ) : icon ? (
                icon
              ) : (
                <span className={cn('text-2xl', config.iconColor)}>🍎</span>
              )}
            </div>
            
            <div className="flex flex-col justify-center flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-base font-bold leading-normal line-clamp-1">{name}</p>
                {showBadge && (
                  <Tag 
                    color={config.tagColor} 
                    fill='solid'
                    style={{ borderRadius: '4px', fontSize: '10px', padding: '1px 4px' }}
                  >
                    {config.tagText}
                  </Tag>
                )}
              </div>
              <p className={cn('text-xs font-semibold leading-normal', config.textColor)}>
                {expiryText}
              </p>
            </div>
            
            {percentLeft !== undefined && (
              <div className="shrink-0 flex flex-col items-end gap-1 z-10">
                <span className="text-xs font-medium text-muted-foreground">
                  {percentLeft}% left
                </span>
                <ProgressBar 
                  percent={percentLeft} 
                  style={{ 
                    width: '5rem', 
                    height: '0.5rem', 
                    borderRadius: '999px',
                    '--track-color': '#e5e7eb',
                    '--fill-color': config.progressColor
                  } as React.CSSProperties}
                />
              </div>
            )}
            
            <Button 
              fill='none'
              size='mini'
              className="shrink-0 ml-1 z-10 flex items-center justify-center text-gray-500"
              onClick={onMoreClick}
              aria-label="More options"
              style={{ padding: 4, border: 'none' }}
            >
              <MoreVertical size={20} />
            </Button>
          </div>
        </Card>
      </div>
    );
  }
);

FoodItemCard.displayName = 'FoodItemCard';

export { FoodItemCard };
