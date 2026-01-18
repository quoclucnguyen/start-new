import * as React from 'react';
import { cn } from '@/lib/utils';
import { Popup } from 'antd-mobile';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
  height?: string;
  showCloseButton?: boolean;
}

const BottomSheet = React.forwardRef<HTMLDivElement, BottomSheetProps>(
  ({ visible, onClose, children, title, className, height = '92vh', showCloseButton = true }, ref) => {
    return (
      <Popup
        visible={visible}
        onMaskClick={onClose}
        onClose={onClose}
        position="bottom"
        bodyStyle={{
          height,
          borderTopLeftRadius: '1.5rem',
          borderTopRightRadius: '1.5rem',
          overflow: 'hidden',
        }}
        showCloseButton={showCloseButton}
      >
        <div ref={ref} className={cn('flex flex-col h-full bg-background', className)}>
          {/* Drag Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 rounded-full bg-muted-foreground/30" />
          </div>

          {/* Header */}
          {title && (
            <div className="px-4 pb-4">
              <h2 className="text-xl font-bold text-center">{title}</h2>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </div>
      </Popup>
    );
  }
);
BottomSheet.displayName = 'BottomSheet';

export { BottomSheet };
