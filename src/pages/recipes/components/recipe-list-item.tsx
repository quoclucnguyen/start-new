import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconButton } from "@/components/ui/icon-button";
import { Clock, ChefHat, MoreVertical } from "lucide-react";
import { ActionSheet } from "antd-mobile";
import type { Recipe, RecipeDifficulty } from "@/api/types";

type ActionSheetShowHandler = ReturnType<typeof ActionSheet.show>;
type ActionSheetActions = Parameters<typeof ActionSheet.show>[0]["actions"];

interface RecipeListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  recipe: Recipe;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const difficultyColors: Record<RecipeDifficulty, string> = {
  easy: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  medium:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  hard: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

const difficultyLabels: Record<RecipeDifficulty, string> = {
  easy: "Dễ",
  medium: "TB",
  hard: "Khó",
};

const RecipeListItem = React.forwardRef<HTMLDivElement, RecipeListItemProps>(
  ({ className, recipe, onView, onEdit, onDelete, ...props }, ref) => {
    const isSystemRecipe = recipe.source === "system";
    const actionSheetHandlerRef = React.useRef<ActionSheetShowHandler | null>(
      null,
    );

    React.useEffect(() => {
      return () => {
        actionSheetHandlerRef.current?.close();
        actionSheetHandlerRef.current = null;
      };
    }, []);

    const handleActions = () => {
      actionSheetHandlerRef.current?.close();

      const actions: ActionSheetActions = [];

      if (onView) {
        actions.push({
          text: "Xem chi tiết",
          key: "view",
          onClick: () => onView(recipe.id),
        });
      }

      if (onEdit) {
        actions.push({
          text: "Sửa",
          key: "edit",
          onClick: () => onEdit(recipe.id),
        });
      }

      if (onDelete) {
        actions.push({
          text: "Xóa",
          key: "delete",
          danger: true,
          onClick: () => onDelete(recipe.id),
        });
      }

      actionSheetHandlerRef.current = ActionSheet.show({
        actions,
        onClose: () => {
          actionSheetHandlerRef.current = null;
        },
      });
    };

    const totalTime = recipe.cookTimeMinutes + (recipe.prepTimeMinutes ?? 0);

    return (
      <Card
        ref={ref}
        className={cn("p-4 flex gap-3 items-start", className)}
        {...props}
      >
        {/* Image thumbnail */}
        {recipe.imageUrl ? (
          <div
            className="w-16 h-16 rounded-xl bg-cover bg-center shrink-0"
            style={{ backgroundImage: `url(${recipe.imageUrl})` }}
          />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center shrink-0">
            <ChefHat className="size-6 text-muted-foreground" />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-base leading-tight truncate">
              {recipe.title}
            </h3>
            <IconButton
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleActions();
              }}
            >
              <MoreVertical className="size-4" />
            </IconButton>
          </div>

          {recipe.description && (
            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
              {recipe.description}
            </p>
          )}

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3" />
              {totalTime} phút
            </span>
            <span
              className={cn(
                "px-1.5 py-0.5 rounded text-xs font-medium",
                difficultyColors[recipe.difficulty],
              )}
            >
              {difficultyLabels[recipe.difficulty]}
            </span>
            {recipe.servings > 0 && (
              <span className="text-xs text-muted-foreground">
                {recipe.servings} phần
              </span>
            )}
            {isSystemRecipe && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                System
              </Badge>
            )}
          </div>

          {recipe.tags.length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {recipe.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0"
                >
                  {tag}
                </Badge>
              ))}
              {recipe.tags.length > 3 && (
                <span className="text-[10px] text-muted-foreground">
                  +{recipe.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </Card>
    );
  },
);
RecipeListItem.displayName = "RecipeListItem";

export { RecipeListItem };
