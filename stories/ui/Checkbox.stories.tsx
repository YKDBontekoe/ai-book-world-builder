import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const meta = {
  title: 'UI/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        id: 'terms',
    },
    render: (args) => (
        <div className="flex items-center space-x-2">
            <Checkbox {...args} />
            <Label htmlFor="terms">Accept terms and conditions</Label>
        </div>
    )
};

export const Disabled: Story = {
    args: {
        disabled: true,
        checked: true
    },
    render: (args) => (
        <div className="flex items-center space-x-2">
            <Checkbox {...args} />
            <Label className="text-muted-foreground">Disabled</Label>
        </div>
    )
}
