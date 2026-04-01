import * as React from 'react';
import { BottomSheet } from '@/components/shared';
import { SpinLoading, Dialog } from 'antd-mobile';
import { useRecipeById } from '../api/use-recipes-management';
import {
  useCreateRecipe,
  useUpdateRecipe,
  useReplaceRecipeIngredients,
  useReplaceRecipeSteps,
} from '../api/use-recipes-management-mutations';
import { useRecipesManagementStore } from '@/pages/recipes/store/recipes-management.store';
import { RecipeEditorForm } from './recipe-editor-form';
import type { RecipeEditorFormValues } from './recipe-editor-form';
import type { CreateRecipeInput, UpdateRecipeInput } from '@/api/types';

function parseTags(tagsString: string): string[] {
  return tagsString
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

const RecipeEditorSheet: React.FC = () => {
  const {
    isEditorOpen,
    editingRecipeId,
    draftDirty,
    closeEditor,
    setDraftDirty,
  } = useRecipesManagementStore();

  const { data: existingRecipe, isLoading } = useRecipeById(editingRecipeId);

  const createMutation = useCreateRecipe();
  const updateMutation = useUpdateRecipe();
  const replaceIngredientsMutation = useReplaceRecipeIngredients();
  const replaceStepsMutation = useReplaceRecipeSteps();

  const isEditMode = !!editingRecipeId;
  const isSubmitting =
    createMutation.isPending ||
    updateMutation.isPending ||
    replaceIngredientsMutation.isPending ||
    replaceStepsMutation.isPending;

  const handleClose = () => {
    if (draftDirty) {
      Dialog.confirm({
        title: 'Hủy thay đổi?',
        content: 'Bạn có thay đổi chưa lưu. Bạn có chắc muốn hủy chúng?',
        confirmText: 'Hủy',
        cancelText: 'Tiếp tục sửa',
        onConfirm: () => closeEditor(),
      });
    } else {
      closeEditor();
    }
  };

  const handleSubmit = async (values: RecipeEditorFormValues) => {
    const tags = parseTags(values.tags);

    if (isEditMode && editingRecipeId) {
      // Update metadata
      const updateInput: UpdateRecipeInput = {
        id: editingRecipeId,
        title: values.title,
        description: values.description || undefined,
        cookTimeMinutes: values.cookTimeMinutes,
        prepTimeMinutes: values.prepTimeMinutes || undefined,
        servings: values.servings,
        difficulty: values.difficulty,
        tags,
      };

      await updateMutation.mutateAsync(updateInput);

      // Replace ingredients and steps
      await Promise.all([
        replaceIngredientsMutation.mutateAsync({
          recipeId: editingRecipeId,
          ingredients: values.ingredients.filter((ing) => ing.name.trim()),
        }),
        replaceStepsMutation.mutateAsync({
          recipeId: editingRecipeId,
          steps: values.steps.filter((step) => step.instruction.trim()),
        }),
      ]);
    } else {
      // Create new recipe
      const createInput: CreateRecipeInput = {
        title: values.title,
        description: values.description || undefined,
        cookTimeMinutes: values.cookTimeMinutes,
        prepTimeMinutes: values.prepTimeMinutes || undefined,
        servings: values.servings,
        difficulty: values.difficulty,
        tags,
        ingredients: values.ingredients.filter((ing) => ing.name.trim()),
        steps: values.steps.filter((step) => step.instruction.trim()),
      };

      await createMutation.mutateAsync(createInput);
    }

    setDraftDirty(false);
    closeEditor();
  };

  return (
    <BottomSheet
      visible={isEditorOpen}
      onClose={handleClose}
      title={isEditMode ? 'Sửa công thức' : 'Công thức mới'}
    >
      {isEditMode && isLoading ? (
        <div className="flex items-center justify-center py-16">
          <SpinLoading style={{ '--size': '36px' }} />
        </div>
      ) : (
        <RecipeEditorForm
          initialValues={isEditMode ? existingRecipe : null}
          onSubmit={handleSubmit}
          onDirtyChange={setDraftDirty}
          isSubmitting={isSubmitting}
        />
      )}
    </BottomSheet>
  );
};

export { RecipeEditorSheet };
