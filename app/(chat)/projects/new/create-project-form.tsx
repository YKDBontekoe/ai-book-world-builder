"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { createProjectAction, type CreateProjectState } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const initialState: CreateProjectState = {};

export function CreateProjectForm() {
  const [state, formAction] = useFormState(createProjectAction, initialState);
  const [visibility, setVisibility] = useState("private");

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Project name</Label>
        <Input id="name" name="name" placeholder="My world bible" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="What makes this project unique?"
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="visibility">Visibility</Label>
        <Select
          defaultValue="private"
          onValueChange={setVisibility}
          value={visibility}
        >
          <SelectTrigger id="visibility">
            <SelectValue placeholder="Select visibility" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="private">Private</SelectItem>
            <SelectItem value="public">Public</SelectItem>
          </SelectContent>
        </Select>
        <input name="visibility" type="hidden" value={visibility} />
        <p className="text-muted-foreground text-sm">
          Private projects are only visible to you; public projects can be shared via
          link.
        </p>
      </div>

      {state.error && (
        <p className="text-destructive text-sm" role="alert">
          {state.error}
        </p>
      )}

      <Button className="w-full" type="submit">
        Create project
      </Button>
    </form>
  );
}
