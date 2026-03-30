import * as React from 'react';
import { useLocation, useNavigate } from 'react-router';
import { ChefHat, Sparkles } from 'lucide-react';
import { FilterChips } from '@/components/shared';
import { Button } from '@/components/ui/button';

const recipeNavItems = [
  { id: '/recipes', label: 'Gợi ý', icon: <Sparkles className="size-4" /> },
  { id: '/recipes/manage', label: 'Công thức của tôi', icon: <ChefHat className="size-4" /> },
] as const;

interface RecipesSectionNavProps {
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const RecipesSectionNav: React.FC<RecipesSectionNavProps> = ({
  actionLabel,
  onAction,
  className,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const activeId = location.pathname.startsWith('/recipes/manage')
    ? '/recipes/manage'
    : '/recipes';

  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-3">
        <FilterChips
          chips={recipeNavItems.map((item) => ({
            id: item.id,
            label: item.label,
            icon: item.icon,
          }))}
          activeId={activeId}
          onChipClick={(id) => navigate(id)}
          variant="default"
          className="min-w-0 flex-1"
        />
        {actionLabel && onAction ? (
          <Button size="sm" onClick={onAction} className="shrink-0">
            {actionLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
};

export { RecipesSectionNav };
