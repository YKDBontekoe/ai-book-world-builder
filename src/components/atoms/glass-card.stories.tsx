import type { Meta, StoryObj } from '@storybook/react';
import { GlassCard } from '@/components/molecules/glass-card';

const meta = {
  title: 'UI/GlassCard',
  component: GlassCard,
  parameters: {
    layout: 'centered',
    backgrounds: {
        default: 'dark',
    }
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'interactive', 'subtle', 'liquid'],
    },
    size: {
        control: 'select',
        options: ['default', 'none', 'sm', 'lg']
    }
  },
} satisfies Meta<typeof GlassCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
        <div className="space-y-2">
            <h3 className="font-semibold text-lg">Glass Card</h3>
            <p className="text-sm text-white/60">This is a glass card component.</p>
        </div>
    ),
    className: "w-[300px]",
  },
};

export const Interactive: Story = {
  args: {
    interactive: true,
    children: (
        <div className="space-y-2">
            <h3 className="font-semibold text-lg">Interactive Card</h3>
            <p className="text-sm text-white/60">Hover me to see the effect.</p>
        </div>
    ),
    className: "w-[300px]",
  },
};

export const Liquid: Story = {
  args: {
    variant: 'liquid',
    children: (
        <div className="space-y-2">
            <h3 className="font-semibold text-lg">Liquid Card</h3>
            <p className="text-sm text-white/60">Advanced glass morphism.</p>
        </div>
    ),
    className: "w-[300px]",
  },
};
