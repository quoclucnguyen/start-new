import * as React from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, Leaf, SlidersHorizontal, Soup } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared';

interface RecipeEmptyStateProps {
  hasInventory: boolean;
  hasFilters: boolean;
  inventoryCount?: number;
  onResetFilters?: () => void;
  action?: React.ReactNode;
  className?: string;
}

const RecipeEmptyState: React.FC<RecipeEmptyStateProps> = ({
  hasInventory,
  hasFilters,
  inventoryCount = 0,
  onResetFilters,
  action,
  className,
}) => {
  if (!hasInventory) {
    return (
      <EmptyState
        className={cn(
          'rounded-[28px] border border-dashed border-border bg-card/70 py-14',
          className,
        )}
        icon={
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-500/12 text-emerald-600 dark:text-primary">
            <Leaf className="size-8" />
          </div>
        }
        title="Chưa có nguyên liệu nào"
        description="Thêm một vài nguyên liệu từ bếp của bạn và không gian này sẽ bắt đầu đề xuất các bữa ăn sử dụng những gì bạn đã có."
        action={action}
      />
    );
  }

  if (hasFilters) {
    return (
      <EmptyState
        className={cn(
          'rounded-[28px] border border-border bg-card/80 py-14',
          className,
        )}
        icon={
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <SlidersHorizontal className="size-8" />
          </div>
        }
        title="Không có bữa ăn nào khớp bộ lọc"
        description="Mở rộng thời gian nấu hoặc bỏ một thẻ để hiển thị thêm gợi ý bữa ăn."
        action={
          onResetFilters ? (
            <Button variant="secondary" onClick={onResetFilters}>
              Reset Filters
            </Button>
          ) : action ?? null
        }
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-[28px] border border-orange-200/70 bg-[linear-gradient(180deg,rgba(249,115,22,0.08),rgba(255,255,255,0.9))] px-5 py-6 text-left shadow-sm dark:border-orange-500/20 dark:bg-[linear-gradient(180deg,rgba(249,115,22,0.12),rgba(28,46,36,0.96))]',
        className,
      )}
    >
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-orange-500/12 text-orange-700 dark:text-orange-300">
        <Soup className="size-7" />
      </div>
      <h3 className="text-lg font-bold">Tủ bếp vẫn còn ít nguyên liệu</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Chúng tôi chỉ tìm thấy {inventoryCount} nguyên liệu trong tủ bếp của bạn,
        vì vậy khả năng khớp bữa ăn hiện tại còn hạn chế. Hãy thêm một vài nguyên liệu cơ bản hoặc rau tươi để nhận gợi ý tốt hơn.
      </p>
      <div className="mt-4 flex items-start gap-2 rounded-2xl bg-background/70 p-3 text-sm text-muted-foreground dark:bg-black/10">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-orange-600 dark:text-orange-300" />
        <span>Thử thêm trứng, cơm, hành, cà chua hoặc mì để tăng độ khớp.</span>
      </div>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
};

export { RecipeEmptyState };
