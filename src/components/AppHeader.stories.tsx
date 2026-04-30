import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
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

const playAppHeader: Story['play'] = async ({ args, canvasElement }) => {
  const canvas = within(canvasElement);
  const usesMobileMenu = window.matchMedia('(max-width: 640px)').matches;
  const getVisibleSettingsButton = () => {
    const settingsButtons = canvas.getAllByRole('button', { name: /settings/i });
    const visibleSettingsButton = settingsButtons.find((button) => {
      const rect = button.getBoundingClientRect();

      return rect.width > 0 && rect.height > 0;
    });

    if (!visibleSettingsButton) {
      throw new Error('Expected a visible Settings button');
    }

    return visibleSettingsButton;
  };

  await expect(canvas.getByRole('heading', { name: /smart shopping list/i })).toBeVisible();
  const subtitle = canvas.getByText(/ordered route through the store/i);
  if (window.matchMedia('(max-width: 1080px)').matches) {
    await expect(subtitle).toBeInTheDocument();
  } else {
    await expect(subtitle).toBeVisible();
  }

  if (args.backendStatus.state === 'offline') {
    const statusButton = canvas.getByRole('button', { name: /offline/i });

    await userEvent.click(statusButton);
    await expect(canvas.getByRole('tooltip')).toBeVisible();
  } else {
    await expect(canvas.getByText(/online/i)).toBeInTheDocument();
  }

  if (usesMobileMenu) {
    await userEvent.click(canvas.getByRole('button', { name: /open navigation menu/i }));
  }

  let settingsButton = getVisibleSettingsButton();
  await userEvent.click(settingsButton);

  if (usesMobileMenu) {
    const menuButton = canvas.getByRole('button', { name: /open navigation menu/i });

    await waitFor(() => expect(menuButton).toHaveAttribute('aria-expanded', 'false'));
    await userEvent.click(menuButton);
    settingsButton = getVisibleSettingsButton();
  }

  await waitFor(() => expect(settingsButton).toHaveAttribute('aria-current', 'page'));
};

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
  play: playAppHeader,
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
  play: playAppHeader,
};
