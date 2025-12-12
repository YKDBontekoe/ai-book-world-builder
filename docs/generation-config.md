# Generation configuration components

The generation settings panel is composed of small, controlled subcomponents so model and chapter options stay consistent across the app.

## Modules

- `components/generation/config/model-selection.tsx` – renders model cards for writer/reviewer roles and surfaces `onModelChange` when a choice is clicked. It accepts optional tooltips and custom model lists, but defaults to the gateway `chatModels`.
- `components/generation/config/chapter-settings-section.tsx` – owns chapter count, pages-per-chapter, and revision sliders. Each slider forwards numeric updates through `onSettingChange`.
- `components/generation/config/writing-style-section.tsx` – exposes the writing style preset select, custom style textarea, and author inspiration textarea. All fields are controlled via props and invoke `onSettingChange`.
- `components/generation/config/metadata-section.tsx` – groups metadata fields (title, author, genre) and emits changes through the shared handler.
- `components/generation/config/constants.ts` – centralizes static lists (image model cards, genre options, and additional boolean toggles) plus the shared `SettingsChangeHandler` type.

## Usage

```tsx
import { GenerationConfigPanel } from "@/components/generation";

<GenerationConfigPanel
  projectId={project.id}
  settings={settings}
  onSettingsChange={setSettings}
/>
```

Each subsection is fully controlled. Provide the current `settings` object and an `onSettingsChange` callback that persists updates (for example, lifting state into a parent container or backing store).
