"use client";

import { useEffect, useState } from "react";
import { EditorView } from "prosemirror-view";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Sparkles, Wand2, Check } from "lucide-react";
import { rewriteSelection } from "@/lib/ai/writer";
import { toast } from "sonner";
import { createPortal } from "react-dom";

interface EditorBubbleMenuProps {
  editorView: EditorView | null;
}

export function EditorBubbleMenu({ editorView }: EditorBubbleMenuProps) {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(
    null
  );
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rewrittenText, setRewrittenText] = useState<string | null>(null);

  useEffect(() => {
    if (!editorView) return;

    const updateMenu = () => {
      const { state } = editorView;
      const { from, to, empty } = state.selection;

      if (empty || loading) {
        setPosition(null);
        setIsOpen(false);
        return;
      }

      const start = editorView.coordsAtPos(from);
      const end = editorView.coordsAtPos(to);
      const box = editorView.dom.getBoundingClientRect();

      setPosition({
        top: start.top - box.top - 40, // Position above selection
        left: start.left - box.left,
      });
      setIsOpen(true);
    };

    editorView.dom.addEventListener("mouseup", updateMenu);
    editorView.dom.addEventListener("keyup", updateMenu);
    editorView.dom.addEventListener("scroll", updateMenu); // Handle scroll too

    return () => {
      editorView.dom.removeEventListener("mouseup", updateMenu);
      editorView.dom.removeEventListener("keyup", updateMenu);
      editorView.dom.removeEventListener("scroll", updateMenu);
    };
  }, [editorView, loading]);

  const handleRewrite = async (style: string) => {
    if (!editorView) return;
    setLoading(true);
    const { from, to } = editorView.state.selection;
    const text = editorView.state.doc.textBetween(from, to);

    const result = await rewriteSelection(text, `Rewrite this to be more ${style}`);

    setLoading(false);
    if (result.text) {
      setRewrittenText(result.text);
    } else {
      toast.error("Rewrite failed");
    }
  };

  const applyRewrite = () => {
    if (!editorView || !rewrittenText) return;
    const { from, to } = editorView.state.selection;

    editorView.dispatch(
      editorView.state.tr.replaceWith(
        from,
        to,
        editorView.state.schema.text(rewrittenText)
      )
    );
    setRewrittenText(null);
    setIsOpen(false);
  };

  if (!position || !editorView) return null;

  // We portal this because the editor has overflow:hidden usually
  // But for simplicity in this specific layout, absolute positioning might work if parent is relative
  // Let's try absolute first.

  return (
    <div
      className="absolute z-50 flex items-center gap-1 rounded-md border bg-background p-1 shadow-md animate-in fade-in zoom-in-95 duration-100"
      style={{ top: position.top, left: position.left }}
    >
        {rewrittenText ? (
           <div className="flex items-center gap-2 p-1">
             <span className="text-xs max-w-[200px] truncate">{rewrittenText}</span>
             <Button size="icon" variant="ghost" className="h-6 w-6" onClick={applyRewrite}>
               <Check className="h-3 w-3 text-green-500" />
             </Button>
             <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setRewrittenText(null)}>
               <span className="text-xs">✕</span>
             </Button>
           </div>
        ) : (
          <>
            <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => handleRewrite("descriptive")}
                disabled={loading}
            >
                <Sparkles className="mr-1 h-3 w-3" />
                Describe
            </Button>
            <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => handleRewrite("concise")}
                disabled={loading}
            >
                <Wand2 className="mr-1 h-3 w-3" />
                Concise
            </Button>
             <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => handleRewrite("dramatic")}
                disabled={loading}
            >
                Dramatic
            </Button>
          </>
        )}
    </div>
  );
}
