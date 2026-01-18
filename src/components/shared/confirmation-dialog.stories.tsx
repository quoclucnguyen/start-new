import type { Meta, StoryObj } from '@storybook/react';
import { confirmDelete } from './confirmation-dialog';
import { Button } from '@/components/ui/button';

const meta = {
  title: 'Shared/ConfirmationDialog',
  parameters: {
    layout: 'centered',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const DeleteConfirmation: Story = {
  render: () => {
    const handleDelete = async () => {
      const confirmed = await confirmDelete('Fresh Milk');
      console.log('confirmResult', confirmed);
    };
    
    return (
      <Button variant="destructive" onClick={handleDelete}>
        Delete Item
      </Button>
    );
  },
};
