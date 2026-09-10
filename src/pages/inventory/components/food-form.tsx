import * as React from 'react';
import { cn } from '@/lib/utils';
import { Form, Input, TextArea, Switch, Toast } from 'antd-mobile';
import { Camera, Loader2 } from 'lucide-react';
import { DatePickerInput } from './date-picker-input';
import { CategoryPicker } from './category-picker';
import { UnitSelector, unitOptions } from './unit-selector';
import { QuantityStepper } from './quantity-stepper';
import { StorageLocationPicker } from './storage-location-picker';
import { ImagePickerPlaceholder } from './image-picker-placeholder';
import { resizeImageForVision, blobToDataUrl } from '@/lib/image-upload';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { Button } from '@/components/ui';
import type { FoodCategory, StorageLocation, QuantityUnit, CreateFoodItemInput, FoodItem } from '@/api/types';

export interface FoodFormRef {
  submit: () => void;
}

export interface FoodFormValues {
  name: string;
  category: FoodCategory;
  storage: StorageLocation;
  expiryDate: Date | null;
  noExpiry: boolean;
  quantity: number;
  unit: QuantityUnit;
  notes: string;
  imageUrl: string | null;
}

interface FoodFormProps {
  initialValues?: Partial<FoodItem>;
  onSubmit: (values: CreateFoodItemInput) => void;
  isLoading?: boolean;
  className?: string;
}

const defaultValues: FoodFormValues = {
  name: '',
  category: 'Other',
  storage: 'Fridge',
  expiryDate: null,
  noExpiry: false,
  quantity: 1,
  unit: 'pieces',
  notes: '',
  imageUrl: null,
};

// ============================================================================
// AI vision draft ("Nhập bằng ảnh")
// ============================================================================

/** Item shape returned by POST /api/ai/vision */
interface VisionDraftItem {
  name: string;
  quantity: number | null;
  unit: string | null;
  category: string | null;
  storage: string | null;
  expirationDate: string | null;
  barcode: string | null;
  confidence: 'high' | 'medium' | 'low';
}

interface VisionDraftResult {
  items: VisionDraftItem[];
  notes: string | null;
}

type VisionStatus = 'idle' | 'loading' | 'error';

/** Map a model-returned unit string to the form's QuantityUnit options. */
function resolveQuantityUnit(unit: string | null): QuantityUnit | null {
  if (!unit) return null;
  const normalized = unit.trim().toLowerCase();
  const byValue = unitOptions.find((opt) => opt.value === normalized);
  if (byValue) return byValue.value;
  const byLabel = unitOptions.find((opt) => opt.label.toLowerCase() === normalized);
  if (byLabel) return byLabel.value;
  return null;
}

