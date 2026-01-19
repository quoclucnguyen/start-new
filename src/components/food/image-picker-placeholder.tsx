import * as React from 'react';
import { cn } from '@/lib/utils';
import { uploadFoodImage } from '@/lib/image-upload';
import { useAuthStore } from '@/store';
import { Camera, ImagePlus, Loader2, X } from 'lucide-react';
import { Toast } from 'antd-mobile';

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
  ({ imageUrl, onChange, className, size = 'lg' }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = React.useState(false);
    const user = useAuthStore((state) => state.user);

    const handleClick = () => {
      if (!isUploading && inputRef.current) {
        inputRef.current.click();
      }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !user?.id) {
        if (!user?.id) {
          Toast.show({ content: 'Please login to upload images', icon: 'fail' });
        }
        return;
      }

      // Validate file size (max 10MB before compression)
      if (file.size > 10 * 1024 * 1024) {
        Toast.show({ content: 'Image too large (max 10MB)', icon: 'fail' });
        return;
      }

      setIsUploading(true);
      try {
        const result = await uploadFoodImage(file, user.id);
        onChange?.(result.url);
        Toast.show({ content: 'Image uploaded', icon: 'success' });
      } catch (error) {
        console.error('Upload failed:', error);
        Toast.show({ 
          content: error instanceof Error ? error.message : 'Upload failed', 
          icon: 'fail' 
        });
      } finally {
        setIsUploading(false);
        // Reset input so same file can be selected again
        if (inputRef.current) {
          inputRef.current.value = '';
        }
      }
    };

    const handleRemove = (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange?.(null);
    };

    return (
      <div
        ref={ref}
        onClick={handleClick}
        className={cn(
          'relative rounded-xl border-2 border-dashed border-input bg-muted/50 flex items-center justify-center cursor-pointer transition-colors hover:border-primary/50 hover:bg-muted',
          isUploading && 'cursor-wait opacity-70',
          sizeClasses[size],
          className
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            <Loader2 className="size-8 animate-spin" />
            <span className="text-xs">Uploading...</span>
          </div>
        ) : imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt="Food item"
              className="size-full object-cover rounded-xl"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-2 -right-2 p-1 rounded-full bg-destructive text-white shadow-md hover:bg-destructive/90"
            >
              <X className="size-4" />
            </button>
            <div className="absolute bottom-1 right-1 p-1.5 rounded-full bg-card/90 shadow-sm">
              <Camera className="size-4 text-muted-foreground" />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            <ImagePlus className="size-8" />
            <span className="text-xs">Add photo</span>
          </div>
        )}
      </div>
    );
  }
);
ImagePickerPlaceholder.displayName = 'ImagePickerPlaceholder';

export { ImagePickerPlaceholder };
