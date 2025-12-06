"use client";

import { useActionState, useEffect, useMemo, useState } from "react";

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
import type { VolumePlan } from "@/lib/db/queries";
import type { Outline } from "@/lib/db/schema";
import { calculateProgress } from "@/lib/story/chapters";
import { cn } from "@/lib/utils";
import {
  generateChapterDraftSequenceAction,
  generateDraftAction,
  generateOutlineAction,
  generateVolumePlanAction,
  type OutlineDraftState,
  type VolumePlannerState,
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
  volumes,
  visibility,
}: {
  canEdit: boolean;
  outlines: Outline[];
  projectId: string;
  volumes: VolumePlan[];
  visibility: string;
}) {
  const [savedOutlines, setSavedOutlines] = useState(outlines);
  const [activeOutlineId, setActiveOutlineId] = useState(
    outlines.at(0)?.id ?? ""
  );
  const [volumePlans, setVolumePlans] = useState(volumes);
  const [activeVolumeId, setActiveVolumeId] = useState(volumes.at(0)?.id ?? "");
  const [aiDraft, setAiDraft] = useState("");
  const [editableDraft, setEditableDraft] = useState("");

  const [outlineState, generateOutline] = useActionState<
    OutlineDraftState,
    FormData
  >(generateOutlineAction, {});
  const [draftState, generateDraft] = useActionState<
    OutlineDraftState,
    FormData
  >(generateDraftAction, {});
  const [volumeState, generateVolumePlan] = useActionState<
    VolumePlannerState,
    FormData
  >(generateVolumePlanAction, {});
  const [chapterDraftState, generateChapterDrafts] = useActionState<
    VolumePlannerState,
    FormData
  >(generateChapterDraftSequenceAction, {});

  const activeOutline = useMemo(
    () => savedOutlines.find((outline) => outline.id === activeOutlineId),
    [activeOutlineId, savedOutlines]
  );
  const activeVolume = useMemo(
    () => volumePlans.find((volumePlan) => volumePlan.id === activeVolumeId),
    [activeVolumeId, volumePlans]
  );

  useEffect(() => {
    const newOutline = outlineState.outline;

    if (!newOutline) {
      return;
    }

    setSavedOutlines((previous) => {
      const withoutDuplicate = previous.filter(
        (outline) => outline.id !== newOutline.id
      );

      return [newOutline, ...withoutDuplicate];
    });
    setActiveOutlineId(newOutline.id);
  }, [outlineState.outline]);

  useEffect(() => {
    if (draftState.draft) {
      setAiDraft(draftState.draft);
      setEditableDraft(draftState.draft);
    }
  }, [draftState]);

  useEffect(() => {
    const newVolume = volumeState.volume;

    if (!newVolume) {
      return;
    }

    setVolumePlans((previous) => {
      const withoutDuplicate = previous.filter(
        (volumePlan) => volumePlan.id !== newVolume.id
      );

      return [newVolume, ...withoutDuplicate];
    });
    setActiveVolumeId(newVolume.id);
  }, [volumeState.volume]);

  useEffect(() => {
    const refreshedVolume = chapterDraftState.volume;

    if (!refreshedVolume) {
      return;
    }

    setVolumePlans((previous) => {
      const withoutDuplicate = previous.filter(
        (volumePlan) => volumePlan.id !== refreshedVolume.id
      );

      return [refreshedVolume, ...withoutDuplicate];
    });
    setActiveVolumeId(refreshedVolume.id);
  }, [chapterDraftState.volume]);

  const outlineError = outlineState.error;
  const draftError = draftState.error;
  const volumeError = volumeState.error;
  const sequenceError = chapterDraftState.error;

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
                  <Select
                    defaultValue={POV_OPTIONS[1]}
                    disabled={!canEdit}
                    name="pov"
                  >
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
                  <Select
                    defaultValue={TONE_OPTIONS[0]}
                    disabled={!canEdit}
                    name="tone"
                  >
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
                  <Select
                    defaultValue={PACING_OPTIONS[1]}
                    disabled={!canEdit}
                    name="pacing"
                  >
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
                      <li
                        className="leading-relaxed"
                        key={`${activeOutline.id}-${beat}`}
                      >
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
                    className={cn(
                      "w-full rounded-lg border px-3 py-2 text-left transition hover:border-primary",
                      outline.id === activeOutlineId
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    )}
                    key={outline.id}
                    onClick={() => setActiveOutlineId(outline.id)}
                    type="button"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="font-medium leading-tight">
                          {outline.title}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {outline.pov} • {outline.tone}
                        </p>
                      </div>
                      <Badge variant="outline">{outline.pacing}</Badge>
                    </div>
                    {outline.summary ? (
                      <p className="mt-1 line-clamp-2 text-muted-foreground text-xs">
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
                  disabled={!canEdit || savedOutlines.length === 0}
                  name="outlineId"
                  onValueChange={setActiveOutlineId}
                  value={activeOutlineId}
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

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Chapter plans</CardTitle>
            <p className="text-muted-foreground text-sm">
              Create volume-length plans tied to your outlines, then draft each
              chapter in order.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <form
              action={canEdit && activeOutline ? generateVolumePlan : undefined}
              className="grid gap-3"
            >
              <input name="projectId" type="hidden" value={projectId} />
              <input
                name="outlineId"
                type="hidden"
                value={activeOutline?.id ?? ""}
              />
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="volumeTitle">Volume title</Label>
                  <Input
                    defaultValue={activeOutline?.title ?? "New volume"}
                    disabled={!canEdit}
                    id="volumeTitle"
                    minLength={3}
                    name="volumeTitle"
                    placeholder="Saga title or working book name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Use outline</Label>
                  <Select
                    disabled={!canEdit || savedOutlines.length === 0}
                    onValueChange={setActiveOutlineId}
                    value={activeOutlineId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an outline" />
                    </SelectTrigger>
                    <SelectContent>
                      {savedOutlines.map((outlineOption) => (
                        <SelectItem
                          key={outlineOption.id}
                          value={outlineOption.id}
                        >
                          {outlineOption.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="guidance">Planning notes</Label>
                <Textarea
                  disabled={!canEdit}
                  id="guidance"
                  name="guidance"
                  placeholder="Request a number of chapters or focus on specific arcs"
                />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  disabled={!canEdit || savedOutlines.length === 0}
                  type="submit"
                >
                  Create chapter plan
                </Button>
                {volumeError ? (
                  <p className="text-destructive text-sm">{volumeError}</p>
                ) : null}
              </div>
            </form>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">Saved plans</p>
                  <p className="text-muted-foreground text-sm">
                    Select a plan to view chapters and draft progress.
                  </p>
                </div>
                <Select
                  disabled={volumePlans.length === 0}
                  onValueChange={setActiveVolumeId}
                  value={activeVolumeId}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Choose a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {volumePlans.map((volumePlan) => (
                      <SelectItem key={volumePlan.id} value={volumePlan.id}>
                        {volumePlan.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {activeVolume ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">Chapters</p>
                      <p className="text-muted-foreground text-sm">
                        {activeVolume.chapters.length} planned chapters with
                        notes.
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">
                        {calculateProgress(activeVolume.chapters)}% drafted
                      </p>
                      <div className="mt-1 h-2 w-32 rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{
                            width: `${calculateProgress(activeVolume.chapters)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 rounded-lg border p-3">
                    {activeVolume.chapters.length === 0 ? (
                      <p className="text-muted-foreground text-sm">
                        Add guidance above to generate an ordered chapter list.
                      </p>
                    ) : (
                      activeVolume.chapters.map((chapterPlan) => {
                        const draftPreview = chapterPlan.drafts.at(0);

                        return (
                          <div
                            className="rounded-md border border-dashed p-3"
                            key={chapterPlan.id}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-semibold leading-tight">
                                  {chapterPlan.sequence}. {chapterPlan.title}
                                </p>
                                {chapterPlan.notes ? (
                                  <p className="text-muted-foreground text-xs">
                                    {chapterPlan.notes}
                                  </p>
                                ) : null}
                              </div>
                              <Badge variant="outline">
                                {chapterPlan.status}
                              </Badge>
                            </div>
                            {draftPreview ? (
                              <p className="mt-2 line-clamp-2 text-muted-foreground text-xs">
                                {draftPreview.content}
                              </p>
                            ) : (
                              <p className="mt-2 text-muted-foreground text-xs">
                                Draft not generated yet.
                              </p>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                  <form
                    action={
                      canEdit && activeVolume
                        ? generateChapterDrafts
                        : undefined
                    }
                    className="flex flex-wrap items-center gap-3"
                  >
                    <input name="projectId" type="hidden" value={projectId} />
                    <input
                      name="volumeId"
                      type="hidden"
                      value={activeVolume.id}
                    />
                    <Button
                      disabled={!canEdit || !activeVolume}
                      type="submit"
                      variant="secondary"
                    >
                      Generate sequential drafts
                    </Button>
                    {sequenceError ? (
                      <p className="text-destructive text-sm">
                        {sequenceError}
                      </p>
                    ) : null}
                  </form>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Plans you create will appear here with chapter-by-chapter
                  progress.
                </p>
              )}
            </div>
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
                  <pre className="whitespace-pre-wrap text-left">{aiDraft}</pre>
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
