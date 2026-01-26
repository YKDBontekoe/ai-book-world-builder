import type { Meta, StoryObj } from "@storybook/react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "./sheet";
import { Button } from "./button";

const meta = {
  title: "Atoms/Sheet",
  component: Sheet,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {},
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open Sheet</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription>
            Make changes to your profile here. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="name" className="text-right">Name</label>
            <input id="name" value="Pedro Duarte" className="col-span-3 border p-1 rounded" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="username" className="text-right">Username</label>
            <input id="username" value="@peduarte" className="col-span-3 border p-1 rounded" />
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="submit">Save changes</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const SideTop: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Top Sheet</Button>
      </SheetTrigger>
      <SheetContent side="top">
        <SheetHeader>
          <SheetTitle>Top Sheet</SheetTitle>
          <SheetDescription>
             This sheet comes from the top.
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  ),
};
