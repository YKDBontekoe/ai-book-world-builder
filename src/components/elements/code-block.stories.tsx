import type { Meta, StoryObj } from "@storybook/react";
import { CodeBlock, CodeBlockCopyButton } from "./code-block";

const meta: Meta<typeof CodeBlock> = {
  title: "Elements/CodeBlock",
  component: CodeBlock,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof CodeBlock>;

const sampleCode = `import * as React from "react"

export function Button() {
  return <button>Click me</button>
}`;

export const Default: Story = {
  args: {
    code: sampleCode,
    language: "tsx",
  },
};

export const WithLineNumbers: Story = {
  args: {
    code: sampleCode,
    language: "tsx",
    showLineNumbers: true,
  },
};

export const WithCopyButton: Story = {
  render: (args) => (
    <CodeBlock {...args}>
      <CodeBlockCopyButton />
    </CodeBlock>
  ),
  args: {
    code: sampleCode,
    language: "tsx",
  },
};

export const Python: Story = {
  args: {
    language: "python",
    code: `def fib(n):
    if n <= 1:
        return n
    return fib(n-1) + fib(n-2)

print(fib(10))`,
  },
};
