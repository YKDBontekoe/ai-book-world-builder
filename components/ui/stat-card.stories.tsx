import type { Meta, StoryObj } from "@storybook/react";
import { Users } from "lucide-react";
import { StatCard } from "./stat-card";

const meta: Meta<typeof StatCard> = {
  title: "UI/StatCard",
  component: StatCard,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof StatCard>;

export const Default: Story = {
  args: {
    icon: <Users />,
    value: "1,234",
    label: "Total Users",
  },
};

export const Primary: Story = {
  args: {
    icon: <Users />,
    value: "5,678",
    label: "Active Users",
    variant: "primary",
    iconColor: "primary",
  },
};

export const ColoredIcon: Story = {
  args: {
    icon: <Users />,
    value: "98%",
    label: "Satisfaction",
    iconColor: "emerald",
  },
};
