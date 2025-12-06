"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormState } from "react-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Outline } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import {
  type OutlineDraftState,
  generateDraftAction,
  generateOutlineAction,
} from "./actions";

const POV_OPTIONS = [
  "First person, intimate",
  "Close third person",
  "Limited omniscient",
  "Cinematic objective",
];

const TONE_OPTIONS = [
  "Optimistic and bright",
  "Somber and restrained",
  "Playful and witty",
  "Tense and foreboding",
];

const PACING_OPTIONS = [
  "Slow burn with reflection",
  "Balanced with rising tension",
  "Fast-paced and urgent",
];

export function DraftWorkspace({
  canEdit,
  outlines,
  projectId,
  visibility,
}: {
  canEdit: boolean;
  outlines: Outline[];
  projectId: string;
  visibility: string;
}) {
  const [savedOutlines, setSavedOutlines] = useState(outlines);
  const [activeOutlineId, setActiveOutlineId] = useState(
    outlines.at(0)?.id ?? ""
  );
  const [aiDraft, setAiDraft] = useState("");
  const [editableDraft, setEditableDraft] = useState("");

  const initialState: OutlineDraftState = {};
  const [outlineState, generateOutline] = useFormState<
    OutlineDraftState,
    FormData
  >(generateOutlineAction, initialState);
  const [draftState, generateDraft] = useFormState<OutlineDraftState, FormData>(
    generateDraftAction,
    initialState
  );

  const activeOutline = useMemo(
    () => savedOutlines.find((outline) => outline.id === activeOutlineId),
    [activeOutlineId, savedOutlines]
  );

  useEffect(() => {
    if (outlineState.outline) {
      setSavedOutlines((previous) => [outlineState.outline, ...previous]);
      setActiveOutlineId(outlineState.outline.id);
    }
  }, [outlineState]);

  useEffect(() => {
    if (draftState.draft) {
      setAiDraft(draftState.draft);
      setEditableDraft(draftState.draft);
    }
  }, [draftState]);

  const outlineError = outlineState.error;
  const draftError = draftState.error;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              Outline generator
              <Badge variant="outline">{visibility}</Badge>
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              Guide the AI with point of view, tone, and pacing to keep your
              chapters consistent.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <form
              action={canEdit ? generateOutline : undefined}
              className="space-y-4"
            >
              <input name="projectId" type="hidden" value={projectId} />
              <div className="space-y-2">
                <Label htmlFor="title">Outline title</Label>
                <Input
                  defaultValue="New chapter outline"
                  disabled={!canEdit}
                  id="title"
                  name="title"
                  placeholder="Chapter title or scene label"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="idea">Premise or scene idea</Label>
                <Textarea
                  disabled={!canEdit}
                  id="idea"
                  minLength={12}
                  name="idea"
                  placeholder="Summarize the beats you want to cover"
                  required
                />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Point of view</Label>
                  <Select defaultValue={POV_OPTIONS[1]} name="pov" disabled={!canEdit}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select POV" />
                    </SelectTrigger>
                    <SelectContent>
                      {POV_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tone</Label>
                  <Select defaultValue={TONE_OPTIONS[0]} name="tone" disabled={!canEdit}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a tone" />
                    </SelectTrigger>
                    <SelectContent>
                      {TONE_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Pacing</Label>
                  <Select defaultValue={PACING_OPTIONS[1]} name="pacing" disabled={!canEdit}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pick pacing" />
                    </SelectTrigger>
                    <SelectContent>
                      {PACING_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button disabled={!canEdit} type="submit">
                  Generate outline
                </Button>
                {outlineError ? (
                  <p className="text-destructive text-sm">{outlineError}</p>
                ) : null}
              </div>
            </form>

            <div className="space-y-2">
              <p className="font-medium">Outline beats</p>
              <div className="rounded-lg border bg-muted/30 p-4">
                {activeOutline?.beats?.length ? (
                  <ol className="space-y-2 text-sm">
                    {activeOutline.beats.map((beat, index) => (
                      <li key={beat + index} className="leading-relaxed">
                        <span className="font-semibold text-muted-foreground">
                          {index + 1}.
                        </span>{" "}
                        {beat}
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No outline generated yet. Create one to view its beats here.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Saved outlines</CardTitle>
            <p className="text-muted-foreground text-sm">
              Reuse previous outlines across drafts. Newest items appear first.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {savedOutlines.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Outlines will show up here after you generate them.
              </p>
            ) : (
              <div className="space-y-2">
                {savedOutlines.map((outline) => (
                  <button
                    key={outline.id}
                    className={cn(
                      "w-full rounded-lg border px-3 py-2 text-left transition hover:border-primary",
                      outline.id === activeOutlineId
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    )}
                    onClick={() => setActiveOutlineId(outline.id)}
                    type="button"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="font-medium leading-tight">{outline.title}</p>
                        <p className="text-muted-foreground text-xs">
                          {outline.pov} • {outline.tone}
                        </p>
                      </div>
                      <Badge variant="outline">{outline.pacing}</Badge>
                    </div>
                    {outline.summary ? (
                      <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                        {outline.summary}
                      </p>
                    ) : null}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Draft generation</CardTitle>
            <p className="text-muted-foreground text-sm">
              Use a saved outline and your lore to draft prose side by side with
              an editable version.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <form
              action={canEdit ? generateDraft : undefined}
              className="grid gap-4"
            >
              <input name="projectId" type="hidden" value={projectId} />
              <div className="space-y-2">
                <Label>Use outline</Label>
                <Select
                  value={activeOutlineId}
                  disabled={!canEdit || savedOutlines.length === 0}
                  name="outlineId"
                  onValueChange={setActiveOutlineId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an outline" />
                  </SelectTrigger>
                  <SelectContent>
                    {savedOutlines.map((outline) => (
                      <SelectItem key={outline.id} value={outline.id}>
                        {outline.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes for this draft</Label>
                <Textarea
                  disabled={!canEdit}
                  id="notes"
                  name="notes"
                  placeholder="Add reminders, twists, or character goals"
                />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  disabled={!canEdit || savedOutlines.length === 0}
                  type="submit"
                >
                  Generate draft
                </Button>
                {draftError ? (
                  <p className="text-destructive text-sm">{draftError}</p>
                ) : null}
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">AI output</CardTitle>
              <p className="text-muted-foreground text-sm">
                Generated text that respects your outline and lore.
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-72 rounded-lg border bg-muted/40 p-3 text-sm leading-relaxed">
                {aiDraft ? (
                  <pre className="whitespace-pre-wrap text-left">
                    {aiDraft}
                  </pre>
                ) : (
                  <p className="text-muted-foreground">
                    Generate a draft to see the AI suggestion.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Editable draft</CardTitle>
              <p className="text-muted-foreground text-sm">
                Start from the AI output or write your own version alongside it.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                className="min-h-[18rem]"
                disabled={!canEdit}
                name="draft-content"
                onChange={(event) => setEditableDraft(event.target.value)}
                placeholder="Edit or expand the generated draft"
                value={editableDraft}
              />
              <Button
                disabled={!canEdit || !aiDraft}
                onClick={() => setEditableDraft(aiDraft)}
                type="button"
                variant="outline"
              >
                Use AI text as draft
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
