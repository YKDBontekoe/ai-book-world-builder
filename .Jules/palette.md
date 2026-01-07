## 2024-05-23 - Command Palette Navigation Pattern

When implementing keyboard-driven command palettes (like `WriterSpotlight`):
1.  **State Management**: Reset the `selectedIndex` to `0` whenever the filtered list changes (e.g., query updates or category switches).
2.  **Implementation**: Use a `useEffect` dependent on the filter state variables.
    ```tsx
    useEffect(() => {
        setSelectedIndex(0);
    }, [activeCategory, debouncedQuery]);
    ```
3.  **Why**: Without this, switching from a long list (e.g., "All") to a short list (e.g., "Actions") leaves the index pointing to an undefined element, breaking keyboard interactions and previews.

## 2024-12-16 - Standardizing Empty States

1.  **Context**: The application had inconsistent empty states (text links vs. buttons) and inconsistent icon sizing in list views (`InspirationPage` vs `ExportList`).
2.  **Solution**:
    *   Standardized `EmptyState` actions to always use the primary `Button` component for clear calls to action.
    *   Unified icon sizing in `GlassCard` lists to `size={24}` (24px) within a `p-2.5` container to ensure visual balance across different list views.
    *   Updated floating action bars (bulk actions) to use `rounded-2xl` to distinguish them as "floating panels" versus standard cards (`rounded-lg`).
3.  **Why**: Consistent empty states reduce cognitive load, and standardized icon metrics contribute to the polished "Native macOS" aesthetic.
