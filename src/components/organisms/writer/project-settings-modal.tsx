"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/atoms/dialog";
import { Button } from "@/components/atoms/button";
import { Settings } from "lucide-react";
import { Project } from "@/lib/db/schema";
import { useState } from "react";

interface ProjectSettingsModalProps {
  project: Project;
}

export function ProjectSettingsModal({ project }: ProjectSettingsModalProps) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Settings className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Project Settings</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <p className="text-sm text-muted-foreground">
                        Project ID: {project.id}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Dashboard replacement placeholder.
                    </p>
                    {/* Add more settings here */}
                </div>
            </DialogContent>
        </Dialog>
    );
}
