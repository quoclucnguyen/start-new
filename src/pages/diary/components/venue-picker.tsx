import * as React from 'react';
import { Input } from 'antd-mobile';
import { Search, Plus, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVenueSearch, useVenue, useAddVenue } from '@/pages/diary/api';
import type { Venue } from '@/pages/diary/api/types';

interface VenuePickerProps {
  value?: string;
  onChange: (venueId: string | undefined) => void;
  className?: string;
}

export const VenuePicker: React.FC<VenuePickerProps> = ({
  value,
  onChange,
  className,
}) => {
  const [query, setQuery] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedVenue, setSelectedVenue] = React.useState<Venue | null>(null);
  const { data: results } = useVenueSearch(query);
  const { data: initialVenue } = useVenue(value && !selectedVenue ? value : null);
  const addVenue = useAddVenue();

  // Sync initial venue from value prop
  React.useEffect(() => {
    if (initialVenue && !selectedVenue) {
      setSelectedVenue(initialVenue);
    }
  }, [initialVenue, selectedVenue]);

  const handleSelect = (venue: Venue) => {
    setSelectedVenue(venue);
    onChange(venue.id);
    setQuery('');
    setIsOpen(false);
  };

  const handleClear = () => {
    setSelectedVenue(null);
    onChange(undefined);
    setQuery('');
  };

  const handleCreateNew = () => {
    if (!query.trim()) return;
    addVenue.mutate(
      { name: query.trim() },
      {
        onSuccess: (venue) => {
          handleSelect(venue);
        },
      },
    );
  };

  if (selectedVenue && !isOpen) {
    return (
      <div className={cn('flex items-center gap-2 p-3 rounded-lg bg-secondary border border-border/50', className)}>
        <MapPin size={16} className="text-muted-foreground" />
        <span className="flex-1 text-sm font-medium">{selectedVenue.name}</span>
        <button
          type="button"
          onClick={handleClear}
          className="text-xs text-muted-foreground underline"
        >
          Thay đổi
        </button>
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      <div className="flex items-center rounded-lg bg-secondary border border-border/50 px-3 gap-2">
        <Search size={16} className="text-muted-foreground" />
        <Input
          value={query}
          onChange={(val) => {
            setQuery(val);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Tìm quán hoặc tạo mới..."
          className="text-sm h-10"
          clearable
        />
      </div>

      {isOpen && query.length >= 1 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
          {results && results.length > 0 ? (
            results.map((venue) => (
              <button
                key={venue.id}
                type="button"
                onClick={() => handleSelect(venue)}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-muted active:bg-muted transition-colors"
              >
                <MapPin size={14} className="text-muted-foreground shrink-0" />
                <span className="truncate">{venue.name}</span>
              </button>
            ))
          ) : null}

          {/* Create new option */}
          {query.trim() && (
            <button
              type="button"
              onClick={handleCreateNew}
              disabled={addVenue.isPending}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm text-primary font-medium border-t border-border hover:bg-muted active:bg-muted transition-colors"
            >
              <Plus size={14} />
              Tạo &ldquo;{query.trim()}&rdquo;
            </button>
          )}
        </div>
      )}
    </div>
  );
};
