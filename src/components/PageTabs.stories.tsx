import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import type { PageKey } from '../types';
import { Card } from './Card';
import { PageTabs } from './PageTabs';
import { StoryCanvas } from './storyFixtures';

const meta = {
  title: 'Components/PageTabs',
  tags: ['autodocs'],
  component: PageTabs,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    page: {
      control: 'select',
      options: ['edit', 'route', 'settings', 'about'],
    },
    hasItems: { control: 'boolean' },
  },
} satisfies Meta<typeof PageTabs>;

export default meta;

type Story = StoryObj<typeof meta>;

function PageTabsExample({ page: initialPage, hasItems }: { page: PageKey; hasItems: boolean }) {
  const [page, setPage] = useState<PageKey>(initialPage);

  return (
    <StoryCanvas>
      <Card bodyClassName="stack">
        <PageTabs page={page} hasItems={hasItems} onChange={setPage} />
        <div className="small-text">Current page: {page}</div>
      </Card>
    </StoryCanvas>
  );
}

export const EditActive: Story = {
  args: {
    page: 'edit',
    hasItems: true,
    onChange: () => undefined,
  },
  render: (args) => <PageTabsExample page={args.page} hasItems={args.hasItems} />,
};

export const RouteActive: Story = {
  args: {
    page: 'route',
    hasItems: true,
    onChange: () => undefined,
  },
  render: EditActive.render,
};

export const RouteDisabled: Story = {
  args: {
    page: 'edit',
    hasItems: false,
    onChange: () => undefined,
  },
  render: EditActive.render,
};
