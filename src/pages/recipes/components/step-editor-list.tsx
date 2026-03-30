import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IconButton } from '@/components/ui/icon-button';
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';

export interface StepEditorItem {
  instruction: string;
  estimatedMinutes?: number;
}

interface StepEditorListProps {
  value: StepEditorItem[];
  onChange: (steps: StepEditorItem[]) => void;
  className?: string;
}

const StepEditorList: React.FC<StepEditorListProps> = ({
  value,
  onChange,
  className,
}) => {
  const addStep = () => {
    onChange([...value, { instruction: '', estimatedMinutes: undefined }]);
  };

  const removeStep = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const updateStep = (index: number, updates: Partial<StepEditorItem>) => {
    const newList = value.map((item, i) =>
      i === index ? { ...item, ...updates } : item,
    );
    onChange(newList);
  };

  const moveStep = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= value.length) return;
    const newList = [...value];
    [newList[index], newList[newIndex]] = [newList[newIndex], newList[index]];
    onChange(newList);
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold">Các bước</h4>
        <Button variant="ghost" size="sm" onClick={addStep} className="h-8 gap-1">
          <Plus className="size-3.5" />
          Add
        </Button>
      </div>

      {value.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Chưa có bước nào. Nhấn "Thêm" để bắt đầu.
        </p>
      )}

      {value.map((item, index) => (
        <div
          key={index}
          className="flex gap-2 items-start bg-card rounded-xl p-3 border border-border"
        >
          {/* Step number + reorder */}
          <div className="flex flex-col items-center gap-0.5 pt-1">
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground disabled:opacity-30"
              disabled={index === 0}
              onClick={() => moveStep(index, -1)}
            >
              <ChevronUp className="size-3.5" />
            </button>
            <span className="text-xs font-bold text-muted-foreground w-5 text-center">
              {index + 1}
            </span>
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground disabled:opacity-30"
              disabled={index === value.length - 1}
              onClick={() => moveStep(index, 1)}
            >
              <ChevronDown className="size-3.5" />
            </button>
          </div>

          {/* Fields */}
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            <textarea
              placeholder="Mô tả bước này..."
              value={item.instruction}
              onChange={(e) => updateStep(index, { instruction: e.target.value })}
              className={cn(
                'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm',
                'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30',
                'resize-none min-h-[60px]',
              )}
              rows={2}
            />
            <div className="flex items-center gap-2">
              <Input
                placeholder="Phút"
                type="number"
                inputMode="numeric"
                value={item.estimatedMinutes ?? ''}
                onChange={(e) =>
                  updateStep(index, {
                    estimatedMinutes: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="h-8 w-24"
              />
              <span className="text-xs text-muted-foreground">phút</span>
            </div>
          </div>

          {/* Delete */}
          <IconButton
            variant="ghost"
            size="sm"
            onClick={() => removeStep(index)}
            className="text-destructive"
          >
            <Trash2 className="size-3.5" />
          </IconButton>
        </div>
      ))}
    </div>
  );
};

export { StepEditorList };
