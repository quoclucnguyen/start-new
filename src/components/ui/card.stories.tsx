import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';
import { Button } from './button';

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-[350px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content area. You can put any content here.</p>
      </CardContent>
      <CardFooter>
        <Button>Action</Button>
      </CardFooter>
    </Card>
  ),
};

export const Simple: Story = {
  render: () => (
    <Card className="p-4">
      <p>Simple card with just content</p>
    </Card>
  ),
};

export const WithBorderAccent: Story = {
  render: () => (
    <Card className="border-l-4 border-l-red-500">
      <CardHeader>
        <CardTitle>Expiring Soon</CardTitle>
        <CardDescription>This item needs attention</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-red-500 text-sm font-semibold">Expires in 1 day</p>
      </CardContent>
    </Card>
  ),
};

export const AlertCard: Story = {
  render: () => (
    <Card className="border-primary/30 relative overflow-hidden">
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
      <CardHeader>
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
            💡
          </div>
          <div>
            <CardTitle>Restock Alert</CardTitle>
            <CardDescription>Milk and Eggs expired yesterday. Add to list?</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardFooter>
        <Button className="w-full">Add All to List</Button>
      </CardFooter>
    </Card>
  ),
};

export const ImageCard: Story = {
  render: () => (
    <Card className="overflow-hidden">
      <div 
        className="h-40 w-full bg-cover bg-center"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400)' }}
      />
      <CardHeader>
        <CardTitle>Creamy Spinach Pasta</CardTitle>
        <CardDescription>15 min • Easy</CardDescription>
      </CardHeader>
    </Card>
  ),
};
