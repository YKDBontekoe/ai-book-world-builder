"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/atoms/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/atoms/dialog";
import { Textarea } from "@/components/atoms/textarea";
import { saveProjectStructure } from "@/app/actions/writer";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface StructureEditorDialogProps {
  projectId: string;
  currentStructure: string;
  onSave: () => void;
  children: React.ReactNode;
}

export function StructureEditorDialog({
  projectId,
  currentStructure,
  onSave,
  children
}: StructureEditorDialogProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(currentStructure);
  const [isSaving, setIsSaving] = useState(false);

  // Update text when currentStructure changes
  useEffect(() => {
    if (open) {
      setText(currentStructure);
    }
  }, [currentStructure, open]);

  const handleSave = async () => {
    setIsSaving(true);
    const result = await saveProjectStructure(projectId, text);
    setIsSaving(false);

    if (result.success) {
      toast.success("Structure updated successfully");
      setOpen(false);
      onSave();
    } else {
      toast.error("Failed to update structure");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Book Structure</DialogTitle>
          <DialogDescription>
            Edit your chapters and scenes using the text area below.
            <br />
            Format: `Chapter X: Title` for chapters, `- Scene: Title` for scenes.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 py-4">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.preventDefault();
                handleSave();
              }
            }}
            className="h-full resize-none font-mono text-sm glass-input"
            placeholder={`Chapter 1: The Beginning
- Scene: Waking up
- Scene: The Call

Chapter 2: The Journey
- Scene: Departure`}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
