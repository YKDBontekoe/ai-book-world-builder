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
