import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import type { BackendStatus, PageKey } from '../types';
import { AppHeader } from './AppHeader';
import { connectedBackend, offlineBackend, StoryCanvas } from './storyFixtures';

const meta = {
  title: 'Components/AppHeader',
  tags: ['autodocs'],
  component: AppHeader,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    page: {
      control: 'select',
      options: ['edit', 'route', 'sections', 'settings', 'about', 'debug'],
    },
    hasItems: { control: 'boolean' },
    resolvedTheme: {
      control: 'radio',
      options: ['light', 'dark'],
    },
  },
} satisfies Meta<typeof AppHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

function AppHeaderExample({
  page: initialPage,
  hasItems,
  backendStatus,
  resolvedTheme,
}: {
  page: PageKey;
  hasItems: boolean;
  backendStatus: BackendStatus;
  resolvedTheme: 'light' | 'dark';
}) {
  const [page, setPage] = useState<PageKey>(initialPage);

  return (
    <StoryCanvas>
      <AppHeader
        page={page}
        hasItems={hasItems}
        backendStatus={backendStatus}
        resolvedTheme={resolvedTheme}
        onChangePage={setPage}
      />
    </StoryCanvas>
  );
}

export const Connected: Story = {
  args: {
    page: 'edit',
    hasItems: true,
    backendStatus: connectedBackend,
    resolvedTheme: 'light',
    onChangePage: () => undefined,
  },
  render: (args) => (
    <AppHeaderExample
      page={args.page}
      hasItems={args.hasItems}
      backendStatus={args.backendStatus}
      resolvedTheme={args.resolvedTheme}
    />
  ),
};

export const Offline: Story = {
  args: {
    page: 'settings',
    hasItems: false,
    backendStatus: offlineBackend,
    resolvedTheme: 'light',
    onChangePage: () => undefined,
  },
  render: Connected.render,
};
