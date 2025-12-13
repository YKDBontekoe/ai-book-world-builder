import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const meta = {
  title: 'UI/Card',
  component: Card,
  tags: ['autodocs'],
  argTypes: {
    variant: {
        control: 'select',
        options: ['default', 'interactive', 'glass']
    }
  }
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Card {...args} className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description goes here.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This is the main content of the card.</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button>Action</Button>
      </CardFooter>
    </Card>
  ),
};

export const Glass: Story = {
    args: {
        variant: 'glass'
    },
    render: (args) => (
      <Card {...args} className="w-[350px]">
        <CardHeader>
          <CardTitle>Glass Card</CardTitle>
          <CardDescription>Translucent card for overlays.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Content visible through glass effect.</p>
        </CardContent>
        <CardFooter>
          <Button variant="glass">Glass Button</Button>
        </CardFooter>
      </Card>
    ),
    parameters: {
        backgrounds: { default: 'dark' }
    }
  };
