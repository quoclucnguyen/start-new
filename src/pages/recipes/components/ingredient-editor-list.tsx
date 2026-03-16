import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IconButton } from '@/components/ui/icon-button';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';

export interface IngredientEditorItem {
  name: string;
  quantity?: number;
  unit?: string;
  optional?: boolean;
}

interface IngredientEditorListProps {
  value: IngredientEditorItem[];
  onChange: (ingredients: IngredientEditorItem[]) => void;
  className?: string;
}

const IngredientEditorList: React.FC<IngredientEditorListProps> = ({
  value,
  onChange,
  className,
}) => {
  const addIngredient = () => {
    onChange([...value, { name: '', quantity: undefined, unit: '', optional: false }]);
  };

  const removeIngredient = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, updates: Partial<IngredientEditorItem>) => {
    const newList = value.map((item, i) =>
      i === index ? { ...item, ...updates } : item,
    );
    onChange(newList);
  };

  const moveIngredient = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= value.length) return;
    const newList = [...value];
    [newList[index], newList[newIndex]] = [newList[newIndex], newList[index]];
    onChange(newList);
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold">Ingredients</h4>
        <Button variant="ghost" size="sm" onClick={addIngredient} className="h-8 gap-1">
          <Plus className="size-3.5" />
          Add
        </Button>
      </div>

      {value.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No ingredients yet. Tap "Add" to start.
        </p>
      )}

      {value.map((item, index) => (
        <div
          key={index}
          className="flex gap-2 items-start bg-card rounded-xl p-3 border border-border"
        >
          {/* Reorder */}
          <div className="flex flex-col gap-0.5 pt-1">
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground disabled:opacity-30"
              disabled={index === 0}
              onClick={() => moveIngredient(index, -1)}
            >
              <ChevronUp className="size-3.5" />
            </button>
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground disabled:opacity-30"
              disabled={index === value.length - 1}
              onClick={() => moveIngredient(index, 1)}
            >
              <ChevronDown className="size-3.5" />
            </button>
          </div>

          {/* Fields */}
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            <Input
              placeholder="Ingredient name"
              value={item.name}
              onChange={(e) => updateIngredient(index, { name: e.target.value })}
              className="h-9"
            />
            <div className="flex gap-2">
              <Input
                placeholder="Qty"
                type="number"
                inputMode="decimal"
                value={item.quantity ?? ''}
                onChange={(e) =>
                  updateIngredient(index, {
                    quantity: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="h-9 w-20"
              />
              <Input
                placeholder="Unit"
                value={item.unit ?? ''}
                onChange={(e) => updateIngredient(index, { unit: e.target.value })}
                className="h-9 flex-1"
              />
            </div>
            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
              <Checkbox
                checked={item.optional ?? false}
                onChange={(event) =>
                  updateIngredient(index, { optional: event.target.checked })
                }
              />
              Optional
            </label>
          </div>

          {/* Delete */}
          <IconButton
            variant="ghost"
            size="sm"
            onClick={() => removeIngredient(index)}
            className="text-destructive"
          >
            <Trash2 className="size-3.5" />
          </IconButton>
        </div>
      ))}
    </div>
  );
};

export { IngredientEditorList };
