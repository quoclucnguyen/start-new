import * as React from 'react';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { SpinLoading, Toast } from 'antd-mobile';
import { useRecipesList } from '@/api/use-recipes-management';
import {
  useDeleteRecipe,
  useDuplicateRecipe,
} from '@/api/use-recipes-management-mutations';
import { useRecipesManagementStore } from '@/store/recipes-management.store';
import { SearchInput } from '@/components/shared';
import { confirmDelete } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { RecipeListItem } from './recipe-list-item';
import { RecipeEditorSheet } from './recipe-editor-sheet';
import { RecipeManagementEmptyState } from './recipe-management-empty-state';

interface RecipeManagementPageProps {
  className?: string;
}

const RecipeManagementPage: React.FC<RecipeManagementPageProps> = ({ className }) => {
  const {
    search,
    selectedTags,
    setSearch,
    openCreateEditor,
    openEditEditor,
  } = useRecipesManagementStore();

  const { data: recipes = [], isLoading, error } = useRecipesList({
    search: search || undefined,
    tags: selectedTags.length > 0 ? selectedTags : undefined,
  });

  const deleteMutation = useDeleteRecipe();
  const duplicateMutation = useDuplicateRecipe();

  const handleDelete = async (id: string) => {
    const recipe = recipes.find((r) => r.id === id);
    const confirmed = await confirmDelete(recipe?.title ?? 'công thức này');
    if (confirmed) {
      deleteMutation.mutate(id, {
        onSuccess: () => Toast.show({ content: 'Đã xóa công thức', icon: 'success' }),
        onError: () => Toast.show({ content: 'Xóa công thức thất bại', icon: 'fail' }),
      });
    }
  };

  const handleDuplicate = (id: string) => {
    duplicateMutation.mutate(id, {
      onSuccess: () => Toast.show({ content: 'Đã nhân đôi công thức', icon: 'success' }),
      onError: () => Toast.show({ content: 'Nhân đôi thất bại', icon: 'fail' }),
    });
  };

  // Separate user and system recipes
  const userRecipes = recipes.filter((r) => r.source === 'user');
  const systemRecipes = recipes.filter((r) => r.source === 'system');

  return (
    <div className={cn('flex flex-col h-full bg-background', className)}>
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Công thức của tôi</h1>
          <Button size="sm" onClick={openCreateEditor} className="gap-1">
            <Plus className="size-4" />
            Mới
          </Button>
        </div>

        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Tìm kiếm công thức..."
          showVoiceButton={false}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-safe">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <SpinLoading style={{ '--size': '36px' }} />
          </div>
        ) : error ? (
          <div className="text-center py-16 text-destructive">
            <p className="text-sm">Tải công thức thất bại</p>
            <p className="text-xs text-muted-foreground mt-1">{error.message}</p>
          </div>
        ) : recipes.length === 0 && !search ? (
          <RecipeManagementEmptyState onCreateRecipe={openCreateEditor} />
        ) : recipes.length === 0 && search ? (
          <div className="text-center py-16">
            <p className="text-sm text-muted-foreground">
              Không tìm thấy công thức nào khớp với "{search}"
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 pb-4">
            {/* User recipes */}
            {userRecipes.length > 0 && (
              <>
                {systemRecipes.length > 0 && (
                  <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mt-2">
                    Công thức của bạn ({userRecipes.length})
                  </h2>
                )}
                {userRecipes.map((recipe) => (
                  <RecipeListItem
                    key={recipe.id}
                    recipe={recipe}
                    onEdit={openEditEditor}
                    onDuplicate={handleDuplicate}
                    onDelete={handleDelete}
                    onClick={() => openEditEditor(recipe.id)}
                  />
                ))}
              </>
            )}

            {/* System recipes */}
            {systemRecipes.length > 0 && (
              <>
                <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mt-4">
                  Công thức hệ thống ({systemRecipes.length})
                </h2>
                {systemRecipes.map((recipe) => (
                  <RecipeListItem
                    key={recipe.id}
                    recipe={recipe}
                    onDuplicate={handleDuplicate}
                  />
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Editor Sheet */}
      <RecipeEditorSheet />
    </div>
  );
};

export { RecipeManagementPage };
