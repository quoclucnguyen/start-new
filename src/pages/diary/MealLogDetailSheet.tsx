import * as React from 'react';
import { Toast, DotLoading, Dialog } from 'antd-mobile';
import { Plus, Trash2 } from 'lucide-react';
import { BottomSheet } from '@/components/shared';
import { FixedBottomAction } from '@/components/shared';
import { MealTypeSelector } from '@/pages/diary/components/meal-type-selector';
import { CostInput } from '@/pages/diary/components/cost-input';
import { RatingInput } from '@/pages/diary/components/rating-input';
import { VenuePicker } from '@/pages/diary/components/venue-picker';
import { DishEntryForm } from '@/pages/diary/components/dish-entry-form';
import {
  useMealLog,
  useUpdateMealLog,
  useDeleteMealLog,
} from '@/pages/diary/api';
import type { MealType, CreateMealItemEntryInput } from '@/pages/diary/api/types';

interface MealLogDetailSheetProps {
  mealLogId: string | null;
  visible: boolean;
  onClose: () => void;
}

export const MealLogDetailSheet: React.FC<MealLogDetailSheetProps> = ({
  mealLogId,
  visible,
  onClose,
}) => {
  const { data: log, isLoading } = useMealLog(mealLogId);
  const updateMutation = useUpdateMealLog();
  const deleteMutation = useDeleteMealLog();

  const [mealType, setMealType] = React.useState<MealType | undefined>();
  const [totalCost, setTotalCost] = React.useState(0);
  const [venueId, setVenueId] = React.useState<string | undefined>();
  const [notes, setNotes] = React.useState('');
  const [rating, setRating] = React.useState(0);
  const [tags, setTags] = React.useState('');
  const [dishes, setDishes] = React.useState<CreateMealItemEntryInput[]>([]);

  // Populate form when log loads
  React.useEffect(() => {
    if (log) {
      setMealType(log.mealType);
      setTotalCost(log.totalCost);
      setVenueId(log.venueId);
      setNotes(log.notes ?? '');
      setRating(log.overallRating ?? 0);
      setTags(log.tags?.join(', ') ?? '');
      setDishes(
        log.items?.map((item) => ({
          menuItemId: item.menuItemId,
          itemName: item.itemName,
          price: item.price,
          quantity: item.quantity,
          rating: item.rating,
          notes: item.notes,
        })) ?? [],
      );
    }
  }, [log]);

  const handleSave = () => {
    if (!mealLogId || !mealType) return;

    updateMutation.mutate(
      {
        id: mealLogId,
        mealType,
        totalCost,
        venueId,
        notes: notes.trim() || undefined,
        overallRating: rating > 0 ? rating : undefined,
        tags: tags.trim()
          ? tags.split(',').map((t) => t.trim()).filter(Boolean)
          : undefined,
      },
      {
        onSuccess: () => {
          Toast.show({ icon: 'success', content: 'Đã cập nhật!' });
          onClose();
        },
        onError: () => {
          Toast.show({ icon: 'fail', content: 'Cập nhật thất bại' });
        },
      },
    );
  };

  const handleDelete = async () => {
    if (!mealLogId) return;
    const confirmed = await Dialog.confirm({
      content: 'Xóa bản ghi này?',
    });
    if (confirmed) {
      deleteMutation.mutate(mealLogId, {
        onSuccess: () => {
          Toast.show({ icon: 'success', content: 'Đã xóa' });
          onClose();
        },
      });
    }
  };

  const addDish = () => {
    setDishes((prev) => [
      ...prev,
      { itemName: '', quantity: 1 },
    ]);
  };

  const updateDish = (index: number, updated: CreateMealItemEntryInput) => {
    setDishes((prev) => prev.map((d, i) => (i === index ? updated : d)));
  };

  const removeDish = (index: number) => {
    setDishes((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Chi tiết món">
      {isLoading ? (
        <div className="flex justify-center py-12">
          <DotLoading color="primary" />
        </div>
      ) : !log ? (
        <div className="py-12 text-center text-muted-foreground">
          Không tìm thấy bản ghi
        </div>
      ) : (
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto px-4 pb-28 space-y-5">
            {/* Meal Type */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Loại món
              </label>
              <MealTypeSelector value={mealType} onChange={setMealType} />
            </div>

            {/* Cost */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Tổng tiền
              </label>
              <CostInput value={totalCost} onChange={setTotalCost} />
            </div>

            {/* Venue */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Quán
              </label>
              <VenuePicker value={venueId} onChange={setVenueId} />
            </div>

            {/* Rating */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Đánh giá
              </label>
              <RatingInput value={rating} onChange={setRating} size={28} />
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Ghi chú
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Bạn thấy sao?"
                rows={2}
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Thẻ (cách nhau bằng dấu phẩy)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="ví dụ: cay, bữa trưa"
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {/* Dishes */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Món
                </label>
                <button
                  type="button"
                  onClick={addDish}
                  className="flex items-center gap-1 text-xs text-primary font-medium"
                >
                  <Plus size={14} /> Thêm món
                </button>
              </div>
              <div className="flex flex-col gap-3">
                {dishes.map((dish, i) => (
                  <DishEntryForm
                    key={i}
                    value={dish}
                    onChange={(v) => updateDish(i, v)}
                    onRemove={() => removeDish(i)}
                    index={i}
                  />
                ))}
              </div>
            </div>

            {/* Delete */}
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-2 text-sm text-destructive font-medium py-3"
            >
              <Trash2 size={16} /> Xóa món này
            </button>
          </div>

          <FixedBottomAction
            primaryLabel="Lưu thay đổi"
            primaryOnClick={handleSave}
            primaryDisabled={!mealType || totalCost <= 0 || updateMutation.isPending}
          />
        </div>
      )}
    </BottomSheet>
  );
};
