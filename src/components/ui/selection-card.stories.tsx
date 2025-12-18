import type { Meta, StoryObj } from "@storybook/react";
import { Trash2, User } from "lucide-react";
import { IconButton } from "./icon-button";
import { SelectionCard } from "./selection-card";
import { TooltipProvider } from "./tooltip";

const meta: Meta<typeof SelectionCard> = {
  title: "UI/SelectionCard",
  component: SelectionCard,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <TooltipProvider>
        <div className="w-[350px]">
          <Story />
        </div>
      </TooltipProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SelectionCard>;

export const Default: Story = {
  args: {
    title: "Personal Plan",
    description: "Perfect for hobbyists and students.",
    pricing: "$10/month",
  },
};

export const Selected: Story = {
  args: {
    title: "Pro Plan",
    description: "For serious creators.",
    pricing: "$20/month",
    selected: true,
    recommended: true,
  },
};

export const WithIcon: Story = {
  args: {
    title: "John Doe",
    description: "john@example.com",
    icon: (
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
        <User className="h-5 w-5 text-muted-foreground" />
      </div>
    ),
  },
};

export const WithAction: Story = {
  args: {
    title: "Project Alpha",
    description: "Last edited 2 days ago",
    action: (
      <IconButton
        icon={Trash2}
        size="xs"
        className="text-muted-foreground hover:text-destructive"
        srLabel="Delete"
        tooltip="Delete project"
      />
    ),
  },
};
