import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { DesignSystemStory, StorySection } from './DesignSystemStory';

const meta = {
  title: 'Design System/Forms',
  parameters: {
    docs: {
      description: {
        component: 'Input and select styles used by app forms.',
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <DesignSystemStory>
      <StorySection title={'Forms'}>
        <div className={'field field-compact'}>
          <label htmlFor={'storybook-input'}>Field label</label>
          <div className={'small-text'}>Helper text explains the expected input.</div>
          <input id={'storybook-input'} className={'input'} placeholder={'Input text'} />
        </div>
        <div className={'field field-compact'}>
          <label htmlFor={'storybook-select'}>Select label</label>
          <select id={'storybook-select'} className={'select'} defaultValue={'one'}>
            <option value={'one'}>One option</option>
            <option value={'two'}>Another option</option>
          </select>
        </div>
      </StorySection>
    </DesignSystemStory>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const input = canvas.getByLabelText('Field label');
    await userEvent.type(input, 'Shopping note');
    await expect(input).toHaveValue('Shopping note');

    const select = canvas.getByLabelText('Select label');
    await userEvent.selectOptions(select, 'two');
    await expect(select).toHaveValue('two');
  },
};
