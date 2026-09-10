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
import {
  testAiConnection,
  type SaveAiSettingsInput,
} from './api/ai-settings.api';
import { useAiSettings, useSaveAiSettings } from './api/use-ai-settings';

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
          <p className="text-xs text-muted-foreground">Hiển thị trong bộ lọc</p>
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
      Toast.show({ content: 'Thiếu tên', position: 'bottom' });
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
              Tên
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên..."
              className="w-full h-14 px-4 rounded-xl border border-input bg-card text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-medium"
            />
          </div>

          {/* Icon Picker */}
          <div className="space-y-3">
            <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Chọn biểu tượng
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
              Màu sắc
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
              <span className="text-base font-bold">Hiển thị trong bộ lọc nhanh</span>
              <span className="text-xs text-muted-foreground">Ghim lên đầu danh sách</span>
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
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex-[2] px-4 py-3.5 text-base font-bold text-primary-foreground bg-primary hover:bg-primary/90 rounded-xl transition-all disabled:opacity-50"
          >
            {isLoading ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>
    </Popup>
  );
}

// ============================================================================
// AI Settings Section
// ============================================================================

/**
 * Display metadata per known model id. The selectable options themselves come
 * from the server (`providers` map on the settings status) — never hardcoded.
 */
const AI_MODEL_META: Record<string, { label: string; description: string }> = {
  'claude-haiku-4-5': { label: 'Haiku 4.5', description: 'Nhanh, rẻ' },
  'claude-sonnet-4-6': { label: 'Sonnet 4.6', description: 'Thông minh hơn, đắt hơn' },
  'glm-5.3-flash': { label: 'GLM 5.3 Flash', description: 'Multimodal (ảnh), rẻ' },
  'glm-5.3': { label: 'GLM 5.3', description: 'Flagship, text' },
};

/** Key input placeholder per provider id. */
const AI_KEY_INPUT_PLACEHOLDERS: Record<string, string> = {
  anthropic: 'sk-ant-...',
  zai: 'Z.AI API key…',
};

interface AiTestResultState {
  state: 'idle' | 'testing' | 'success' | 'error';
  message?: string;
}

