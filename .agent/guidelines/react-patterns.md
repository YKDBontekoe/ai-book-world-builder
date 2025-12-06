# React Patterns

This document outlines React patterns used in the AI Book World Builder project.

## Orchestrator Pattern

The `Chat` component (`components/chat.tsx`) is a prime example of a state orchestrator. It manages:
- **Chat State**: `useChat` hook.
- **UI State**: `useState` for inputs, attachments, alerts.
- **Data State**: `useSWR` for votes.
- **Refs**: `useRef` for tracking current model ID without triggering re-renders in callbacks.

## Custom Hooks for Logic Extraction

We extract complex logic into hooks:
- `useChatVisibility`: Manages visibility state.
- `useAutoResume`: Handles resuming streams on page reload.
- `useArtifactSelector`: Uses global state store.

## Global State with Zustand

We use global stores (via `useArtifactSelector` mentioned in `Chat`) for UI state that needs to be accessed deeply or across components.

## Error Handling with Alerts

For critical user-facing errors (like credit card requirements), we use `AlertDialog` controlled by local state.

```typescript
<AlertDialog open={showCreditCardAlert} onOpenChange={setShowCreditCardAlert}>
  <AlertDialogContent>
    {/* ... */}
  </AlertDialogContent>
</AlertDialog>
```

## Toasts for Notification

We use a custom `toast` helper for transient notifications.

```typescript
toast({
  type: "error",
  description: error.message,
});
```
