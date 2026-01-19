import * as React from 'react';
import { cn } from '@/lib/utils';
import { Form, Input, TextArea, Switch } from 'antd-mobile';
import { DatePickerInput } from './date-picker-input';
import { CategoryPicker } from './category-picker';
import { UnitSelector } from './unit-selector';
import { QuantityStepper } from './quantity-stepper';
import { StorageLocationPicker } from './storage-location-picker';
import { ImagePickerPlaceholder } from './image-picker-placeholder';
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
  category: 'other',
  storage: 'fridge',
  expiryDate: null,
  noExpiry: false,
  quantity: 1,
  unit: 'pieces',
  notes: '',
  imageUrl: null,
};

const FoodForm = React.forwardRef<FoodFormRef, FoodFormProps>(
  ({ initialValues, onSubmit, className, isLoading }, ref) => {
    const [form] = Form.useForm();
    
    const [values, setValues] = React.useState<FoodFormValues>(() => {
      if (initialValues) {
        return {
          name: initialValues.name || '',
          category: initialValues.category || 'other',
          storage: initialValues.storage || 'fridge',
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

    return (
      <div className={cn('flex flex-col gap-6', className)}>
        {/* Image Picker (Placeholder) */}
        <div className="flex justify-center">
          <ImagePickerPlaceholder
            imageUrl={values.imageUrl}
            onChange={(url) => updateValue('imageUrl', url)}
          />
        </div>

        {/* Food Name */}
        <Form form={form} layout="vertical" disabled={isLoading}>
          <Form.Item label="Food Name" required>
            <Input
              placeholder="e.g., Organic Whole Milk"
              value={values.name}
              onChange={(val) => updateValue('name', val)}
              className="h-14! rounded-xl!"
            />
          </Form.Item>

          {/* Category */}
          <Form.Item label="Category">
            <CategoryPicker
              value={values.category}
              onChange={(val) => updateValue('category', val)}
            />
          </Form.Item>

          {/* Expiry Date */}
          <Form.Item label="Expiry Date">
            <div className="flex flex-col gap-3">
              <DatePickerInput
                value={values.noExpiry ? null : values.expiryDate}
                onChange={(val) => updateValue('expiryDate', val)}
                disabled={values.noExpiry}
                min={new Date()}
              />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">No expiry date</span>
                <Switch
                  checked={values.noExpiry}
                  onChange={(checked) => updateValue('noExpiry', checked)}
                />
              </div>
            </div>
          </Form.Item>

          {/* Quantity */}
          <Form.Item label="Quantity">
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
          <Form.Item label="Storage Location">
            <StorageLocationPicker
              value={values.storage}
              onChange={(val) => updateValue('storage', val as StorageLocation)}
            />
          </Form.Item>

          {/* Notes */}
          <Form.Item label="Notes (optional)">
            <TextArea
              placeholder="Add any notes about this item..."
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
