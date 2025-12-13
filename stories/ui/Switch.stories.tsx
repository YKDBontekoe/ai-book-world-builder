import type { Meta, StoryObj } from '@storybook/react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const meta = {
  title: 'UI/Switch',
  component: Switch,
  tags: ['autodocs'],
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        id: 'airplane-mode',
    },
    render: (args) => (
        <div className="flex items-center space-x-2">
            <Switch {...args} />
            <Label htmlFor="airplane-mode">Airplane Mode</Label>
        </div>
    )
};
