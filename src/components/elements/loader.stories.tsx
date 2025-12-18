import type { Meta, StoryObj } from "@storybook/react";
import { Loader } from "./loader";

const meta: Meta<typeof Loader> = {
  title: "Elements/Loader",
  component: Loader,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof Loader>;

export const Default: Story = {
  args: {
    size: 24,
  },
};

export const Large: Story = {
  args: {
    size: 48,
  },
};

export const Colored: Story = {
  render: (args) => (
    <div className="text-blue-500">
      <Loader {...args} />
    </div>
  ),
  args: {
    size: 32,
  },
};
