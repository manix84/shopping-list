import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import { StoryCanvas } from '../components/storyFixtures';
import { ErrorPage } from './ErrorPage';

const meta = {
  title: 'Pages/ErrorPage',
  component: ErrorPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    isDebugMode: true,
    onBackToEdit: fn(),
    onOpenDebug: fn(),
  },
} satisfies Meta<typeof ErrorPage>;

export default meta;

type Story = StoryObj<typeof meta>;

const playErrorPage: Story['play'] = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  await expect(canvas.getByRole('heading')).toBeVisible();
  await expect(canvas.getByRole('button', { name: /back to edit/i })).toBeVisible();
  await expect(canvas.getByRole('button', { name: /debug tools/i })).toBeVisible();
};

export const NotFound: Story = {
  args: {
    variant: 'not-found',
  },
  render: (args) => (
    <StoryCanvas>
      <ErrorPage {...args} />
    </StoryCanvas>
  ),
  play: playErrorPage,
};

export const ServerError: Story = {
  args: {
    variant: 'server-error',
  },
  render: NotFound.render,
  play: playErrorPage,
};
