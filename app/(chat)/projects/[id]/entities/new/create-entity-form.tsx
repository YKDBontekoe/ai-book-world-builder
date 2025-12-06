"use client";

import { useFormState } from "react-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createEntityAction, type EntityActionState } from "../actions";

const initialState: EntityActionState = {};

export function CreateEntityForm({ projectId }: { projectId: string }) {
  const [state, formAction] = useFormState(createEntityAction, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">New entity</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <input name="projectId" type="hidden" value={projectId} />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="E.g. House Meridian"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kind">Type</Label>
              <Input
                id="kind"
                name="kind"
                placeholder="Character, city, item"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Summary</Label>
            <Textarea
              id="summary"
              name="summary"
              placeholder="Short overview to help organize drafts."
              rows={4}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start date</Label>
              <Input id="startDate" name="startDate" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End date</Label>
              <Input id="endDate" name="endDate" type="date" />
            </div>
          </div>

          {state.error && (
            <p className="text-destructive text-sm" role="alert">
              {state.error}
            </p>
          )}

          <Button className="w-full" type="submit">
            Save entity
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
