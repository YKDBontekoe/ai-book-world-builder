import type { Meta, StoryObj } from "@storybook/react";
import { FolderOpen } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { EmptyState } from "@/components/molecules/empty-state";

const meta: Meta<typeof EmptyState> = {
  title: "UI/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  args: {
    title: "No projects found",
    description: "You haven't created any projects yet. Start by creating a new one.",
    icon: FolderOpen,
  },
};

export const WithAction: Story = {
  args: {
    title: "No projects found",
    description: "You haven't created any projects yet. Start by creating a new one.",
    icon: FolderOpen,
    action: <Button>Create Project</Button>,
  },
};

export const WithSuggestions: Story = {
  args: {
    title: "No search results",
    description: "Try adjusting your search query.",
    icon: FolderOpen,
    suggestions: ["Fantasy", "Sci-Fi", "Mystery"],
  },
};
