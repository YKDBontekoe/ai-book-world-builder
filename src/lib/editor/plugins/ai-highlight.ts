import { Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";

export const aiHighlightPluginKey = new PluginKey("aiHighlight");

export const aiHighlightPlugin = new Plugin({
  key: aiHighlightPluginKey,
  state: {
    init() {
      return DecorationSet.empty;
    },
    apply(tr, set) {
      set = set.map(tr.mapping, tr.doc);
      const action = tr.getMeta(aiHighlightPluginKey);
      if (action && action.add) {
        const { from, to, id } = action.add;
        const decoration = Decoration.inline(from, to, {
          class: "ai-highlight bg-purple-500/20 border-b-2 border-purple-500",
          "data-highlight-id": id,
        });
        set = set.add(tr.doc, [decoration]);
      } else if (action && action.remove) {
        set = set.remove(
          set.find(
            undefined,
            undefined,
            (spec) => spec["data-highlight-id"] === action.remove.id
          )
        );
      }
      return set;
    },
  },
  props: {
    decorations(state) {
      return this.getState(state);
    },
  },
});
