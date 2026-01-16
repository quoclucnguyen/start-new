import * as React from 'react';
import { cn } from '@/lib/utils';
import { Input } from 'antd-mobile';
import { Search, Mic } from 'lucide-react';

export interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string;
  onChange?: (val: string) => void;
  onVoiceClick?: () => void;
  showVoiceButton?: boolean;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, onVoiceClick, showVoiceButton = true, value, onChange, ...props }, ref) => {
    // Adapter for ref if needed, but Input ref might be different. 
    // antd-mobile Input ref exposes { focus, blur, clear, nativeElement }
    // We'll cast it for now or just pass it.
    
    return (
      <div className={cn('flex w-full flex-1 items-stretch rounded-xl h-12 shadow-sm bg-card', className)}>
        <div className="flex items-center justify-center pl-4 rounded-l-xl text-primary">
          <Search size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <Input
            ref={ref as any}
            className="h-full px-2 text-base"
            style={{ 
              '--font-size': '16px',
              '--placeholder-color': 'var(--muted-foreground)',
              '--color': 'var(--foreground)',
              backgroundColor: 'transparent'
            }}
            value={value}
            onChange={onChange}
            clearable
            {...props}
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
