import type { Meta, StoryObj } from '@storybook/react';
import { AppShell } from './app-shell';

const meta: Meta<typeof AppShell> = {
  title: 'Layout/AppShell',
  component: AppShell,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">App content goes here</p>
      </div>
    ),
  },
};

export const WithContent: Story = {
  render: () => (
    <AppShell>
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b p-4">
        <h1 className="text-xl font-bold">My Kitchen</h1>
      </header>
      <main className="flex-1 p-4">
        <p>Main content area</p>
      </main>
      <nav className="sticky bottom-0 border-t bg-background p-4">
        <p className="text-center text-sm text-muted-foreground">Bottom Navigation</p>
      </nav>
    </AppShell>
  ),
};

export const MobilePreview: Story = {
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-md border shadow-2xl h-[844px] overflow-hidden rounded-3xl">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <AppShell>
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b p-4">
        <h1 className="text-xl font-bold">My Kitchen</h1>
      </header>
      <main className="flex-1 p-4 pb-20">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-card border" />
          ))}
        </div>
      </main>
      <nav className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur-sm p-4">
        <div className="flex justify-around">
          <span>🏠</span>
          <span>📋</span>
          <span>🍳</span>
          <span>⚙️</span>
        </div>
      </nav>
    </AppShell>
  ),
};
