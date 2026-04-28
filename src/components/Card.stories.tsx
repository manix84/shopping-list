import type { Meta, StoryObj } from '@storybook/react-vite';
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
};

export const BodyOnly: Story = {
  args: {
    ...WithHeader.args,
    showHeader: false,
  },
  render: WithHeader.render,
};
