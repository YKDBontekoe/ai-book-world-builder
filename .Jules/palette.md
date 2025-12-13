## 2024-05-23 - Chat UX Robustness
- **Collapsible Logs**: Tool logs can be overwhelming. Making them collapsible by default but expandable for details strikes a good balance between transparency and cleanliness.
- **Retry Strategy**: Implementing a "Retry" on the *last* user message is tricky with optimistic UIs. Using `regenerate()` from the AI SDK works well as it resends the history.
- **Visual Feedback**: Adding subtle animations (like the thinking dots or loading spinners) significantly improves the perceived responsiveness of the app.
