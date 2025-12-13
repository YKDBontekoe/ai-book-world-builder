# Design system guide

This guide documents the shared design language for typography, spacing, color tokens, UI states, and component usage when working with shadcn/ui primitives in this project.

## Typography scale
- **Font family**: Geist for UI text and Geist Mono for code, supplied via the root layout. Use `font-sans` by default and `font-mono` for code or data-heavy content.
- **Base size**: `text-base` with comfortable leading (`leading-7`) for body copy.
- **Scale**: Use Tailwind's semantic steps to keep headings consistent:
  - Display/hero: `text-4xl`–`text-5xl` with `font-semibold`
  - Page heading (H1): `text-3xl` `font-semibold`
  - Section heading (H2): `text-2xl` `font-semibold`
  - Subheading (H3): `text-xl` `font-medium`
  - Eyebrow/label: `text-sm` `uppercase tracking-wide`
  - Helper/caption: `text-xs` `text-muted-foreground`
- **Accessibility**: Maintain a single H1 per page, avoid relying on color alone for emphasis, and use `font-medium` or `font-semibold` for emphasis before reaching for `text-primary`.

## Spacing scale
- Favor a 4px-based spacing rhythm through Tailwind utilities: `gap-2` (8px), `gap-4` (16px), `gap-6` (24px), `gap-8` (32px), and `gap-12` (48px) for larger sections.
- Default paddings: `py-3 px-4` for compact controls, `p-6` for cards, and `p-8` for larger panels.
- Use `space-y-*` utilities to separate stacked elements instead of ad-hoc margins to keep vertical rhythm consistent.

## Color tokens
Color variables are defined in `app/globals.css` for light and dark themes. Prefer semantic tokens over raw HSL values:

- **Surface & text**: `--background`, `--foreground`, `--card`, `--card-foreground`, `--popover`, `--popover-foreground`.
- **Interactive**: `--primary`/`--primary-foreground`, `--secondary`/`--secondary-foreground`, `--accent`/`--accent-foreground`, `--destructive`/`--destructive-foreground`.
- **Supporting**: `--muted`/`--muted-foreground`, `--border`, `--input`, `--ring`.
- **Data viz**: `--chart-1` … `--chart-5` for consistent chart palettes.
- **Navigation**: `--sidebar-background`, `--sidebar-foreground`, `--sidebar-primary`, `--sidebar-primary-foreground`, `--sidebar-accent`, `--sidebar-accent-foreground`, `--sidebar-border`, `--sidebar-ring`.

Use the `bg-*`, `text-*`, `border-*`, and `ring-*` Tailwind utilities that resolve to these CSS variables (for example, `bg-primary`, `text-muted-foreground`, `border-border`).

## States
- **Hover**: Apply `hover:bg-secondary` or `hover:bg-accent` with subtle elevation (`transition-colors`).
- **Focus**: Use focus-visible outlines via `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` on interactive controls.
- **Active**: Slightly darken or scale (`active:scale-95`) buttons for feedback while preserving contrast.
- **Disabled**: Add `disabled:opacity-50 disabled:cursor-not-allowed` while keeping text legible. Avoid removing focus outlines on disabled form controls; instead, rely on aria attributes (`aria-disabled`, `aria-busy`) from shadcn/ui components.
- **Validation**: Use `text-destructive` and `border-destructive` for errors; lean on helper text to describe the issue.

## Aesthetic Principles (Native macOS)

The project adheres to a "Native macOS" design aesthetic, favoring fluidity, translucency, and rounded geometry.

### Roundedness & Geometry
- **Primary Interactive Elements**: Use `rounded-lg` (16px) for buttons, inputs, selects, and small cards. This matches the project's `--radius` token.
- **Dialogs & Panels**: Use `rounded-2xl` for larger detached surfaces like Dialogs, Sheets, or floating panels.
- **Segmented Controls**: Prefer segmented controls (tabs with `bg-muted` pill indicators) over traditional underline tabs.

### Materials & Translucency
- **Glass**: Use `.glass` or `.glass-panel` classes to apply backdrop blur and translucency. This is critical for floating elements like the chat input or sticky headers.
- **Borders**: Use subtle borders (`border-white/10` in dark mode) to define edges without heavy lines.
- **Shadows**: Use soft, diffuse shadows (`shadow-sm`, `shadow-md`) to lift elements slightly off the background, mimicking macOS window layering.

### Animation & Physics
- **Spring Physics**: Animations should feel physical. Favor spring curves (stiffness: 400, damping: 25) over linear ease-in-out for interactions like opening dialogs or expanding cards.
- **Fluidity**: Elements should morph or slide rather than abruptly appear.

## Component usage patterns (shadcn/ui)

### Buttons
Use the shared `Button` component for all clickable actions to inherit sizing, focus rings, and dark-mode tokens.

```tsx
import { Button } from "@/components/ui/button";

export function ButtonShowcase() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button>Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="destructive">Delete</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Text link</Button>
    </div>
  );
}
```

### Forms
Compose inputs with labels and helper text. Keep spacing consistent with `space-y-2` inside each field group and `space-y-6` between groups. Mark invalid fields with `aria-invalid` and pair with descriptive text.

```tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ProfileForm() {
  return (
    <form className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
        <p className="text-sm text-muted-foreground">Use your work address for faster verification.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select name="role" defaultValue="pm">
          <SelectTrigger id="role">
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pm">Product Manager</SelectItem>
            <SelectItem value="eng">Engineer</SelectItem>
            <SelectItem value="design">Designer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit">Save changes</Button>
        <Button type="button" variant="outline">Cancel</Button>
      </div>
    </form>
  );
}
```

### Cards
Use `Card` to group related content. Default padding is `p-6`; add headers and footers to organize text and actions.

```tsx
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function SummaryCard() {
  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Workspace summary</CardTitle>
        <CardDescription>Key metrics updated hourly</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <div className="flex justify-between">
          <span>Active projects</span>
          <span className="text-foreground font-medium">8</span>
        </div>
        <div className="flex justify-between">
          <span>Open tasks</span>
          <span className="text-foreground font-medium">42</span>
        </div>
      </CardContent>
      <CardFooter className="justify-end gap-3">
        <Button variant="ghost">Details</Button>
        <Button>Refresh</Button>
      </CardFooter>
    </Card>
  );
}
```

### Layout grids
Use responsive grids to align cards and forms. Combine `gap` utilities with column counts that step up at breakpoints.

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function LayoutGrid() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <Card key={item}>
          <CardHeader>
            <CardTitle>Module {item}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Use consistent `gap-6` spacing between cards and increase to `gap-8` for dashboard layouts with more breathing room.
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

### States in practice
- Buttons and form controls already include hover/focus styles; keep `className` overrides limited to layout tweaks to preserve accessibility.
- For destructive or loading flows, prefer the `variant="destructive"` or `aria-busy` + `disabled` props on `Button` to keep focus handling consistent.
- When embedding components in dark sections, rely on the semantic utilities (`bg-card`, `text-card-foreground`) instead of hard-coded colors to maintain theme support.

By following these tokens and patterns, new UI work will stay consistent with the rest of the app while remaining accessible in light and dark modes.
