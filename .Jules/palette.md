## 2025-05-20 - [Chat Input Accessibility]
**Learning:** The chat input area relies heavily on icon-only buttons (Send, Stop, Attach) which lack accessible names. This makes the primary interaction method difficult for screen reader users.
**Action:** Always verify icon-only buttons have `aria-label` or `aria-labelledby`, especially in high-traffic areas like input forms.

## 2025-05-21 - [MacOS Design Overhaul Implementation]
**Learning:** To achieve a "Native macOS" aesthetic using Tailwind and shadcn/ui, standard `rounded-md` tokens were insufficient. Updating base components (Button, Input, Select) to use `rounded-lg` (mapped to 16px via `--radius`) provided the desired floating, capsule-like appearance. Consistency across interactive elements is key to this design language.

## 2025-05-22 - [Documentation Source of Truth]
**Learning:** Establishing `AGENTS.md` as the single source of truth that orchestrates other documentation files (like `docs/design-system.md` and `.agent/`) prevents knowledge fragmentation. Explicitly documenting implicit rules (like dynamic imports for shared libs and dual verification strategies) ensures consistent agent behavior and reduces error rates in complex environments.
