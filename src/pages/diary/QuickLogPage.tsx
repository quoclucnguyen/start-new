import * as React from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Toast } from 'antd-mobile';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { TopAppBar } from '@/components/layout/top-app-bar';
import { IconButton } from '@/components/ui/icon-button';
import { FixedBottomAction } from '@/components/shared';
import { MealTypeSelector } from '@/components/diary/meal-type-selector';
import { CostInput } from '@/components/diary/cost-input';
import { RatingInput } from '@/components/diary/rating-input';
import { VenuePicker } from '@/components/diary/venue-picker';
import { useAddMealLog } from '@/api/diary';
import type { MealType } from '@/api/diary/types';

export const QuickLogPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedType = searchParams.get('type') as MealType | null;
  const preselectedVenue = searchParams.get('venue');

  const [mealType, setMealType] = React.useState<MealType | undefined>(
    preselectedType ?? undefined,
  );
  const [totalCost, setTotalCost] = React.useState(0);
  const [showMore, setShowMore] = React.useState(false);
  const [venueId, setVenueId] = React.useState<string | undefined>(preselectedVenue ?? undefined);
  const [notes, setNotes] = React.useState('');
  const [rating, setRating] = React.useState(0);
  const [tags, setTags] = React.useState('');

  const addMutation = useAddMealLog();

  const canSave = !!mealType;

  const handleSave = () => {
    if (!mealType) return;

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
      },
      {
        onSuccess: () => {
          Toast.show({ icon: 'success', content: 'Meal logged!' });
          navigate(-1);
        },
        onError: () => {
          Toast.show({ icon: 'fail', content: 'Failed to log meal' });
        },
      },
    );
  };

  return (
    <AppShell>
      <TopAppBar
        title="Log a Meal"
        leftAction={
          <IconButton onClick={() => navigate(-1)}>
            <ArrowLeft size={22} />
          </IconButton>
        }
      />

      <main className="flex-1 overflow-y-auto px-4 pt-4 pb-28">
        {/* Step 1: Where? */}
        <div className="mb-6">
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Where?
          </label>
          <VenuePicker
            value={venueId}
            onChange={setVenueId}
          />
        </div>

        {/* Step 2: Meal Type */}
        <div className="mb-6">
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            What type of meal?
          </label>
          <MealTypeSelector value={mealType} onChange={setMealType} />
        </div>

        {/* Step 3: Total Cost (optional) */}
        <div className="mb-6">
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            How much did it cost?
          </label>
          <CostInput value={totalCost} onChange={setTotalCost} />
        </div>

        {/* Progressive Disclosure */}
        <button
          type="button"
          onClick={() => setShowMore(!showMore)}
          className="flex items-center gap-2 text-sm text-primary font-medium mb-4"
        >
          {showMore ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          {showMore ? 'Less details' : 'More details'}
        </button>

        {showMore && (
          <div className="flex flex-col gap-5">
            {/* Rating */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Rating (optional)
              </label>
              <RatingInput value={rating} onChange={setRating} size={28} />
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What did you think?"
                rows={3}
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Tags (optional, comma-separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. spicy, lunch, birthday"
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
        )}
      </main>

      <FixedBottomAction
        primaryLabel="Save Meal"
        primaryOnClick={handleSave}
        primaryDisabled={!canSave || addMutation.isPending}
      />
    </AppShell>
  );
};
