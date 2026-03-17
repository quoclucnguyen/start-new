import * as React from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router';
import { DatePicker, Toast } from 'antd-mobile';
import { ArrowLeft, CalendarDays, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { TopAppBar } from '@/components/layout/top-app-bar';
import { IconButton } from '@/components/ui/icon-button';
import { FixedBottomAction } from '@/components/shared';
import { MealTypeSelector } from '@/pages/diary/components/meal-type-selector';
import { CostInput } from '@/pages/diary/components/cost-input';
import { RatingInput } from '@/pages/diary/components/rating-input';
import { VenuePicker } from '@/pages/diary/components/venue-picker';
import { DishEntryForm } from '@/pages/diary/components/dish-entry-form';
import { useAddMealLog } from '@/pages/diary/api';
import type { MealType, CreateMealItemEntryInput } from '@/pages/diary/api/types';

export const QuickLogPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const preselectedType = searchParams.get('type') as MealType | null;
  const preselectedVenue = searchParams.get('venue');

  const [mealType, setMealType] = React.useState<MealType | undefined>(
    preselectedType ?? undefined,
  );
  const [totalCost, setTotalCost] = React.useState(0);
  const [showMore, setShowMore] = React.useState(false);
  const [loggedAt, setLoggedAt] = React.useState<Date>(() => new Date());
  const [venueId, setVenueId] = React.useState<string | undefined>(preselectedVenue ?? undefined);
  const [notes, setNotes] = React.useState('');
  const [rating, setRating] = React.useState(0);
  const [tags, setTags] = React.useState('');
  const [dishes, setDishes] = React.useState<CreateMealItemEntryInput[]>([]);

  const addMutation = useAddMealLog();

  const canSave = !!mealType;

  const addDish = () => {
    setDishes((prev) => [
      ...prev,
      { itemName: '', quantity: 1 },
    ]);
  };

  const updateDish = (index: number, updated: CreateMealItemEntryInput) => {
    setDishes((prev) => prev.map((dish, i) => (i === index ? updated : dish)));
  };

  const removeDish = (index: number) => {
    setDishes((prev) => prev.filter((_, i) => i !== index));
  };

  const loggedAtHint = React.useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfTarget = new Date(loggedAt.getFullYear(), loggedAt.getMonth(), loggedAt.getDate());
    const diffDays = Math.floor((startOfToday.getTime() - startOfTarget.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Đang ghi cho hôm nay';
    if (diffDays === 1) return 'Đang ghi cho hôm qua';
    if (diffDays > 1) return `Đang ghi cho ${diffDays} ngày trước`;
    return 'Đang ghi cho ngày sắp tới';
  }, [loggedAt]);

  const loggedAtText = React.useMemo(
    () => new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(loggedAt),
    [loggedAt],
  );

  const handleSave = () => {
    if (!mealType) return;

    const normalizedItems = dishes
      .map((dish) => {
        const itemName = dish.itemName.trim();
        const notesValue = dish.notes?.trim();

        return {
          menuItemId: dish.menuItemId,
          itemName,
          price: dish.price,
          quantity: dish.quantity && dish.quantity > 0 ? dish.quantity : 1,
          rating: dish.rating,
          notes: notesValue || undefined,
        };
      })
      .filter((dish) => dish.itemName.length > 0);

    addMutation.mutate(
      {
        mealType,
        totalCost: totalCost || 0,
        venueId: venueId || undefined,
        notes: notes.trim() || undefined,
        overallRating: rating > 0 ? rating : undefined,
        tags: tags.trim()
          ? tags.split(',').map((t) => t.trim()).filter(Boolean)
          : undefined,
        loggedAt: loggedAt.toISOString(),
        items: normalizedItems.length > 0 ? normalizedItems : undefined,
      },
      {
        onSuccess: (createdLog) => {
          Toast.show({ icon: 'success', content: 'Đã ghi món!' });
          // Navigate back to the previous page or diary dashboard
          const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname || '/diary';
          navigate(from, { state: { refreshMealLog: createdLog.id } });
        },
        onError: () => {
          Toast.show({ icon: 'fail', content: 'Ghi món thất bại' });
        },
      },
    );
  };

  return (
    <AppShell>
      <TopAppBar
        title="Ghi món"
        leftAction={
          <IconButton aria-label="Quay lại" onClick={() => navigate(-1)}>
            <ArrowLeft size={22} />
          </IconButton>
        }
      />

      <main className="flex-1 overflow-y-auto px-4 pt-4 pb-28">
        {/* Log Date */}
        <div className="mb-6">
          <label className="text-sm font-medium text-foreground/80 mb-2 block">
            Ngày ghi log
          </label>
          <DatePicker
            value={loggedAt}
            precision="minute"
            onConfirm={setLoggedAt}
            title="Chọn ngày giờ ghi log"
            cancelText="Hủy"
            confirmText="Xong"
          >
            {() => (
              <button
                type="button"
                className="w-full rounded-xl border border-border bg-secondary px-3 py-2.5 text-left active:bg-muted transition-colors"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CalendarDays size={16} className="text-foreground/70 shrink-0" aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="text-xs text-foreground/70 truncate">{loggedAtHint}</p>
                      <p className="text-sm font-medium text-foreground">{loggedAtText}</p>
                    </div>
                  </div>
                  <span className="text-xs text-primary font-medium shrink-0">Đổi</span>
                </div>
              </button>
            )}
          </DatePicker>
        </div>

        {/* Step 1: Where? */}
        <div className="mb-6">
          <label className="text-sm font-medium text-foreground/80 mb-2 block">
            Ở đâu?
          </label>
          <VenuePicker
            value={venueId}
            onChange={setVenueId}
          />
        </div>

        {/* Step 2: Meal Type */}
        <div className="mb-6">
          <label className="text-sm font-medium text-foreground/80 mb-2 block">
            Loại món gì?
          </label>
          <MealTypeSelector value={mealType} onChange={setMealType} />
        </div>

        {/* Step 3: Total Cost (optional) */}
        <div className="mb-6">
          <label className="text-sm font-medium text-foreground/80 mb-2 block">
            Bao nhiêu tiền?
          </label>
          <CostInput value={totalCost} onChange={setTotalCost} />
        </div>

        {/* Dishes */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground/80">
              Món
            </label>
            <button
              type="button"
              onClick={addDish}
              className="flex items-center gap-1 text-xs text-foreground hover:text-primary transition-colors font-medium"
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

        {/* Progressive Disclosure */}
        <button
          type="button"
          onClick={() => setShowMore(!showMore)}
          className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors font-medium mb-4"
        >
          {showMore ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          {showMore ? 'Ít chi tiết hơn' : 'Thêm chi tiết'}
        </button>

        {showMore && (
          <div className="flex flex-col gap-5">
            {/* Rating */}
            <div>
              <label className="text-sm font-medium text-foreground/80 mb-2 block">
                Đánh giá (tùy chọn)
              </label>
              <RatingInput value={rating} onChange={setRating} size={28} />
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-medium text-foreground/80 mb-2 block">
                Ghi chú (tùy chọn)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Bạn thấy sao?"
                rows={3}
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="text-sm font-medium text-foreground/80 mb-2 block">
                Thẻ (tùy chọn, cách nhau bằng dấu phẩy)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="ví dụ: cay, bữa trưa, sinh nhật"
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
        )}
      </main>

      <FixedBottomAction
        primaryLabel="Lưu món"
        primaryOnClick={handleSave}
        primaryDisabled={!canSave || addMutation.isPending}
      />
    </AppShell>
  );
};
