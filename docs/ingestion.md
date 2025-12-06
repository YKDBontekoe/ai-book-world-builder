# Ingestion pipeline

The ingestion worker processes uploaded source materials by normalizing text into chapters and chunks and now also derives structured lore entities for prompt grounding.

## Entity extraction

- **Folder-aware parsing:** Extraction groups bullets that follow project folder headings (for example, `Characters`, `Locations`) and assigns each entity a folder attribute so context prompts can surface where the entity belongs in the project tree.
- **Attributes and relationships:** Bullet modifiers like `Attributes:` and `Relationships:` are parsed into entity attributes and entity-to-entity relationships. Attributes and relationships are deduplicated per entity to avoid duplicate rows when materials are reprocessed.
- **Uniqueness enforcement:** Entities are upserted by `(projectId, name)` and relationships by `(projectId, sourceEntityId, targetEntityId, type)`, updating summaries and descriptions on conflict to keep canonical records current.
- **Audit metadata:** Processing metadata records how many entities were extracted, created, or updated plus attribute and relationship upserts to aid debugging.

## Testing

- Run the ingestion unit suite to validate extraction logic and deduplication behavior:

```bash
pnpm exec vitest tests/unit/ingestion/worker.test.ts
```

These tests exercise the worker end-to-end using an in-memory repository so entity creation, updates, and relationship deduplication mirror the production workflow.
