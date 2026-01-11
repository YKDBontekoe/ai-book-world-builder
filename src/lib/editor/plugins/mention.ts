import {
	type EditorState,
	Plugin,
	PluginKey,
	type Transaction,
} from "prosemirror-state";
import { Decoration, DecorationSet, type EditorView } from "prosemirror-view";

export const mentionPluginKey = new PluginKey("mention");

interface MentionState {
	active: boolean;
	range: { from: number; to: number } | null;
	query: string;
	index: number;
}

export const mentionPlugin = (
	onMentionStateChange: (state: MentionState | null) => void,
) =>
	new Plugin({
		key: mentionPluginKey,
		state: {
			init(): MentionState {
				return { active: false, range: null, query: "", index: 0 };
			},
			apply(
				tr: Transaction,
				value: MentionState,
				_oldState: EditorState,
				_newState: EditorState,
			): MentionState {
				const { selection } = tr;
				const { $from } = selection;
				const textBefore = $from.parent.textBetween(
					Math.max(0, $from.parentOffset - 20),
					$from.parentOffset,
					"\n",
					"\0",
				);

				const match = textBefore.match(/@(\w*)$/);

				if (match) {
					const query = match[1];
					const from = $from.pos - query.length - 1; // -1 for @
					const to = $from.pos;
					return {
						active: true,
						range: { from, to },
						query,
						index: value.index || 0,
					};
				}

				return { active: false, range: null, query: "", index: 0 };
			},
		},
		props: {
			handleKeyDown(view: EditorView, event: KeyboardEvent) {
				const state = mentionPluginKey.getState(view.state);
				if (!state?.active) return false;

				if (event.key === "ArrowDown") {
					onMentionStateChange({ ...state, index: state.index + 1 });
					return true;
				}
				if (event.key === "ArrowUp") {
					onMentionStateChange({
						...state,
						index: Math.max(0, state.index - 1),
					});
					return true;
				}
				if (event.key === "Enter") {
					// The parent component handles the actual insertion via the callback + command
					// We just need to prevent the default newline
					return true;
				}
				if (event.key === "Escape") {
					onMentionStateChange(null);
					return true;
				}

				return false;
			},
			decorations(state: EditorState) {
				const pluginState = mentionPluginKey.getState(state);
				if (pluginState?.active && pluginState.range) {
					return DecorationSet.create(state.doc, [
						Decoration.inline(pluginState.range.from, pluginState.range.to, {
							class: "bg-primary/20 text-primary rounded-sm px-0.5",
						}),
					]);
				}
				return null;
			},
		},
		view(_editorView: EditorView) {
			return {
				update(view: EditorView, _prevState: EditorState) {
					const state = mentionPluginKey.getState(view.state);
					onMentionStateChange(state.active ? state : null);
				},
			};
		},
	});
