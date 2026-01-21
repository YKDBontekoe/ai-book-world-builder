import type { Meta, StoryObj } from "@storybook/react";
import { WriterViewControls } from "@/features/writer/components/header/writer-view-controls";
import { TooltipProvider } from "@/components/atoms/tooltip";
import { useState } from "react";

const meta: Meta<typeof WriterViewControls> = {
  title: "Features/Writer/Header/WriterViewControls",
  component: WriterViewControls,
  decorators: [
    (Story) => (
      <TooltipProvider>
        <div className="p-10 flex justify-center bg-gray-50 dark:bg-zinc-900">
          <Story />
        </div>
      </TooltipProvider>
    ),
  ],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof WriterViewControls>;

const ControlsWrapper = (args: any) => {
  const [director, setDirector] = useState(args.isDirectorMode);
  const [typewriter, setTypewriter] = useState(args.isTypewriterMode);
  const [zen, setZen] = useState(args.isZenMode);

  return (
    <WriterViewControls
      {...args}
      isDirectorMode={director}
      toggleDirectorMode={() => setDirector(!director)}
      isTypewriterMode={typewriter}
      toggleTypewriterMode={() => setTypewriter(!typewriter)}
      isZenMode={zen}
      toggleZenMode={() => setZen(!zen)}
    />
  );
};

export const Default: Story = {
  render: (args) => <ControlsWrapper {...args} />,
  args: {
    isDirectorMode: false,
    isTypewriterMode: false,
    isZenMode: false,
  },
};

export const DirectorActive: Story = {
  render: (args) => <ControlsWrapper {...args} />,
  args: {
    isDirectorMode: true,
    isTypewriterMode: false,
    isZenMode: false,
  },
};

export const TypewriterActive: Story = {
  render: (args) => <ControlsWrapper {...args} />,
  args: {
    isDirectorMode: false,
    isTypewriterMode: true,
    isZenMode: false,
  },
};

export const ZenActive: Story = {
  render: (args) => <ControlsWrapper {...args} />,
  args: {
    isDirectorMode: false,
    isTypewriterMode: false,
    isZenMode: true,
  },
};
