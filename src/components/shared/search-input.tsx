import * as React from 'react';
import { cn } from '@/lib/utils';
import { Input } from 'antd-mobile';
import { Search, Mic } from 'lucide-react';

export interface SearchInputProps {
  value?: string;
  onChange?: (val: string) => void;
  onVoiceClick?: () => void;
  showVoiceButton?: boolean;
  placeholder?: string;
  className?: string;
}

const SearchInput = React.forwardRef<HTMLDivElement, SearchInputProps>(
  ({ className, onVoiceClick, showVoiceButton = true, value, onChange, placeholder }, ref) => {
    return (
      <div ref={ref} className={cn('flex w-full flex-1 items-stretch rounded-xl h-12 shadow-sm bg-card', className)}>
        <div className="flex items-center justify-center pl-4 rounded-l-xl text-primary">
          <Search size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <Input
            className="h-full px-2 text-base"
            style={{ 
              '--font-size': '16px',
              '--placeholder-color': 'var(--muted-foreground)',
              '--color': 'var(--foreground)',
              backgroundColor: 'transparent'
            } as React.CSSProperties}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            clearable
          />
        </div>
        {showVoiceButton && (
          <button 
            type="button"
            onClick={onVoiceClick}
            className="flex items-center justify-center pr-4 rounded-r-xl text-muted-foreground cursor-pointer hover:text-primary transition-colors"
          >
            <Mic size={20} />
          </button>
        )}
      </div>
    );
  }
);
SearchInput.displayName = 'SearchInput';

export { SearchInput };
