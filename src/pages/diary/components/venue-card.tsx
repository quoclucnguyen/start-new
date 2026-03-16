import { Card, Tag } from 'antd-mobile';
import { MapPin, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VenueStatusBadge } from './venue-status-badge';
import type { Venue } from '@/pages/diary/api/types';

interface VenueCardProps {
  venue: Venue;
  visitCount?: number;
  lastVisit?: string;
  onClick?: () => void;
  className?: string;
}

export const VenueCard: React.FC<VenueCardProps> = ({
  venue,
  visitCount,
  lastVisit,
  onClick,
  className,
}) => {
  return (
    <Card
      onClick={onClick}
      className={cn('!rounded-xl !p-0 overflow-hidden', className)}
    >
      <div className="p-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <MapPin size={20} className="text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold truncate">{venue.name}</span>
            <VenueStatusBadge status={venue.status} />
          </div>

          <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
            {visitCount !== undefined && (
              <span>{visitCount} visit{visitCount !== 1 ? 's' : ''}</span>
            )}
            {lastVisit && <span>Last: {lastVisit}</span>}
          </div>

          {venue.tags.length > 0 && (
            <div className="flex gap-1 mt-1.5 flex-wrap">
              {venue.tags.slice(0, 3).map((tag) => (
                <Tag key={tag} className="!text-[10px]" color="primary" fill="outline">
                  {tag}
                </Tag>
              ))}
              {venue.tags.length > 3 && (
                <Tag className="!text-[10px]" color="default">
                  +{venue.tags.length - 3}
                </Tag>
              )}
            </div>
          )}
        </div>

        {onClick && (
          <ArrowRight size={16} className="text-muted-foreground shrink-0" />
        )}
      </div>
    </Card>
  );
};
