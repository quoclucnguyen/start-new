import * as React from "react";
import { Input, TextArea, Toast, Dialog } from "antd-mobile";
import { CalendarDays, Plus, X } from "lucide-react";
import { BottomSheet, FixedBottomAction } from "@/components/shared";
import { RecipePicker } from "./recipe-picker";
import {
  useAddMealPlan,
  useUpdateMealPlan,
  useDeleteMealPlan,
  useMealPlans,
} from "@/pages/diary/api";
import type {
  MealPlan,
  CreateMealPlanItemInput,
} from "@/pages/diary/api/types";
import type { Recipe } from "@/api/types";

interface ItemDraft {
  key: string;
  title: string;
  recipeId?: string;
  notes?: string;
}

interface MealPlanFormProps {
  visible: boolean;
  onClose: () => void;
  /** Pre-selected date (YYYY-MM-DD) */
  plannedDate: string;
  /** If provided, edit this plan instead of creating new */
  editingPlanId?: string | null;
}

const DEFAULT_MEAL_TITLE_SUGGESTIONS = ["Bữa sáng", "Bữa trưa", "Bữa tối"];

const normalizeForSearch = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export const MealPlanForm: React.FC<MealPlanFormProps> = ({
  visible,
  onClose,
  plannedDate,
  editingPlanId,
}) => {
  const { data: allPlans } = useMealPlans();
  const addMutation = useAddMealPlan();
  const updateMutation = useUpdateMealPlan();
  const deleteMutation = useDeleteMealPlan();

  const editingPlan: MealPlan | undefined = editingPlanId
    ? allPlans?.find((p) => p.id === editingPlanId)
    : undefined;

  const [title, setTitle] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [date, setDate] = React.useState(plannedDate);
  const [items, setItems] = React.useState<ItemDraft[]>([]);
  const [isTitleFocused, setIsTitleFocused] = React.useState(false);

  const titleBlurTimeoutRef = React.useRef<number | null>(null);

  const mealTitleSuggestions = React.useMemo(() => {
    const seen = new Set<string>();
    const suggestions: string[] = [];

    const pushSuggestion = (rawValue: string | undefined) => {
      const value = rawValue?.trim();
      if (!value) return;

      const normalized = normalizeForSearch(value);
      if (!normalized || seen.has(normalized)) return;

      seen.add(normalized);
      suggestions.push(value);
    };

    for (const fallback of DEFAULT_MEAL_TITLE_SUGGESTIONS) {
      pushSuggestion(fallback);
    }

    for (const plan of allPlans ?? []) {
      pushSuggestion(plan.title);
    }

    return suggestions;
  }, [allPlans]);

  const filteredMealTitleSuggestions = React.useMemo(() => {
    const query = normalizeForSearch(title);

    return mealTitleSuggestions
      .filter((suggestion) => {
        const normalizedSuggestion = normalizeForSearch(suggestion);
        if (!query) return true;
        if (normalizedSuggestion === query) return false;
        return normalizedSuggestion.includes(query);
      })
      .slice(0, 6);
  }, [mealTitleSuggestions, title]);

  const clearTitleBlurTimeout = React.useCallback(() => {
    if (titleBlurTimeoutRef.current) {
      window.clearTimeout(titleBlurTimeoutRef.current);
      titleBlurTimeoutRef.current = null;
    }
  }, []);

  const handleTitleFocus = React.useCallback(() => {
    clearTitleBlurTimeout();
    setIsTitleFocused(true);
  }, [clearTitleBlurTimeout]);

  const handleTitleBlur = React.useCallback(() => {
    clearTitleBlurTimeout();
    titleBlurTimeoutRef.current = window.setTimeout(() => {
      setIsTitleFocused(false);
      titleBlurTimeoutRef.current = null;
    }, 120);
  }, [clearTitleBlurTimeout]);

  const handleSelectTitleSuggestion = React.useCallback(
    (suggestion: string) => {
      clearTitleBlurTimeout();
      setTitle(suggestion);
      setIsTitleFocused(false);
    },
    [clearTitleBlurTimeout],
  );

  React.useEffect(
    () => () => {
      clearTitleBlurTimeout();
    },
    [clearTitleBlurTimeout],
  );

  // Populate form when editing
  React.useEffect(() => {
    if (editingPlan) {
      setTitle(editingPlan.title);
      setNotes(editingPlan.notes ?? "");
      setDate(editingPlan.plannedDate);
      setItems(
        editingPlan.items.map((it) => ({
          key: it.id,
          title: it.title,
          recipeId: it.recipeId,
          notes: it.notes,
        })),
      );
    }
  }, [editingPlan]);

  // Reset form when opening for new plan
  React.useEffect(() => {
    if (visible && !editingPlanId) {
      setTitle("");
      setNotes("");
      setDate(plannedDate);
      setItems([]);
      setIsTitleFocused(false);
    }
  }, [visible, editingPlanId, plannedDate]);

  const addItem = () => {
    setItems((prev) => [...prev, { key: `new-${Date.now()}`, title: "" }]);
  };

  const removeItem = (key: string) => {
    setItems((prev) => prev.filter((it) => it.key !== key));
  };

  const updateItem = (key: string, patch: Partial<ItemDraft>) => {
    setItems((prev) =>
      prev.map((it) => (it.key === key ? { ...it, ...patch } : it)),
    );
  };

  const handleRecipeChange = (
    key: string,
    recipeId: string | undefined,
    recipe: Recipe | undefined,
  ) => {
    updateItem(key, { recipeId });
    // Auto-fill item title from recipe if empty
    const item = items.find((it) => it.key === key);
    if (recipe && item && !item.title.trim()) {
      updateItem(key, { recipeId, title: recipe.title });
    }
  };

  const handleSave = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      Toast.show({ content: "Vui lòng nhập tên bữa ăn", icon: "fail" });
      return;
    }

    const itemInputs: CreateMealPlanItemInput[] = items
      .filter((it) => it.title.trim())
      .map((it) => ({
        title: it.title.trim(),
        recipeId: it.recipeId,
        notes: it.notes?.trim() || undefined,
      }));

    if (editingPlan) {
      updateMutation.mutate(
        {
          id: editingPlan.id,
          title: trimmedTitle,
          notes: notes.trim() || undefined,
          plannedDate: date,
          items: itemInputs,
        },
        {
          onSuccess: () => {
            Toast.show({ content: "Đã cập nhật", icon: "success" });
            onClose();
          },
        },
      );
    } else {
      addMutation.mutate(
        {
          title: trimmedTitle,
          notes: notes.trim() || undefined,
          plannedDate: date,
          items: itemInputs,
        },
        {
          onSuccess: () => {
            Toast.show({ content: "Đã thêm kế hoạch", icon: "success" });
            onClose();
          },
        },
      );
    }
  };

  const handleDelete = () => {
    if (!editingPlan) return;
    Dialog.confirm({
      content: "Xoá kế hoạch này?",
      confirmText: "Xoá",
      cancelText: "Huỷ",
      onConfirm: () => {
        deleteMutation.mutate(editingPlan.id, {
          onSuccess: () => {
            Toast.show({ content: "Đã xoá", icon: "success" });
            onClose();
          },
        });
      },
    });
  };

  const dateLabel = (() => {
    const d = new Date(date + "T00:00:00");
    return d.toLocaleDateString("vi-VN", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  })();

  const isSaving = addMutation.isPending || updateMutation.isPending;

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={editingPlan ? "Sửa kế hoạch" : "Thêm kế hoạch"}
      height="80vh"
    >
      <div className="flex flex-col gap-4 px-4 pb-24">
        {/* Date display */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays size={16} />
          <span>{dateLabel}</span>
        </div>

        {/* Meal title */}
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">
            Tên bữa ăn <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <Input
              placeholder="Vd: Bữa sáng, Bữa trưa, Bữa tối..."
              value={title}
              onChange={setTitle}
              onFocus={handleTitleFocus}
              onBlur={handleTitleBlur}
              className="rounded-lg! border-border/60! bg-secondary/40!"
            />

            {isTitleFocused && filteredMealTitleSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 z-30 mt-1 overflow-hidden rounded-lg border border-border/60 bg-background shadow-lg">
                {filteredMealTitleSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onMouseDown={(event) => {
                      event.preventDefault();
                    }}
                    onClick={() => handleSelectTitleSuggestion(suggestion)}
                    className="w-full border-b border-border/40 px-3 py-2 text-left text-sm text-foreground transition-colors last:border-b-0 active:bg-muted"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Items (dishes) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground">
              Các món ({items.length})
            </label>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-1 text-sm text-primary font-medium active:opacity-70"
            >
              <Plus size={16} />
              Thêm món
            </button>
          </div>

          {items.length === 0 && (
            <div className="rounded-lg border border-dashed border-border/60 p-4 text-center text-sm text-muted-foreground">
              Chưa có món nào. Nhấn "Thêm món" để bắt đầu.
            </div>
          )}

          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.key}
                className="rounded-lg border border-border/40 bg-secondary/20 p-3"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Input
                    placeholder="Tên món..."
                    value={item.title}
                    onChange={(val) => updateItem(item.key, { title: val })}
                    className="flex-1 rounded-lg! border-border/60! bg-background!"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(item.key)}
                    className="p-1.5 text-destructive/70 rounded-lg active:bg-destructive/10 shrink-0"
                  >
                    <X size={16} />
                  </button>
                </div>
                <RecipePicker
                  value={item.recipeId}
                  onChange={(rid, recipe) =>
                    handleRecipeChange(item.key, rid, recipe)
                  }
                />
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">
            Ghi chú
          </label>
          <TextArea
            placeholder="Thêm ghi chú..."
            value={notes}
            onChange={setNotes}
            rows={2}
            className="rounded-lg! border-border/60! bg-secondary/40!"
          />
        </div>
      </div>

      <FixedBottomAction>
        <div className="flex gap-3">
          {editingPlan && (
            <button
              type="button"
              onClick={handleDelete}
              className="flex-none rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive active:bg-destructive/20"
            >
              Xoá
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground active:bg-primary/90 disabled:opacity-50"
          >
            {isSaving ? "Đang lưu..." : editingPlan ? "Cập nhật" : "Thêm"}
          </button>
        </div>
      </FixedBottomAction>
    </BottomSheet>
  );
};
