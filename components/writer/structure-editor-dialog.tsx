"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { saveProjectStructure } from "@/app/(chat)/projects/[id]/generate/actions";
import { Loader2, Edit } from "lucide-react";
import { toast } from "sonner";
import { Project } from "@/lib/db/schema";

interface StructureEditorDialogProps {
  project: Project;
  initialStructureText: string;
  onStructureUpdate: () => void;
}

export function StructureEditorDialog({
  project,
  initialStructureText,
  onStructureUpdate,
}: StructureEditorDialogProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(initialStructureText);
  const [isSaving, setIsSaving] = useState(false);

  // Update text when initialStructureText changes (e.g. re-fetched)
  useEffect(() => {
    if (open) {
      setText(initialStructureText);
    }
  }, [initialStructureText, open]);

  const handleSave = async () => {
    setIsSaving(true);
    const result = await saveProjectStructure(project.id, text);
    setIsSaving(false);

    if (result.success) {
      toast.success("Structure updated successfully");
      setOpen(false);
      onStructureUpdate();
    } else {
      toast.error("Failed to update structure");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full justify-start mt-2">
          <Edit className="mr-2 h-4 w-4" />
          Edit Structure
        </Button>
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
            className="h-full resize-none font-mono text-sm"
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
