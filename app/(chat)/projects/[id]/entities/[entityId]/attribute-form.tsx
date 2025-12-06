"use client";

import { useFormState } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createAttributeAction, type EntityActionState } from "../actions";

const initialState: EntityActionState = {};

export function AttributeForm({
  projectId,
  entityId,
}: {
  projectId: string;
  entityId: string;
}) {
  const [state, formAction] = useFormState(createAttributeAction, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <input name="projectId" type="hidden" value={projectId} />
      <input name="entityId" type="hidden" value={entityId} />
      <div className="space-y-2">
        <Label htmlFor="name">Attribute name</Label>
        <Input id="name" name="name" placeholder="E.g. allegiance" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="value">Value</Label>
        <Textarea
          id="value"
          name="value"
          placeholder="Describe the attribute with enough context for drafts."
          required
          rows={3}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dataType">Data type</Label>
          <Input
            id="dataType"
            name="dataType"
            placeholder="text, date, metric"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="startDate">Effective start</Label>
          <Input id="startDate" name="startDate" type="date" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">Effective end</Label>
          <Input id="endDate" name="endDate" type="date" />
        </div>
      </div>
      {state.error && (
        <p className="text-destructive text-sm" role="alert">
          {state.error}
        </p>
      )}
      <Button className="w-full" type="submit">
        Add attribute
      </Button>
    </form>
  );
}
