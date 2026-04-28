import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Badge } from './Badge';
import { Card } from './Card';
import { StoryCanvas } from './storyFixtures';

type CardStoryArgs = {
  heading: string;
  subtitle: string;
  body: string;
  showHeader: boolean;
  bodyClassName: string;
};

const meta = {
  title: 'Components/Card',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    heading: { control: 'text' },
    subtitle: { control: 'text' },
    body: { control: 'text' },
    showHeader: { control: 'boolean' },
    bodyClassName: { control: 'text' },
  },
} satisfies Meta<CardStoryArgs>;

export default meta;

type Story = StoryObj<CardStoryArgs>;

const playCard: Story['play'] = async ({ args, canvasElement }) => {
  const canvas = within(canvasElement);

  await expect(canvas.getByText(args.body)).toBeVisible();
  await expect(canvas.getByText('Default badge')).toBeVisible();
  await expect(canvas.getByText('Ready')).toBeVisible();

  if (args.showHeader) {
    await expect(canvas.getByRole('heading', { name: args.heading })).toBeVisible();
    await expect(canvas.getByText(args.subtitle)).toBeVisible();
  }
};

function CardExample({ heading, subtitle, body, showHeader, bodyClassName }: CardStoryArgs) {
  return (
    <StoryCanvas>
      <Card
        header={
          showHeader ? (
            <>
              <h2 className="title title-md">{heading}</h2>
              <p className="subtitle">{subtitle}</p>
            </>
          ) : undefined
        }
        bodyClassName={bodyClassName}
      >
        <p>{body}</p>
        <div className="badge-row">
          <Badge>Default badge</Badge>
          <Badge tone="success">Ready</Badge>
        </div>
      </Card>
    </StoryCanvas>
  );
}

export const WithHeader: Story = {
  args: {
    heading: 'Card',
    subtitle: 'Standard panel structure with header and body spacing.',
    body: 'Cards frame self-contained surfaces such as settings, panels, and repeated item groups.',
    showHeader: true,
    bodyClassName: 'stack',
  },
  render: (args) => <CardExample {...args} />,
  play: playCard,
};

export const BodyOnly: Story = {
  args: {
    ...WithHeader.args,
    showHeader: false,
  },
  render: WithHeader.render,
  play: playCard,
};