const FoodForm = React.forwardRef<FoodFormRef, FoodFormProps>(
  ({ initialValues, onSubmit, className, isLoading }, ref) => {
    const [form] = Form.useForm();
    
    const [values, setValues] = React.useState<FoodFormValues>(() => {
      if (initialValues) {
        return {
          name: initialValues.name || '',
          category: initialValues.category || 'Other',
          storage: initialValues.storage || 'Fridge',
          expiryDate: initialValues.expiryDate ? new Date(initialValues.expiryDate) : null,
          noExpiry: !initialValues.expiryDate,
          quantity: initialValues.quantity || 1,
          unit: initialValues.unit || 'pieces',
          notes: initialValues.notes || '',
          imageUrl: initialValues.imageUrl || null,
        };
      }
      return defaultValues;
    });

    // AI vision draft state ("Nhập bằng ảnh")
    const visionFileInputRef = React.useRef<HTMLInputElement>(null);
    const [visionStatus, setVisionStatus] = React.useState<VisionStatus>('idle');
    const [visionError, setVisionError] = React.useState<string | null>(null);
    const [hasDraft, setHasDraft] = React.useState(false);
    const [draftNote, setDraftNote] = React.useState<string | null>(null);

    const handleSubmit = React.useCallback(() => {
      if (!values.name.trim()) {
        return;
      }
      
      const input: CreateFoodItemInput = {
        name: values.name.trim(),
        category: values.category,
        storage: values.storage,
        expiryDate: values.noExpiry ? null : values.expiryDate?.toISOString() || null,
        quantity: values.quantity,
        unit: values.unit,
        notes: values.notes.trim() || undefined,
        imageUrl: values.imageUrl || undefined,
      };
      
      onSubmit(input);
    }, [values, onSubmit]);

    React.useImperativeHandle(ref, () => ({
      submit: handleSubmit,
    }), [handleSubmit]);

    const updateValue = <K extends keyof FoodFormValues>(key: K, value: FoodFormValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
    };

    /** Fill the form with the first item recognized by the vision API. */
    const applyVisionDraft = (result: VisionDraftResult) => {
      const first = result.items[0];
      if (!first || !first.name.trim()) {
        throw new Error('Không nhận diện được món nào từ ảnh');
      }

      const draftExpiryDate = first.expirationDate
        ? new Date(`${first.expirationDate}T00:00:00`)
        : null;
      if (first.expirationDate && (!draftExpiryDate || Number.isNaN(draftExpiryDate.getTime()))) {
        throw new Error('Ngày hết hạn trong draft không hợp lệ');
      }

      setValues((prev) => ({
        ...prev,
        name: first.name.trim(),
        quantity:
          first.quantity !== null && first.quantity > 0 ? first.quantity : prev.quantity,
        unit: resolveQuantityUnit(first.unit) ?? prev.unit,
        category: first.category?.trim() || prev.category,
        storage: first.storage?.trim() || prev.storage,
        expiryDate: draftExpiryDate ?? prev.expiryDate,
        noExpiry: draftExpiryDate ? false : prev.noExpiry,
      }));

      const extras: string[] = [];
      if (result.items.length > 1) {
        extras.push(`Nhận diện được ${result.items.length} món — đã điền món đầu tiên.`);
      }
      if (result.notes) {
        extras.push(result.notes);
      }
      setDraftNote(extras.join(' ') || null);
      setHasDraft(true);
    };

    const importDraftFromImage = async (file: File) => {
      setVisionStatus('loading');
      setVisionError(null);
      setHasDraft(false);
      setDraftNote(null);

      try {
        // Reuse the existing pica-based compression (≤1280px, JPEG)
        const resizedBlob = await resizeImageForVision(file);
        const imageDataUrl = await blobToDataUrl(resizedBlob);

        const {
          data: { session },
        } = await getSupabaseClient().auth.getSession();
        const accessToken = session?.access_token;
        if (!accessToken) {
          throw new Error('Bạn cần đăng nhập để dùng tính năng này');
        }

        const response = await fetch('/api/ai/vision', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ imageDataUrl }),
        });

        if (!response.ok) {
          let message = `Phân tích ảnh thất bại (${response.status})`;
          try {
            const payload = (await response.json()) as { error?: string };
            if (payload?.error) message = payload.error;
          } catch {
            // Non-JSON error body — keep the generic message
          }
          throw new Error(message);
        }

        const draft = (await response.json()) as VisionDraftResult;
        applyVisionDraft(draft);
        setVisionStatus('idle');
        Toast.show({ content: 'Đã tạo draft từ ảnh', icon: 'success' });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Phân tích ảnh thất bại';
        setVisionError(message);
        setVisionStatus('error');
        Toast.show({ content: message, icon: 'fail' });
      }
    };

    const handleVisionClick = () => {
      if (visionStatus !== 'loading' && visionFileInputRef.current) {
        visionFileInputRef.current.click();
      }
    };

    const handleVisionFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      // Reset so the same file can be picked again (retry flow)
      event.target.value = '';
      if (file) {
        void importDraftFromImage(file);
      }
    };

    return (
      <div className={cn('flex flex-col gap-6', className)}>
        {/* Image Picker (Placeholder) */}
        <div className="flex justify-center">
          <ImagePickerPlaceholder
            imageUrl={values.imageUrl}
            onChange={(url) => updateValue('imageUrl', url)}
          />
        </div>

        {/* AI vision import ("Nhập bằng ảnh") */}
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleVisionClick}
            disabled={visionStatus === 'loading' || isLoading}
          >
            {visionStatus === 'loading' ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Camera />
            )}
            {visionStatus === 'loading' ? 'Đang phân tích ảnh...' : 'Nhập bằng ảnh'}
          </Button>

          {hasDraft && (
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
              <p className="text-sm text-primary font-medium">
                📷 Draft từ ảnh — kiểm tra trước khi lưu
              </p>
              {draftNote && (
                <p className="text-xs text-muted-foreground mt-1">{draftNote}</p>
              )}
            </div>
          )}

          {visionStatus === 'error' && visionError && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-destructive">{visionError}</p>
                <button
                  type="button"
                  onClick={handleVisionClick}
                  className="text-sm font-medium text-destructive underline underline-offset-2 shrink-0"
                >
                  Thử lại
                </button>
              </div>
            </div>
          )}

          <input
            ref={visionFileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleVisionFileChange}
            disabled={visionStatus === 'loading'}
          />
        </div>

        {/* Food Name */}
        <Form form={form} layout="vertical" disabled={isLoading}>
          <Form.Item label="Tên món" required>
            <Input
              placeholder="ví dụ: Sữa tươi nguyên chất"
              value={values.name}
              onChange={(val) => updateValue('name', val)}
              className="h-14! rounded-xl!"
            />
          </Form.Item>

          {/* Category */}
          <Form.Item label="Danh mục">
            <CategoryPicker
              value={values.category}
              onChange={(val) => updateValue('category', val)}
            />
          </Form.Item>

          {/* Expiry Date */}
          <Form.Item label="Ngày hết hạn">
            <div className="flex flex-col gap-3">
              <DatePickerInput
                value={values.noExpiry ? null : values.expiryDate}
                onChange={(val) => updateValue('expiryDate', val)}
                disabled={values.noExpiry}
                min={new Date()}
              />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Không có ngày hết hạn</span>
                <Switch
                  checked={values.noExpiry}
                  onChange={(checked) => updateValue('noExpiry', checked)}
                />
              </div>
            </div>
          </Form.Item>

          {/* Quantity */}
          <Form.Item label="Số lượng">
            <div className="flex items-center gap-4">
              <QuantityStepper
                value={values.quantity}
                onChange={(val) => updateValue('quantity', val)}
                min={1}
                max={999}
              />
              <UnitSelector
                value={values.unit}
                onChange={(val) => updateValue('unit', val)}
              />
            </div>
          </Form.Item>

          {/* Storage Location */}
          <Form.Item label="Nơi lưu trữ">
            <StorageLocationPicker
              value={values.storage}
              onChange={(val) => updateValue('storage', val as StorageLocation)}
            />
          </Form.Item>

          {/* Notes */}
          <Form.Item label="Ghi chú (tùy chọn)">
            <TextArea
              placeholder="Thêm ghi chú về món này..."
              value={values.notes}
              onChange={(val) => updateValue('notes', val)}
              rows={3}
              maxLength={200}
              showCount
              className="rounded-xl!"
            />
          </Form.Item>
        </Form>

      </div>
    );
  }
);
FoodForm.displayName = 'FoodForm';

export { FoodForm };
