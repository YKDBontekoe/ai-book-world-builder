import type { Meta, StoryObj } from '@storybook/react';
import { GlassCard } from '@/components/ui/glass-card';

const meta = {
  title: 'UI/GlassCard',
  component: GlassCard,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'success', 'warning', 'error', 'info', 'ghost', 'liquid'],
    },
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
    },
    rounded: {
      control: 'select',
      options: ['md', 'lg', 'xl', '2xl', '3xl'],
    },
    interactive: {
        control: 'boolean',
    }
  },
} satisfies Meta<typeof GlassCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: <div className="text-center">Glass Card Content</div>,
    className: 'w-[300px] h-[150px] flex items-center justify-center',
  },
  parameters: {
    backgrounds: { default: 'dark' },
  }
};

export const Liquid: Story = {
    args: {
        variant: 'liquid',
        children: <div className="text-center">Liquid Glass</div>,
        className: 'w-[300px] h-[150px] flex items-center justify-center',
    },
    parameters: {
        backgrounds: { default: 'dark' },
    }
  };

export const Success: Story = {
    args: {
        variant: 'success',
        children: 'Success State',
        className: 'w-[300px] p-4',
    }
};

export const Warning: Story = {
    args: {
        variant: 'warning',
        children: 'Warning State',
        className: 'w-[300px] p-4',
    }
};

export const Error: Story = {
    args: {
        variant: 'error',
        children: 'Error State',
        className: 'w-[300px] p-4',
    }
};
