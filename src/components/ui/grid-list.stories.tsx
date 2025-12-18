import type { Meta, StoryObj } from "@storybook/react";
import { GridList } from "./grid-list";
import { Card, CardContent } from "./card";

const meta: Meta<typeof GridList> = {
  title: "UI/GridList",
  component: GridList,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof GridList>;

export const Default: Story = {
  render: (args) => (
    <GridList {...args}>
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="font-medium">Item {i + 1}</div>
            <div className="text-sm text-muted-foreground">
              Description for item {i + 1}
            </div>
          </CardContent>
        </Card>
      ))}
    </GridList>
  ),
};

export const Responsive: Story = {
  args: {
    columns: { mobile: 1, sm: 2, lg: 3, xl: 4 },
    gap: 6,
  },
  render: (args) => (
    <GridList {...args}>
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="font-medium">Item {i + 1}</div>
          </CardContent>
        </Card>
      ))}
    </GridList>
  ),
};
