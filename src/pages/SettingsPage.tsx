import React from 'react';
import { useNavigate } from 'react-router';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Popup, Toast } from 'antd-mobile';
import { GripVertical, Pencil, Trash2, Plus, ArrowLeft, Check, X } from 'lucide-react';
import {
  useCategories,
  useStorageLocations,
  useAddCategory,
  useUpdateCategory,
  useDeleteCategory,
  useReorderCategories,
  useAddStorageLocation,
  useUpdateStorageLocation,
  useDeleteStorageLocation,
  useReorderStorageLocations,
} from '@/api';
import type { CategoryConfig, StorageLocationConfig } from '@/api/types';
import { cn } from '@/lib/utils';

// ============================================================================
// Constants
// ============================================================================

const ICON_OPTIONS = ['🍎', '🥕', '🥛', '🥩', '🥤', '📦', '🥗', '🧊', '❄️', '🚪', '🧂', '🍳', '🥚', '🧈', '🍞', '🥫'];

const COLOR_OPTIONS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
];

// ============================================================================
// Sortable Item Component
// ============================================================================

interface SortableItemProps {
  item: CategoryConfig | StorageLocationConfig;
  onEdit: () => void;
  onDelete: () => void;
}

function SortableItem({ item, onEdit, onDelete }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group flex items-center gap-3 p-4 bg-card border-b border-border last:border-b-0',
        'hover:bg-accent/50 transition-colors',
        isDragging && 'opacity-50 shadow-lg z-10'
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="touch-none cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
      >
        <GripVertical size={20} />
      </button>

      <div
        className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0 text-2xl"
        style={{ backgroundColor: `${item.color}20` }}
      >
        {item.icon}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-base font-semibold truncate">{item.name}</p>
        {item.showInFilters && (
          <p className="text-xs text-muted-foreground">Shown in filters</p>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={onEdit}
          className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-primary transition-colors"
        >
          <Pencil size={18} />
        </button>
        <button
          onClick={onDelete}
          className="p-2 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Edit Modal Component
// ============================================================================

interface EditModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: { name: string; icon: string; color: string; showInFilters: boolean }) => void;
  initialData?: { name: string; icon: string; color: string; showInFilters: boolean };
  title: string;
  isLoading?: boolean;
}

function EditModal({ visible, onClose, onSave, initialData, title, isLoading }: EditModalProps) {
  const [name, setName] = React.useState(initialData?.name || '');
  const [icon, setIcon] = React.useState(initialData?.icon || '📦');
  const [color, setColor] = React.useState(initialData?.color || COLOR_OPTIONS[0]);
  const [showInFilters, setShowInFilters] = React.useState(initialData?.showInFilters ?? true);

  React.useEffect(() => {
    if (visible) {
      setName(initialData?.name || '');
      setIcon(initialData?.icon || '📦');
      setColor(initialData?.color || COLOR_OPTIONS[0]);
      setShowInFilters(initialData?.showInFilters ?? true);
    }
  }, [visible, initialData]);

  const handleSave = () => {
    if (!name.trim()) {
      Toast.show({ content: 'Name is required', position: 'bottom' });
      return;
    }
    onSave({ name: name.trim(), icon, color, showInFilters });
  };

  return (
    <Popup
      visible={visible}
      onMaskClick={onClose}
      position="bottom"
      bodyStyle={{
        borderTopLeftRadius: '16px',
        borderTopRightRadius: '16px',
        maxHeight: '90vh',
      }}
    >
      <div className="flex flex-col bg-background">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-accent">
            <X size={24} className="text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Name Input */}
          <div className="space-y-2">
            <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name..."
              className="w-full h-14 px-4 rounded-xl border border-input bg-card text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-medium"
            />
          </div>

          {/* Icon Picker */}
          <div className="space-y-3">
            <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Pick an Icon
            </label>
            <div className="grid grid-cols-8 gap-2">
              {ICON_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setIcon(emoji)}
                  className={cn(
                    'aspect-square flex items-center justify-center text-2xl rounded-xl transition-all',
                    icon === emoji
                      ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background'
                      : 'bg-accent hover:bg-accent/80'
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker */}
          <div className="space-y-3">
            <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Color Code
            </label>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    'w-12 h-12 rounded-full shrink-0 transition-all flex items-center justify-center',
                    color === c && 'ring-2 ring-offset-2 ring-offset-background'
                  )}
                  style={{ backgroundColor: c, '--tw-ring-color': c } as React.CSSProperties}
                >
                  {color === c && <Check size={20} className="text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Show in Filters Toggle */}
          <div className="flex items-center justify-between p-4 bg-accent rounded-xl">
            <div className="flex flex-col gap-1">
              <span className="text-base font-bold">Show in quick filters</span>
              <span className="text-xs text-muted-foreground">Pin to top of inventory list</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showInFilters}
                onChange={(e) => setShowInFilters(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-12 h-7 bg-muted rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:after:translate-x-5"></div>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3.5 text-base font-bold text-muted-foreground bg-transparent hover:bg-accent border border-border rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex-[2] px-4 py-3.5 text-base font-bold text-primary-foreground bg-primary hover:bg-primary/90 rounded-xl transition-all disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </Popup>
  );
}

// ============================================================================
// Main Settings Page
// ============================================================================

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();

  // Queries
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: storageLocations = [], isLoading: locationsLoading } = useStorageLocations();

  // Mutations
  const addCategory = useAddCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const reorderCategories = useReorderCategories();

  const addStorageLocation = useAddStorageLocation();
  const updateStorageLocation = useUpdateStorageLocation();
  const deleteStorageLocation = useDeleteStorageLocation();
  const reorderStorageLocations = useReorderStorageLocations();

  // Modal state
  const [editModal, setEditModal] = React.useState<{
    visible: boolean;
    type: 'category' | 'storage';
    item?: CategoryConfig | StorageLocationConfig;
  }>({ visible: false, type: 'category' });

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Handlers
  const handleCategoryDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = categories.findIndex((c) => c.id === active.id);
      const newIndex = categories.findIndex((c) => c.id === over.id);
      const newOrder = arrayMove(categories, oldIndex, newIndex);
      reorderCategories.mutate(newOrder);
    }
  };

  const handleStorageDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = storageLocations.findIndex((l) => l.id === active.id);
      const newIndex = storageLocations.findIndex((l) => l.id === over.id);
      const newOrder = arrayMove(storageLocations, oldIndex, newIndex);
      reorderStorageLocations.mutate(newOrder);
    }
  };

  const handleSave = (data: { name: string; icon: string; color: string; showInFilters: boolean }) => {
    const { type, item } = editModal;

    if (type === 'category') {
      if (item) {
        updateCategory.mutate(
          { id: item.id, updates: data },
          {
            onSuccess: () => {
              Toast.show({ content: 'Category updated', position: 'bottom' });
              setEditModal({ visible: false, type: 'category' });
            },
          }
        );
      } else {
        addCategory.mutate(
          { ...data, sortOrder: categories.length },
          {
            onSuccess: () => {
              Toast.show({ content: 'Category added', position: 'bottom' });
              setEditModal({ visible: false, type: 'category' });
            },
          }
        );
      }
    } else {
      if (item) {
        updateStorageLocation.mutate(
          { id: item.id, updates: data },
          {
            onSuccess: () => {
              Toast.show({ content: 'Storage location updated', position: 'bottom' });
              setEditModal({ visible: false, type: 'storage' });
            },
          }
        );
      } else {
        addStorageLocation.mutate(
          { ...data, sortOrder: storageLocations.length },
          {
            onSuccess: () => {
              Toast.show({ content: 'Storage location added', position: 'bottom' });
              setEditModal({ visible: false, type: 'storage' });
            },
          }
        );
      }
    }
  };

  const handleDeleteCategory = (id: string) => {
    deleteCategory.mutate(id, {
      onSuccess: () => Toast.show({ content: 'Category deleted', position: 'bottom' }),
    });
  };

  const handleDeleteStorageLocation = (id: string) => {
    deleteStorageLocation.mutate(id, {
      onSuccess: () => Toast.show({ content: 'Storage location deleted', position: 'bottom' }),
    });
  };

  const isLoading = categoriesLoading || locationsLoading;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-background shrink-0 sticky top-0 z-10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-accent transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold">Configuration</h1>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 rounded-full text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Done
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-4 pb-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Categories Section */}
            <section className="mt-6 mb-8">
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Manage Categories
                </h2>
                <span className="text-xs text-muted-foreground">Drag to reorder</span>
              </div>

              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleCategoryDragEnd}
                >
                  <SortableContext
                    items={categories.map((c) => c.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {categories.map((category) => (
                      <SortableItem
                        key={category.id}
                        item={category}
                        onEdit={() => setEditModal({ visible: true, type: 'category', item: category })}
                        onDelete={() => handleDeleteCategory(category.id)}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>

              <button
                onClick={() => setEditModal({ visible: true, type: 'category' })}
                className="w-full mt-3 flex items-center justify-center gap-2 py-3.5 bg-card border border-dashed border-muted-foreground/30 rounded-xl text-muted-foreground hover:border-primary hover:text-primary transition-all"
              >
                <Plus size={20} />
                <span className="font-semibold">Add Category</span>
              </button>
            </section>

            {/* Storage Locations Section */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Manage Storage Locations
                </h2>
                <span className="text-xs text-muted-foreground">Drag to reorder</span>
              </div>

              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleStorageDragEnd}
                >
                  <SortableContext
                    items={storageLocations.map((l) => l.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {storageLocations.map((location) => (
                      <SortableItem
                        key={location.id}
                        item={location}
                        onEdit={() => setEditModal({ visible: true, type: 'storage', item: location })}
                        onDelete={() => handleDeleteStorageLocation(location.id)}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>

              <button
                onClick={() => setEditModal({ visible: true, type: 'storage' })}
                className="w-full mt-3 flex items-center justify-center gap-2 py-3.5 bg-card border border-dashed border-muted-foreground/30 rounded-xl text-muted-foreground hover:border-primary hover:text-primary transition-all"
              >
                <Plus size={20} />
                <span className="font-semibold">Add Location</span>
              </button>
            </section>
          </>
        )}
      </main>

      {/* Edit Modal */}
      <EditModal
        visible={editModal.visible}
        onClose={() => setEditModal({ visible: false, type: editModal.type })}
        onSave={handleSave}
        initialData={editModal.item}
        title={
          editModal.item
            ? `Edit ${editModal.type === 'category' ? 'Category' : 'Location'}`
            : `Add ${editModal.type === 'category' ? 'Category' : 'Location'}`
        }
        isLoading={
          addCategory.isPending ||
          updateCategory.isPending ||
          addStorageLocation.isPending ||
          updateStorageLocation.isPending
        }
      />
    </div>
  );
};
