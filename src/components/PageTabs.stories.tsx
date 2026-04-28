import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
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

const playPageTabs: Story['play'] = async ({ args, canvasElement }) => {
  const canvas = within(canvasElement);

  await expect(canvas.getByText(`Current page: ${args.page}`)).toBeVisible();

  if (args.hasItems) {
    await userEvent.click(canvas.getByRole('button', { name: /route/i }));
    await expect(canvas.getByText('Current page: route')).toBeVisible();
  } else {
    await expect(canvas.getByRole('button', { name: /route/i })).toHaveAttribute('aria-disabled', 'true');
  }

  await userEvent.click(canvas.getByRole('button', { name: /settings/i }));
  await expect(canvas.getByText('Current page: settings')).toBeVisible();
};

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
  play: playPageTabs,
};

export const RouteActive: Story = {
  args: {
    page: 'route',
    hasItems: true,
    onChange: () => undefined,
  },
  render: EditActive.render,
  play: playPageTabs,
};

export const RouteDisabled: Story = {
  args: {
    page: 'edit',
    hasItems: false,
    onChange: () => undefined,
  },
  render: EditActive.render,
  play: playPageTabs,
};
