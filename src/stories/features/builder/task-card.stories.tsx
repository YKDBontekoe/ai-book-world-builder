import type { Meta, StoryObj } from "@storybook/react";
import { TaskCard } from "@/components/builder/task-card";

const meta: Meta<typeof TaskCard> = {
  title: "Builder/TaskCard",
  component: TaskCard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof TaskCard>;

export const Issue: Story = {
  args: {
    item: {
      type: "issue",
      data: {
        number: 123,
        title: "Fix the broken button alignment in the header",
        user: { login: "jules-agent", avatar_url: "https://github.com/shadcn.png" },
        created_at: "2023-10-25T12:00:00Z",
        updated_at: "2023-10-25T12:00:00Z",
        state: "open",
        html_url: "#",
        body: "Description",
        labels: [],
        comments: 0,
        node_id: "1",
        locked: false,
        author_association: "CONTRIBUTOR",
      } as any,
    },
    onSelect: () => {},
    onFix: () => console.log("Fix clicked"),
  },
};
