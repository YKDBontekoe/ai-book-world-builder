"use client";

import { BookOpen, Download, FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type ExportBookDialogProps = {
  projectId: string;
  projectName: string;
};

export function ExportBookDialog({
  projectId,
  projectName,
}: ExportBookDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState<"pdf" | "epub" | null>(null);

  const handleExport = async (format: "pdf" | "epub") => {
    setIsExporting(format);

    try {
      const response = await fetch(`/api/projects/${projectId}/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Export failed");
      }

      const data = await response.json();

      // Trigger download
      const link = document.createElement("a");
      link.href = data.url;
      link.download = data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`${format.toUpperCase()} exported successfully!`);
      setIsOpen(false);
    } catch (error) {
      console.error("Export error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to export book"
      );
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Download className="mr-2 size-4" />
          Export Book
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Book</DialogTitle>
          <DialogDescription>
            Export &quot;{projectName}&quot; as PDF or EPUB. The file will be
            saved to your account and downloaded automatically.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button
            className="flex h-20 flex-col items-center justify-center gap-2"
            disabled={isExporting !== null}
            onClick={() => handleExport("pdf")}
            variant="outline"
          >
            {isExporting === "pdf" ? (
              <Loader2 className="size-8 animate-spin" />
            ) : (
              <FileText className="size-8" />
            )}
            <span className="font-semibold">Export as PDF</span>
          </Button>
          <Button
            className="flex h-20 flex-col items-center justify-center gap-2"
            disabled={isExporting !== null}
            onClick={() => handleExport("epub")}
            variant="outline"
          >
            {isExporting === "epub" ? (
              <Loader2 className="size-8 animate-spin" />
            ) : (
              <BookOpen className="size-8" />
            )}
            <span className="font-semibold">Export as EPUB</span>
          </Button>
        </div>
        <p className="text-center text-muted-foreground text-xs">
          Exports include all completed chapter drafts.
        </p>
      </DialogContent>
    </Dialog>
  );
}
