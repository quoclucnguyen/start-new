import * as React from 'react';
import { cn } from '@/lib/utils';

interface ScannerFrameProps extends React.HTMLAttributes<HTMLDivElement> {
  showScanLine?: boolean;
  status?: 'scanning' | 'detected' | 'idle';
  aspectRatio?: 'receipt' | 'barcode' | 'square';
}

const ScannerFrame = React.forwardRef<HTMLDivElement, ScannerFrameProps>(
  ({ className, showScanLine = true, status = 'scanning', aspectRatio = 'receipt', children, ...props }, ref) => {
    const aspectClasses = {
      receipt: 'aspect-[2/3]',
      barcode: 'aspect-[3/1]',
      square: 'aspect-square',
    };

    const statusClasses = {
      scanning: 'border-primary/80 shadow-[0_0_40px_-5px_rgba(19,236,91,0.4)]',
      detected: 'border-primary shadow-[0_0_60px_-5px_rgba(19,236,91,0.6)]',
      idle: 'border-white/30',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative w-full max-w-[340px] rounded-2xl border-[3px] overflow-hidden',
          aspectClasses[aspectRatio],
          statusClasses[status],
          className
        )}
        {...props}
      >
        {/* Corner Indicators */}
        <div className="absolute top-0 left-0 h-8 w-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
        <div className="absolute top-0 right-0 h-8 w-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
        <div className="absolute bottom-0 left-0 h-8 w-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
        <div className="absolute bottom-0 right-0 h-8 w-8 border-b-4 border-r-4 border-primary rounded-br-lg" />
        
        {/* Animated Scan Line */}
        {showScanLine && status === 'scanning' && (
          <div 
            className="absolute left-0 right-0 h-0.5 bg-primary shadow-[0_0_15px_2px_#13ec5b] animate-[scan_3s_ease-in-out_infinite]"
            style={{
              animation: 'scan 3s ease-in-out infinite',
            }}
          />
        )}
        
        {/* Grid Overlay */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '33.3% 33.3%',
          }}
        />
        
        {children}
      </div>
    );
  }
);
ScannerFrame.displayName = 'ScannerFrame';

// Add keyframes to global styles
const scanKeyframes = `
@keyframes scan {
  0% { top: 5%; opacity: 0; }
  15% { opacity: 1; }
  85% { opacity: 1; }
  100% { top: 95%; opacity: 0; }
}
`;

// Inject keyframes
if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.textContent = scanKeyframes;
  document.head.appendChild(styleEl);
}

export { ScannerFrame };
