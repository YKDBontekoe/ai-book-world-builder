import type { Meta, StoryObj } from "@storybook/react";
import { FileIcon } from "@/components/atoms/file-icon";

const meta: Meta<typeof FileIcon> = {
  title: "UI/FileIcon",
  component: FileIcon,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    size: {
      control: { type: "range", min: 16, max: 128 },
    },
  },
};

export default meta;
type Story = StoryObj<typeof FileIcon>;

export const Default: Story = {
  args: {
    size: 24,
  },
};

export const PDF: Story = {
  args: {
    extension: "pdf",
    size: 48,
  },
};

export const Image: Story = {
  args: {
    mimeType: "image/png",
    size: 48,
  },
};

export const Code: Story = {
  args: {
    extension: "tsx",
    size: 48,
  },
};
