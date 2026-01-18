import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

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
  featured?: boolean;
  featureLabel?: string;
  onCook?: () => void;
  onAddMissing?: () => void;
  showActions?: boolean;
}

const TimerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const ChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" x2="18" y1="20" y2="10" />
    <line x1="12" x2="12" y1="20" y2="4" />
    <line x1="6" x2="6" y1="20" y2="14" />
  </svg>
);

const SparkleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
  </svg>
);

const CookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z" />
    <path d="M7 21h10" />
    <path d="M19.5 12 22 6" />
    <path d="M16.25 3c.27.1.8.53.75 1.36-.06.83-.93 1.2-1 2.02-.05.78.34 1.24.73 1.62" />
    <path d="M11.25 3c.27.1.8.53.75 1.36-.06.83-.93 1.2-1 2.02-.05.78.34 1.24.73 1.62" />
    <path d="M6.25 3c.27.1.8.53.75 1.36-.06.83-.93 1.2-1 2.02-.05.78.34 1.24.73 1.62" />
  </svg>
);

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
    featured = false,
    featureLabel = 'Use It Up',
    onCook,
    onAddMissing,
    showActions = true,
    ...props 
  }, ref) => {
    const progressVariant = matchPercentage && matchPercentage >= 70 ? 'success' : 
                           matchPercentage && matchPercentage >= 40 ? 'warning' : 'danger';

    return (
      <div ref={ref} className={cn('relative group', className)} {...props}>
        {featured && (
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-green-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-200" />
        )}
        <Card className={cn('relative overflow-hidden', featured && 'border-primary/30')}>
          {/* Image */}
          <div className="relative h-40 w-full">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${imageUrl})` }}
            />
            {featured && (
              <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/80 backdrop-blur-sm px-3 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                <SparkleIcon />
                <span className="text-xs font-bold uppercase tracking-wide">{featureLabel}</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex flex-col p-4 gap-3">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold leading-tight mb-1">{title}</h3>
                <div className="flex items-center gap-3 text-muted-foreground text-sm">
                  <span className="flex items-center gap-1">
                    <TimerIcon /> {cookTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <ChartIcon /> {difficulty}
                  </span>
                </div>
              </div>
              {matchedIngredients !== undefined && totalIngredients !== undefined && (
                <div className="flex flex-col items-end">
                  <span className="text-xs font-semibold text-primary">Great Match</span>
                  <span className="text-sm font-bold">{matchedIngredients}/{totalIngredients} Items</span>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            {matchPercentage !== undefined && (
              <div className="flex items-center gap-2">
                <Progress value={matchPercentage} variant={progressVariant} className="flex-1 h-1.5" />
                {!matchedIngredients && (
                  <span className="text-xs font-medium text-muted-foreground">
                    {matchPercentage}% Match
                  </span>
                )}
              </div>
            )}

            {/* Ingredients Info */}
            {(useIngredients.length > 0 || missingIngredients.length > 0) && (
              <div className="flex flex-col gap-1 text-sm bg-muted/50 p-3 rounded-lg">
                {useIngredients.length > 0 && (
                  <p>
                    <span className="text-primary font-bold">Use:</span>{' '}
                    <span className="text-foreground">{useIngredients.join(', ')}</span>
                  </p>
                )}
                {missingIngredients.length > 0 && (
                  <p className="text-muted-foreground">
                    <span className="font-medium">Missing:</span> {missingIngredients.join(', ')}
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            {showActions && (
              <div className="flex gap-2 mt-1">
                {missingIngredients.length > 0 && onAddMissing && (
                  <Button variant="secondary" className="flex-1" onClick={onAddMissing}>
                    Add Missing
                  </Button>
                )}
                <Button className={cn('flex-1', !onAddMissing && 'w-full')} onClick={onCook}>
                  <CookIcon />
                  {featured ? 'Cook Now' : 'View Recipe'}
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

export { RecipeCard };
