import * as React from 'react';
import { cn } from '@/lib/utils';
import { Camera, ImagePlus } from 'lucide-react';

interface ImagePickerPlaceholderProps {
  imageUrl?: string | null;
  onChange?: (url: string | null) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'size-16',
  md: 'size-24',
  lg: 'size-32',
};

const ImagePickerPlaceholder = React.forwardRef<HTMLDivElement, ImagePickerPlaceholderProps>(
  ({ imageUrl, className, size = 'lg' }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative rounded-xl border-2 border-dashed border-input bg-muted/50 flex items-center justify-center cursor-not-allowed opacity-60',
          sizeClasses[size],
          className
        )}
        title="Image upload coming soon"
      >
        {imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt="Food item"
              className="size-full object-cover rounded-xl"
            />
            <div className="absolute bottom-1 right-1 p-1.5 rounded-full bg-card/90 shadow-sm">
              <Camera className="size-4 text-muted-foreground" />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            <ImagePlus className="size-8" />
            <span className="text-xs">Coming soon</span>
          </div>
        )}
      </div>
    );
  }
);
ImagePickerPlaceholder.displayName = 'ImagePickerPlaceholder';

export { ImagePickerPlaceholder };
