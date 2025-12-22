import type { Meta, StoryObj } from "@storybook/react";
import { Sources, SourcesContent, SourcesTrigger, Source } from "@/components/molecules/source";

const meta: Meta<typeof Sources> = {
  title: "Elements/Sources",
  component: Sources,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof Sources>;

export const Default: Story = {
  render: () => (
    <Sources>
      <SourcesTrigger count={3} />
      <SourcesContent>
        <Source href="#" title="Wikipedia - Artificial Intelligence" />
        <Source href="#" title="MDN Web Docs" />
        <Source href="#" title="Stack Overflow Answer" />
      </SourcesContent>
    </Sources>
  ),
};