function AiSettingsSection() {
  const { data: status, isLoading, error: statusError } = useAiSettings();
  const saveMutation = useSaveAiSettings();

  // Provider/model options come from the server registry (status.providers).
  const providers = status?.providers ?? {};
  const providerEntries = Object.entries(providers);

  const [apiKeyInput, setApiKeyInput] = React.useState('');
  // null until the user explicitly taps a provider/model, so background
  // refetches never clobber an in-progress edit; falls back to the saved/
  // server values.
  const [selectedProvider, setSelectedProvider] = React.useState<string | null>(null);
  const [selectedModel, setSelectedModel] = React.useState<string | null>(null);
  const [testResult, setTestResult] = React.useState<AiTestResultState>({
    state: 'idle',
  });

  const effectiveProvider = selectedProvider ?? status?.provider ?? 'anthropic';
  const providerModels = providers[effectiveProvider]?.models ?? [];
  const effectiveModel =
    selectedModel && providerModels.includes(selectedModel)
      ? selectedModel
      : status?.model && providerModels.includes(status.model)
        ? status.model
        : providerModels[0];
  const hasPersonalKey = status?.source === 'user' && Boolean(status.apiKeyMasked);

  const handleProviderSelect = (providerId: string) => {
    setSelectedProvider(providerId);
    // Switching provider invalidates the previous model: reset to the first
    // model of the newly chosen provider.
    setSelectedModel(providers[providerId]?.models[0] ?? null);
  };

  const handleTestConnection = async () => {
    setTestResult({ state: 'testing' });
    try {
      const result = await testAiConnection();
      setTestResult({
        state: 'success',
        message: `Model phản hồi trong ${result.latencyMs}ms`,
      });
    } catch (error) {
      setTestResult({
        state: 'error',
        message: error instanceof Error ? error.message : 'Lỗi không xác định',
      });
    }
  };

  const handleSave = () => {
    const input: SaveAiSettingsInput = {
      provider: effectiveProvider,
      model: effectiveModel,
    };
    if (apiKeyInput.trim()) {
      input.apiKey = apiKeyInput.trim();
    }
    saveMutation.mutate(input, {
      onSuccess: () => {
        setApiKeyInput('');
        setTestResult({ state: 'idle' });
        Toast.show({ content: 'Đã lưu cấu hình AI', position: 'bottom' });
      },
      onError: () => setTestResult({ state: 'idle' }),
    });
  };

  const handleDeleteKey = () => {
    saveMutation.mutate(
      { provider: effectiveProvider, model: effectiveModel, apiKey: null },
      {
        onSuccess: () => {
          setApiKeyInput('');
          setTestResult({ state: 'idle' });
          Toast.show({ content: 'Đã xoá key cá nhân', position: 'bottom' });
        },
      },
    );
  };

  let statusTitle = 'Chưa cấu hình';
  let statusDetail = 'Thêm API key để dùng trợ lý AI';
  if (statusError) {
    statusTitle = 'Không tải được cấu hình AI';
    statusDetail =
      statusError instanceof Error ? statusError.message : 'Vui lòng thử lại sau';
  } else if (isLoading) {
    statusTitle = 'Đang tải cấu hình AI…';
    statusDetail = '';
  } else if (status?.source === 'user') {
    statusTitle = '✓ Đã cấu hình';
    statusDetail = `${providers[status.provider]?.label ?? status.provider} · Model ${status.model} · key cá nhân ${status.apiKeyMasked ?? ''}`;
  } else if (status?.source === 'env') {
    statusTitle = 'Dùng key server';
    statusDetail = `${providers[status.provider]?.label ?? status.provider} · Model ${status.model} · chưa có key cá nhân`;
  }

  return (
    <section className="mt-6 mb-8">
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          AI
        </h2>
        <span className="text-xs text-muted-foreground">Key cá nhân của bạn</span>
      </div>

      <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
        {/* Status row */}
        <div className="flex items-start justify-between gap-3 p-4 bg-accent rounded-xl">
          <div className="min-w-0">
            <p className="text-sm font-bold">{statusTitle}</p>
            {statusDetail ? (
              <p className="text-xs text-muted-foreground truncate">{statusDetail}</p>
            ) : null}
          </div>
          {hasPersonalKey && (
            <button
              onClick={handleDeleteKey}
              disabled={saveMutation.isPending}
              className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-bold text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
            >
              Xoá key
            </button>
          )}
        </div>

        {/* Provider picker — options come from the server registry */}
        {providerEntries.length > 0 ? (
          <div className="space-y-2">
            <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Nhà cung cấp
            </label>
            <div className="grid grid-cols-2 gap-3">
              {providerEntries.map(([id, option]) => (
                <button
                  key={id}
                  onClick={() => handleProviderSelect(id)}
                  className={cn(
                    'flex flex-col items-start gap-0.5 rounded-xl border p-3 text-left transition-all',
                    effectiveProvider === id
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-border hover:border-muted-foreground/40'
                  )}
                >
                  <span className="text-sm font-bold">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {/* API key input */}
        <div className="space-y-2">
          <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            {providers[effectiveProvider]?.label ?? 'AI'} API key
          </label>
          <input
            type="password"
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            placeholder={
              AI_KEY_INPUT_PLACEHOLDERS[effectiveProvider] ?? 'Dán API key của bạn…'
            }
            autoComplete="off"
            className="w-full h-14 px-4 rounded-xl border border-input bg-card text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-medium"
          />
          <p className="text-xs text-muted-foreground">
            {hasPersonalKey
              ? 'Để trống nếu muốn giữ key cá nhân hiện tại.'
              : 'Key chỉ lưu trong database của bạn và không bao giờ hiển thị lại.'}
          </p>
        </div>

        {/* Model picker — options depend on the selected provider */}
        {providerModels.length > 0 ? (
          <div className="space-y-2">
            <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Model
            </label>
            <div className="grid grid-cols-2 gap-3">
              {providerModels.map((modelId) => {
                const meta = AI_MODEL_META[modelId];
                return (
                  <button
                    key={modelId}
                    onClick={() => setSelectedModel(modelId)}
                    className={cn(
                      'flex flex-col items-start gap-0.5 rounded-xl border p-3 text-left transition-all',
                      effectiveModel === modelId
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border hover:border-muted-foreground/40'
                    )}
                  >
                    <span className="text-sm font-bold">{meta?.label ?? modelId}</span>
                    {meta?.description ? (
                      <span className="text-xs text-muted-foreground">
                        {meta.description}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => void handleTestConnection()}
            disabled={testResult.state === 'testing' || saveMutation.isPending}
            className="flex-1 px-4 py-3 text-sm font-bold text-muted-foreground bg-transparent hover:bg-accent border border-border rounded-xl transition-all disabled:opacity-50"
          >
            Kiểm tra kết nối
          </button>
          <button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="flex-[2] px-4 py-3 text-sm font-bold text-primary-foreground bg-primary hover:bg-primary/90 rounded-xl transition-all disabled:opacity-50"
          >
            {saveMutation.isPending ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          Kiểm tra kết nối dùng key &amp; model đã lưu.
        </p>

        {/* Save error (e.g. ai_settings table not migrated yet) */}
        {saveMutation.isError && saveMutation.error instanceof Error ? (
          <p className="text-xs leading-5 text-destructive">
            ✗ {saveMutation.error.message}
          </p>
        ) : null}

        {/* Connection test result */}
        {testResult.state === 'testing' ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-primary" />
            Đang kiểm tra…
          </div>
        ) : null}
        {testResult.state === 'success' ? (
          <p className="text-xs font-semibold text-primary">✓ {testResult.message}</p>
        ) : null}
        {testResult.state === 'error' ? (
          <p className="text-xs leading-5 text-destructive">✗ {testResult.message}</p>
        ) : null}
      </div>
    </section>
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
              Toast.show({ content: 'Đã cập nhật danh mục', position: 'bottom' });
              setEditModal({ visible: false, type: 'category' });
            },
          }
        );
      } else {
        addCategory.mutate(
          { ...data, sortOrder: categories.length },
          {
            onSuccess: () => {
              Toast.show({ content: 'Đã thêm danh mục', position: 'bottom' });
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
              Toast.show({ content: 'Đã cập nhật nơi lưu trữ', position: 'bottom' });
              setEditModal({ visible: false, type: 'storage' });
            },
          }
        );
      } else {
        addStorageLocation.mutate(
          { ...data, sortOrder: storageLocations.length },
          {
            onSuccess: () => {
              Toast.show({ content: 'Đã thêm nơi lưu trữ', position: 'bottom' });
              setEditModal({ visible: false, type: 'storage' });
            },
          }
        );
      }
    }
  };

  const handleDeleteCategory = (id: string) => {
    deleteCategory.mutate(id, {
      onSuccess: () => Toast.show({ content: 'Đã xóa danh mục', position: 'bottom' }),
    });
  };

  const handleDeleteStorageLocation = (id: string) => {
    deleteStorageLocation.mutate(id, {
      onSuccess: () => Toast.show({ content: 'Đã xóa nơi lưu trữ', position: 'bottom' }),
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
        <h1 className="text-lg font-bold">Cấu hình</h1>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 rounded-full text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Xong
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
                  Quản lý danh mục
                </h2>
                <span className="text-xs text-muted-foreground">Kéo để sắp xếp</span>
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
                <span className="font-semibold">Thêm danh mục</span>
              </button>
            </section>

            {/* Storage Locations Section */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Quản lý nơi lưu trữ
                </h2>
                <span className="text-xs text-muted-foreground">Kéo để sắp xếp</span>
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
                <span className="font-semibold">Thêm nơi lưu trữ</span>
              </button>
            </section>
          </>
        )}

        {/* AI Section */}
        <AiSettingsSection />
      </main>

      {/* Edit Modal */}
      <EditModal
        visible={editModal.visible}
        onClose={() => setEditModal({ visible: false, type: editModal.type })}
        onSave={handleSave}
        initialData={editModal.item}
        title={
          editModal.item
            ? `Sửa ${editModal.type === 'category' ? 'danh mục' : 'nơi lưu trữ'}`
            : `Thêm ${editModal.type === 'category' ? 'danh mục' : 'nơi lưu trữ'}`
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
