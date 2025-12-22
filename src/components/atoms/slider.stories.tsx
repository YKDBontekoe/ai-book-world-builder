import type { Meta, StoryObj } from '@storybook/react';
import { Slider } from '@/components/atoms/slider';

const meta = {
  title: 'UI/Slider',
  component: Slider,
  tags: ['autodocs'],
  args: {
      defaultValue: [50],
      max: 100,
      step: 1,
      className: 'w-[60%]'
  }
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Range: Story = {
    args: {
        defaultValue: [25, 75],
    }
};
