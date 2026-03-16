import * as React from 'react';
import { cn } from '@/lib/utils';
import { ScannerFrame } from './scanner-frame';
import { ShutterButton } from './shutter-button';

interface CameraViewfinderProps extends React.HTMLAttributes<HTMLDivElement> {
  status?: 'scanning' | 'detected' | 'idle';
  statusText?: string;
  helpText?: string;
  onCapture?: () => void;
  onClose?: () => void;
  onFlashToggle?: () => void;
  flashEnabled?: boolean;
  aspectRatio?: 'receipt' | 'barcode' | 'square';
  recentThumbnail?: string;
  onRecentClick?: () => void;
  onGalleryClick?: () => void;
}

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const FlashIcon = ({ enabled }: { enabled?: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={enabled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973" />
    <path d="m13 12-3 5h4l-3 5" />
  </svg>
);

const GalleryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
  </svg>
);

const CameraViewfinder = React.forwardRef<HTMLDivElement, CameraViewfinderProps>(
  ({ 
    className, 
    status = 'scanning', 
    statusText,
    helpText = 'Hold steady for automatic scan',
    onCapture,
    onClose,
    onFlashToggle,
    flashEnabled = false,
    aspectRatio = 'receipt',
    recentThumbnail,
    onRecentClick,
    onGalleryClick,
    children,
    ...props 
  }, ref) => {
    const defaultStatusText = {
      scanning: 'Scanning...',
      detected: 'Edges Detected',
      idle: 'Position item in frame',
    };

    return (
      <div
        ref={ref}
        className={cn('relative h-full w-full flex flex-col bg-black', className)}
        {...props}
      >
        {/* Background - children can be camera feed */}
        <div className="absolute inset-0 z-0">
          {children}
          {/* Vignette Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
        </div>

        {/* Top Bar */}
        <div className="relative z-20 flex items-center justify-between p-5 pt-12 bg-gradient-to-b from-black/80 to-transparent">
          <button 
            onClick={onClose}
            className="flex size-10 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md transition hover:bg-white/20"
          >
            <CloseIcon />
          </button>
          <button 
            onClick={onFlashToggle}
            className={cn(
              'flex size-10 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md transition hover:bg-white/20',
              flashEnabled && 'text-primary'
            )}
          >
            <FlashIcon enabled={flashEnabled} />
          </button>
        </div>

        {/* Center - Scanner Frame */}
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6">
          <ScannerFrame status={status} aspectRatio={aspectRatio} />
          
          {/* Status Feedback */}
          <div className="mt-8 flex flex-col items-center space-y-3">
            {status !== 'idle' && (
              <div className="flex items-center gap-2 rounded-full bg-primary/20 border border-primary/30 px-3 py-1.5 backdrop-blur-sm">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {statusText || defaultStatusText[status]}
                </span>
              </div>
            )}
            <div className="text-center">
              <h3 className="text-white text-xl font-bold leading-tight drop-shadow-md">
                Align receipt within frame
              </h3>
              <p className="text-white/80 text-sm font-medium mt-1 drop-shadow-sm">
                {helpText}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="relative z-20 w-full bg-gradient-to-t from-black/95 via-black/70 to-transparent pb-10 pt-16">
          <div className="mx-auto flex max-w-sm items-center justify-between px-8">
            {/* Recent Thumbnail */}
            <button 
              onClick={onRecentClick}
              className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 border-white/20 bg-gray-800 transition hover:border-white/60 hover:scale-105 active:scale-95"
            >
              {recentThumbnail ? (
                <img src={recentThumbnail} alt="Recent scan" className="h-full w-full object-cover opacity-80" />
              ) : (
                <div className="h-full w-full bg-gray-700" />
              )}
            </button>
            
            {/* Shutter Button */}
            <ShutterButton size="large" onClick={onCapture} />
            
            {/* Gallery */}
            <button 
              onClick={onGalleryClick}
              className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20 hover:scale-105 active:scale-95"
            >
              <GalleryIcon />
            </button>
          </div>
        </div>
      </div>
    );
  }
);
CameraViewfinder.displayName = 'CameraViewfinder';

export { CameraViewfinder };
