import type { Meta, StoryObj } from '@storybook/react';
import { ImagePickerPlaceholder } from './image-picker-placeholder';

const meta = {
  title: 'Food/ImagePickerPlaceholder',
  component: ImagePickerPlaceholder,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof ImagePickerPlaceholder>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    size: 'lg',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    size: 'md',
  },
};

export const WithImage: Story = {
  args: {
    size: 'lg',
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200',
  },
};
