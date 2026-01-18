import * as React from 'react';
import { Dialog } from 'antd-mobile';
import { AlertTriangle } from 'lucide-react';

interface ConfirmationDialogProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  confirmDestructive?: boolean;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  visible,
  onConfirm,
  onCancel,
  title = 'Confirm Delete',
  message = 'Are you sure you want to delete this item? This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  confirmDestructive = true,
}) => {
  React.useEffect(() => {
    if (visible) {
      Dialog.confirm({
        title: (
          <div className="flex items-center gap-2 text-foreground">
            {confirmDestructive && <AlertTriangle className="size-5 text-destructive" />}
            {title}
          </div>
        ),
        content: message,
        confirmText,
        cancelText,
        onConfirm,
        onCancel,
      });
    }
  }, [visible, title, message, confirmText, cancelText, confirmDestructive, onConfirm, onCancel]);

  return null;
};

// Imperative API for confirmation dialog
export async function confirmDelete(
  itemName: string
): Promise<boolean> {
  return new Promise((resolve) => {
    Dialog.confirm({
      title: (
        <div className="flex items-center gap-2">
          <AlertTriangle className="size-5 text-destructive" />
          <span>Delete Item</span>
        </div>
      ),
      content: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: () => resolve(true),
      onCancel: () => resolve(false),
    });
  });
}

export { ConfirmationDialog };
