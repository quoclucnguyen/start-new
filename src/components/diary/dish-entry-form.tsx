import { Input, TextArea } from 'antd-mobile';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RatingInput } from './rating-input';
import { CostInput } from './cost-input';
import type { CreateMealItemEntryInput } from '@/api/diary/types';

interface DishEntryFormProps {
  value: CreateMealItemEntryInput;
  onChange: (value: CreateMealItemEntryInput) => void;
  onRemove?: () => void;
  index: number;
  className?: string;
}

export const DishEntryForm: React.FC<DishEntryFormProps> = ({
  value,
  onChange,
  onRemove,
  index,
  className,
}) => {
  const update = (patch: Partial<CreateMealItemEntryInput>) => {
    onChange({ ...value, ...patch });
  };

  return (
    <div className={cn('p-3 rounded-xl bg-secondary/50 border border-border/30 space-y-3', className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Dish {index + 1}
        </span>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="p-1 rounded text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <Input
        value={value.itemName}
        onChange={(val) => update({ itemName: val })}
        placeholder="Dish name"
        className="text-sm"
      />

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="text-xs text-muted-foreground mb-1 block">Price</label>
          <CostInput
            value={value.price ?? 0}
            onChange={(v) => update({ price: v || undefined })}
          />
        </div>
        <div className="w-20">
          <label className="text-xs text-muted-foreground mb-1 block">Qty</label>
          <Input
            type="number"
            value={value.quantity?.toString() ?? '1'}
            onChange={(val) => update({ quantity: parseInt(val, 10) || 1 })}
            className="text-sm text-center"
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Rating</label>
        <RatingInput
          value={value.rating ?? 0}
          onChange={(r) => update({ rating: r || undefined })}
          size={16}
        />
      </div>

      <TextArea
        value={value.notes ?? ''}
        onChange={(val) => update({ notes: val || undefined })}
        placeholder="Notes about this dish..."
        maxLength={200}
        rows={1}
        autoSize={{ minRows: 1, maxRows: 3 }}
        className="text-xs"
      />
    </div>
  );
};
