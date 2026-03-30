import * as React from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { IngredientEditorList } from './ingredient-editor-list';
import { StepEditorList } from './step-editor-list';
import type { IngredientEditorItem } from './ingredient-editor-list';
import type { StepEditorItem } from './step-editor-list';
import type { RecipeDifficulty, RecipeDetail } from '@/api/types';

interface RecipeEditorFormValues {
  title: string;
  description: string;
  cookTimeMinutes: number;
  prepTimeMinutes: number;
  servings: number;
  difficulty: RecipeDifficulty;
  tags: string;
  ingredients: IngredientEditorItem[];
  steps: StepEditorItem[];
}

interface RecipeEditorFormProps {
  initialValues?: RecipeDetail | null;
  onSubmit: (values: RecipeEditorFormValues) => void;
  onDirtyChange?: (dirty: boolean) => void;
  isSubmitting?: boolean;
  className?: string;
}

const DIFFICULTY_OPTIONS: { value: RecipeDifficulty; label: string }[] = [
  { value: 'easy', label: 'Dễ' },
  { value: 'medium', label: 'Trung bình' },
  { value: 'hard', label: 'Khó' },
];

function getDefaultValues(recipe?: RecipeDetail | null): RecipeEditorFormValues {
  if (!recipe) {
    return {
      title: '',
      description: '',
      cookTimeMinutes: 30,
      prepTimeMinutes: 10,
      servings: 2,
      difficulty: 'easy',
      tags: '',
      ingredients: [{ name: '', quantity: undefined, unit: '', optional: false }],
      steps: [{ instruction: '', estimatedMinutes: undefined }],
    };
  }

  return {
    title: recipe.title,
    description: recipe.description ?? '',
    cookTimeMinutes: recipe.cookTimeMinutes,
    prepTimeMinutes: recipe.prepTimeMinutes ?? 0,
    servings: recipe.servings,
    difficulty: recipe.difficulty,
    tags: recipe.tags.join(', '),
    ingredients: recipe.ingredients.map((ing) => ({
      name: ing.name,
      quantity: ing.quantity,
      unit: ing.unit ?? '',
      optional: ing.optional,
    })),
    steps: recipe.steps.map((step) => ({
      instruction: step.instruction,
      estimatedMinutes: step.estimatedMinutes,
    })),
  };
}

const RecipeEditorForm: React.FC<RecipeEditorFormProps> = ({
  initialValues,
  onSubmit,
  onDirtyChange,
  isSubmitting = false,
  className,
}) => {
  const [values, setValues] = React.useState<RecipeEditorFormValues>(() =>
    getDefaultValues(initialValues),
  );

  // Reset form when initialValues change (e.g., loaded from API)
  const initialId = initialValues?.id;
  React.useEffect(() => {
    setValues(getDefaultValues(initialValues));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialId]);

  const updateField = <K extends keyof RecipeEditorFormValues>(
    key: K,
    val: RecipeEditorFormValues[K],
  ) => {
    setValues((prev) => ({ ...prev, [key]: val }));
    onDirtyChange?.(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter out empty ingredients and steps
    const cleaned: RecipeEditorFormValues = {
      ...values,
      ingredients: values.ingredients.filter((ing) => ing.name.trim()),
      steps: values.steps.filter((step) => step.instruction.trim()),
    };
    onSubmit(cleaned);
  };

  // Validation
  const isValid =
    values.title.trim().length > 0 &&
    values.cookTimeMinutes > 0 &&
    values.servings > 0 &&
    values.ingredients.some((ing) => ing.name.trim()) &&
    values.steps.some((step) => step.instruction.trim());

  return (
    <form onSubmit={handleSubmit} className={cn('flex flex-col gap-5 px-4 pb-8', className)}>
      {/* Title */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-bold">Tên công thức *</label>
        <Input
          placeholder="Tên công thức"
          value={values.title}
          onChange={(e) => updateField('title', e.target.value)}
          className="h-11"
        />
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-bold">Mô tả</label>
        <textarea
          placeholder="Mô tả ngắn (tùy chọn)"
          value={values.description}
          onChange={(e) => updateField('description', e.target.value)}
          className={cn(
            'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm',
            'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30',
            'resize-none min-h-[60px]',
          )}
          rows={2}
        />
      </div>

      {/* Cook time + Prep time */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-bold">Thời gian nấu (phút) *</label>
          <Input
            type="number"
            inputMode="numeric"
            value={values.cookTimeMinutes}
            onChange={(e) => updateField('cookTimeMinutes', Number(e.target.value) || 0)}
            className="h-11"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-bold">Thời gian chuẩn bị (phút)</label>
          <Input
            type="number"
            inputMode="numeric"
            value={values.prepTimeMinutes}
            onChange={(e) => updateField('prepTimeMinutes', Number(e.target.value) || 0)}
            className="h-11"
          />
        </div>
      </div>

      {/* Servings */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-bold">Khẩu phần *</label>
        <Input
          type="number"
          inputMode="numeric"
          value={values.servings}
          onChange={(e) => updateField('servings', Number(e.target.value) || 1)}
          className="h-11 w-28"
        />
      </div>

      {/* Difficulty */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-bold">Độ khó</label>
        <div className="flex gap-2">
          {DIFFICULTY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={cn(
                'flex-1 h-10 rounded-lg text-sm font-medium border transition-colors',
                values.difficulty === opt.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card border-border text-foreground hover:bg-muted',
              )}
              onClick={() => updateField('difficulty', opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-bold">Thẻ</label>
        <Input
          placeholder="vd: Ý, nhanh, chay"
          value={values.tags}
          onChange={(e) => updateField('tags', e.target.value)}
          className="h-11"
        />
        <p className="text-xs text-muted-foreground">Ngăn cách bằng dấu phẩy</p>
      </div>

      {/* Divider */}
      <hr className="border-border" />

      {/* Ingredients */}
      <IngredientEditorList
        value={values.ingredients}
        onChange={(ingredients) => updateField('ingredients', ingredients)}
      />

      {/* Divider */}
      <hr className="border-border" />

      {/* Steps */}
      <StepEditorList
        value={values.steps}
        onChange={(steps) => updateField('steps', steps)}
      />

      {/* Submit */}
      <div className="pt-2 pb-safe">
        <Button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="w-full h-12 text-base font-bold"
        >
          {isSubmitting ? 'Đang lưu...' : initialValues ? 'Lưu thay đổi' : 'Tạo công thức'}
        </Button>
      </div>
    </form>
  );
};

export { RecipeEditorForm };
export type { RecipeEditorFormValues };
