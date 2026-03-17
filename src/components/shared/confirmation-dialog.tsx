/* eslint-disable react-refresh/only-export-components */
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
  title = 'Xác nhận xóa',
  message = 'Bạn có chắc muốn xóa món này? Hành động này không thể hoàn tác.',
  confirmText = 'Xóa',
  cancelText = 'Hủy',
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
          <span>Xóa món</span>
        </div>
      ),
      content: `Bạn có chắc muốn xóa "${itemName}"? Hành động này không thể hoàn tác.`,
      confirmText: 'Xóa',
      cancelText: 'Hủy',
      onConfirm: () => resolve(true),
      onCancel: () => resolve(false),
    });
  });
}

export { ConfirmationDialog };
