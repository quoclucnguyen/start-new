import * as React from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onVoiceClick?: () => void;
  showVoiceButton?: boolean;
}

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const MicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" x2="12" y1="19" y2="22" />
  </svg>
);

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, onVoiceClick, showVoiceButton = true, ...props }, ref) => {
    return (
      <div className={cn('flex w-full flex-1 items-stretch rounded-xl h-12 shadow-sm bg-card', className)}>
        <div className="flex items-center justify-center pl-4 rounded-l-xl">
          <SearchIcon />
        </div>
        <input
          ref={ref}
          className="flex w-full min-w-0 flex-1 resize-none overflow-hidden focus:outline-0 focus:ring-0 border-none bg-transparent h-full placeholder:text-muted-foreground px-4 pl-2 text-base font-normal leading-normal transition-colors"
          {...props}
        />
        {showVoiceButton && (
          <button 
            type="button"
            onClick={onVoiceClick}
            className="flex items-center justify-center pr-4 rounded-r-xl text-muted-foreground cursor-pointer hover:text-primary transition-colors"
          >
            <MicIcon />
          </button>
        )}
      </div>
    );
  }
);
SearchInput.displayName = 'SearchInput';

export { SearchInput };
