import * as React from "react";
import { EmptyState } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { ChefHat, Plus } from "lucide-react";

interface RecipeManagementEmptyStateProps {
  onCreateRecipe: () => void;
}

const RecipeManagementEmptyState: React.FC<RecipeManagementEmptyStateProps> = ({
  onCreateRecipe,
}) => {
  return (
    <EmptyState
      icon={<ChefHat className="size-12" />}
      title="Chưa có công thức nào"
      description="Tạo công thức đầu tiên để bắt đầu lập kế hoạch bữa ăn và nấu ăn."
      action={
        <Button onClick={onCreateRecipe} className="gap-1.5">
          <Plus className="size-4" />
          Tạo công thức
        </Button>
      }
    />
  );
};

export { RecipeManagementEmptyState };
