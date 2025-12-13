import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const meta = {
  title: 'UI/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  args: {
      placeholder: 'Type your message here.'
  }
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLabel: Story = {
    render: (args) => (
        <div className="grid w-full gap-1.5">
            <Label htmlFor="message">Your Message</Label>
            <Textarea {...args} id="message" />
        </div>
    )
}

export const Disabled: Story = {
    args: {
        disabled: true,
        placeholder: 'Disabled textarea'
    }
}
