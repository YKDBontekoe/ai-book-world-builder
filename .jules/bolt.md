## 2024-05-22 - React Context Re-renders
**Learning:** `useContext` hooks (like `useDataStream`) trigger re-renders in every consuming component on every update. Calling such a hook without using its value (as seen in `messages.tsx`) is a silent performance killer.
**Action:** Always check hooks for hidden context subscriptions. Isolate frequent updates (like streaming data) to small leaf components to prevent heavy parent re-renders.
