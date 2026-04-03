import * as React from 'react';
import { cn } from '@/lib/utils';
import { Form, Input, TextArea } from 'antd-mobile';
import { CategoryPicker } from '@/pages/inventory/components/category-picker';
import { QuantityStepper } from '@/pages/inventory/components/quantity-stepper';
import { UnitSelector } from '@/pages/inventory/components/unit-selector';
import type { FoodCategory, QuantityUnit, CreateShoppingListItemInput } from '@/api/types';

export interface ShoppingFormRef {
  submit: () => void;
}

export interface ShoppingFormValues {
  name: string;
  category: FoodCategory;
  quantity: number;
  unit: QuantityUnit;
  notes: string;
}

interface ShoppingFormProps {
  initialValues?: Partial<ShoppingFormValues>;
  onSubmit: (values: CreateShoppingListItemInput) => void;
  isLoading?: boolean;
  className?: string;
}

const defaultValues: ShoppingFormValues = {
  name: '',
  category: 'Other',
  quantity: 1,
  unit: 'pieces',
  notes: '',
};

const ShoppingForm = React.forwardRef<ShoppingFormRef, ShoppingFormProps>(
  ({ initialValues, onSubmit, className, isLoading }, ref) => {
    const [form] = Form.useForm();

    const [values, setValues] = React.useState<ShoppingFormValues>(() => {
      if (initialValues) {
        return {
          name: initialValues.name || '',
          category: initialValues.category || 'Other',
          quantity: initialValues.quantity || 1,
          unit: initialValues.unit || 'pieces',
          notes: initialValues.notes || '',
        };
      }
      return defaultValues;
    });

    const handleSubmit = () => {
      if (!values.name.trim()) return;

      const input: CreateShoppingListItemInput = {
        name: values.name.trim(),
        category: values.category,
        quantity: values.quantity,
        unit: values.unit,
        notes: values.notes.trim() || undefined,
      };

      onSubmit(input);
    };

    React.useImperativeHandle(ref, () => ({
      submit: handleSubmit,
    }));

    const updateValue = <K extends keyof ShoppingFormValues>(key: K, value: ShoppingFormValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
    };

    return (
      <div className={cn('flex flex-col gap-6', className)}>
        <Form form={form} layout="vertical" disabled={isLoading}>
          {/* Item Name */}
          <Form.Item label="Tên món" required>
            <Input
              placeholder="ví dụ: Chuối, Sữa, Trứng"
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

          {/* Notes */}
          <Form.Item label="Ghi chú (tùy chọn)">
            <TextArea
              placeholder="Yêu thích thương hiệu, kích thước cụ thể, v.v."
              value={values.notes}
              onChange={(val) => updateValue('notes', val)}
              rows={2}
              maxLength={200}
              showCount
              className="rounded-xl!"
            />
          </Form.Item>
        </Form>
      </div>
    );
  },
);
ShoppingForm.displayName = 'ShoppingForm';

export { ShoppingForm };
