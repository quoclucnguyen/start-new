import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ChefHat, CircleCheck, Sparkles, Timer, Zap } from 'lucide-react';

interface RecipeCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  imageUrl: string;
  cookTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  matchPercentage?: number;
  matchedIngredients?: number;
  totalIngredients?: number;
  useIngredients?: string[];
  missingIngredients?: string[];
  expiringIngredients?: string[];
  featured?: boolean;
  featureLabel?: string;
  onCook?: () => void;
  onAddMissing?: () => void;
  showActions?: boolean;
}

const RecipeCard = React.forwardRef<HTMLDivElement, RecipeCardProps>(
  ({ 
    className, 
    title, 
    imageUrl, 
    cookTime, 
    difficulty, 
    matchPercentage,
    matchedIngredients,
    totalIngredients,
    useIngredients = [],
    missingIngredients = [],
    expiringIngredients = [],
    featured = false,
    featureLabel = 'Sử dụng ngay',
    onCook,
    onAddMissing,
    showActions = true,
    ...props 
  }, ref) => {
    const progressVariant = matchPercentage && matchPercentage >= 70 ? 'success' :
      matchPercentage && matchPercentage >= 40 ? 'warning' : 'danger';
    const readyToCook = missingIngredients.length === 0 && useIngredients.length > 0;
    const matchToneClass = readyToCook
      ? 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300'
      : matchPercentage && matchPercentage >= 60
        ? 'bg-primary/12 text-foreground'
        : 'bg-amber-500/14 text-amber-800 dark:text-amber-300';
    const safeImageUrl = imageUrl.trim();

    return (
      <div ref={ref} className={cn('relative group', className)} {...props}>
        {featured && (
          <div className="absolute -inset-0.5 rounded-[28px] bg-[linear-gradient(135deg,rgba(19,236,91,0.18),rgba(249,115,22,0.22),rgba(13,27,18,0.08))] blur opacity-70 transition duration-200 group-hover:opacity-100" />
        )}
        <Card
          className={cn(
            'relative overflow-hidden rounded-[26px] border-white/70 bg-card/95 shadow-[0_18px_48px_-24px_rgba(13,27,18,0.45)] backdrop-blur-sm',
            featured && 'border-primary/30',
          )}
        >
          {/* Image */}
          <div className="relative h-44 w-full overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(19,236,91,0.18),transparent_45%),linear-gradient(135deg,#132219_0%,#1f3b2d_55%,#315742_100%)]">
            {safeImageUrl ? (
              <div
                className="absolute inset-0 bg-cover bg-center opacity-90"
                style={{ backgroundImage: `url(${safeImageUrl})` }}
              />
            ) : null}
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />
            {featured && (
              <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-foreground shadow-sm backdrop-blur-sm dark:bg-black/80">
                <Sparkles className="size-3.5" />
                <span>{featureLabel}</span>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 p-4 text-white">
              <div className="mb-2 flex flex-wrap gap-2">
                {matchPercentage !== undefined ? (
                  <div className="rounded-full bg-white/18 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                    {matchPercentage}% khớp
                  </div>
                ) : null}
                {readyToCook ? (
                  <div className="rounded-full bg-emerald-500/85 px-3 py-1 text-xs font-semibold text-white">
                    Ready now
                  </div>
                ) : null}
                {expiringIngredients.length > 0 ? (
                  <div className="rounded-full bg-orange-500/85 px-3 py-1 text-xs font-semibold text-white">
                    Use soon
                  </div>
                ) : null}
              </div>
              <h3 className="text-xl font-bold leading-tight">{title}</h3>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col gap-4 p-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1 rounded-full bg-muted/70 px-3 py-1">
                  <Timer className="size-3.5" />
                  {cookTime}
                </span>
                <span className="flex items-center gap-1 rounded-full bg-muted/70 px-3 py-1">
                  <Zap className="size-3.5" />
                  {difficulty}
                </span>
              </div>
              {matchedIngredients !== undefined && totalIngredients !== undefined ? (
                <div className={cn('rounded-2xl px-3 py-2 text-right', matchToneClass)}>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em]">
                    Pantry match
                  </div>
                  <div className="text-base font-bold">
                    {matchedIngredients}/{totalIngredients}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Progress Bar */}
            {matchPercentage !== undefined && (
              <div className="rounded-2xl border border-border/70 bg-muted/35 p-3">
                <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  <span>Độ bao phủ nguyên liệu</span>
                  <span>{matchPercentage}%</span>
                </div>
                <Progress value={matchPercentage} variant={progressVariant} className="h-2" />
                <div className="mt-2 flex flex-wrap gap-2">
                  {readyToCook ? (
                    <StatusPill icon={<CircleCheck className="size-3.5" />} tone="success">
                      Everything on hand
                    </StatusPill>
                  ) : null}
                  {missingIngredients.length > 0 ? (
                    <StatusPill icon={<ChefHat className="size-3.5" />} tone="neutral">
                      {missingIngredients.length} thiếu
                    </StatusPill>
                  ) : null}
                  {expiringIngredients.length > 0 ? (
                    <StatusPill icon={<AlertTriangle className="size-3.5" />} tone="warning">
                      {expiringIngredients.length} sắp hết hạn
                    </StatusPill>
                  ) : null}
                </div>
              </div>
            )}

            {/* Ingredients Info */}
            {(useIngredients.length > 0 || missingIngredients.length > 0 || expiringIngredients.length > 0) && (
              <div className="grid gap-2 rounded-2xl bg-muted/45 p-3 text-sm">
                {expiringIngredients.length > 0 && (
                  <IngredientRow
                    label="Sử dụng trước"
                    value={expiringIngredients.join(', ')}
                    tone="warning"
                  />
                )}
                {useIngredients.length > 0 && (
                  <IngredientRow
                    label="Trong bếp của bạn"
                    value={useIngredients.join(', ')}
                    tone="success"
                  />
                )}
                {missingIngredients.length > 0 && (
                  <IngredientRow
                    label="Cần bổ sung"
                    value={missingIngredients.join(', ')}
                    tone="muted"
                  />
                )}
              </div>
            )}

            {/* Actions */}
            {showActions && (
              <div className="flex gap-2">
                {missingIngredients.length > 0 && onAddMissing && (
                  <Button variant="secondary" className="flex-1" onClick={onAddMissing}>
                    Add Missing
                  </Button>
                )}
                <Button className={cn('flex-1', !onAddMissing && 'w-full')} onClick={onCook}>
                  <ChefHat className="size-4" />
                  {featured ? 'Nấu ngay' : 'Xem công thức'}
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  }
);
RecipeCard.displayName = 'RecipeCard';

interface StatusPillProps {
  icon: React.ReactNode;
  tone: 'success' | 'warning' | 'neutral';
  children: React.ReactNode;
}

function StatusPill({ icon, tone, children }: StatusPillProps) {
  const toneClass = {
    success: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300',
    warning: 'bg-orange-500/14 text-orange-700 dark:text-orange-300',
    neutral: 'bg-background text-muted-foreground',
  };

  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold', toneClass[tone])}>
      {icon}
      {children}
    </span>
  );
}

interface IngredientRowProps {
  label: string;
  value: string;
  tone: 'success' | 'warning' | 'muted';
}

function IngredientRow({ label, value, tone }: IngredientRowProps) {
  const toneClass = {
    success: 'text-foreground',
    warning: 'text-orange-700 dark:text-orange-300',
    muted: 'text-muted-foreground',
  };

  return (
    <p className="leading-5">
      <span className="mr-2 font-semibold text-foreground">{label}</span>
      <span className={toneClass[tone]}>{value}</span>
    </p>
  );
}

export { RecipeCard };
