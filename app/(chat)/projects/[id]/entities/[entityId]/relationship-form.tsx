"use client";

import { useMemo, useState } from "react";
import { useFormState } from "react-dom";
import { createRelationshipAction, type EntityActionState } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Entity } from "@/lib/db/schema";

const initialState: EntityActionState = {};

export function RelationshipForm({
  projectId,
  sourceEntityId,
  entities,
}: {
  projectId: string;
  sourceEntityId: string;
  entities: Entity[];
}) {
  const [state, formAction] = useFormState(
    createRelationshipAction,
    initialState
  );
  const [targetId, setTargetId] = useState<string | undefined>();

  const availableEntities = useMemo(
    () => entities.filter((entity) => entity.id !== sourceEntityId),
    [entities, sourceEntityId]
  );

  return (
    <form action={formAction} className="space-y-3">
      <input name="projectId" type="hidden" value={projectId} />
      <input name="sourceEntityId" type="hidden" value={sourceEntityId} />
      <div className="space-y-2">
        <Label htmlFor="type">Relationship type</Label>
        <Input id="type" name="type" placeholder="Ally, sibling, located in" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="targetEntityId">Related to</Label>
        <Select onValueChange={setTargetId} value={targetId}>
          <SelectTrigger id="targetEntityId">
            <SelectValue placeholder="Choose another entity" />
          </SelectTrigger>
          <SelectContent>
            {availableEntities.map((entity) => (
              <SelectItem key={entity.id} value={entity.id}>
                {entity.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input name="targetEntityId" type="hidden" value={targetId} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Context</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Explain why this relationship matters to the story."
          rows={3}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="startDate">Starts</Label>
          <Input id="startDate" name="startDate" type="date" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">Ends</Label>
          <Input id="endDate" name="endDate" type="date" />
        </div>
      </div>
      {state.error && (
        <p className="text-destructive text-sm" role="alert">
          {state.error}
        </p>
      )}
      <Button type="submit" className="w-full">
        Add relationship
      </Button>
    </form>
  );
}
