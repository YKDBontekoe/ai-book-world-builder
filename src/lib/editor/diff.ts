// Modified from https://github.com/hamflx/prosemirror-diff/blob/master/src/diff.js

import { diff_match_patch } from "diff-match-patch";
import { Fragment, Mark, Node, type Schema } from "prosemirror-model";

export enum DiffType {
	Unchanged = 0,
	Deleted = -1,
	Inserted = 1,
}

export const patchDocumentNode = (
	schema: Schema,
	oldNode: Node,
	newNode: Node,
): Node => {
	assertNodeTypeEqual(oldNode, newNode);

	const finalLeftChildren: (Node | Node[])[] = [];
	const finalRightChildren: (Node | Node[])[] = [];

	const oldChildren = normalizeNodeContent(oldNode);
	const newChildren = normalizeNodeContent(newNode);
	const oldChildLen = oldChildren.length;
	const newChildLen = newChildren.length;
	const minChildLen = Math.min(oldChildLen, newChildLen);

	let left = 0;
	let right = 0;

	for (; left < minChildLen; left++) {
		const oldChild = oldChildren[left];
		const newChild = newChildren[left];
		if (!isNodeEqual(oldChild, newChild)) {
			break;
		}
		finalLeftChildren.push(...ensureArray(oldChild));
	}

	for (; right + left + 1 < minChildLen; right++) {
		const oldChild = oldChildren[oldChildLen - right - 1];
		const newChild = newChildren[newChildLen - right - 1];
		if (!isNodeEqual(oldChild, newChild)) {
			break;
		}
		finalRightChildren.unshift(...ensureArray(oldChild));
	}

	const diffOldChildren = oldChildren.slice(left, oldChildLen - right);
	const diffNewChildren = newChildren.slice(left, newChildLen - right);

	if (diffOldChildren.length && diffNewChildren.length) {
		const matchedNodes = matchNodes(
			schema,
			diffOldChildren,
			diffNewChildren,
		).sort((a, b) => b.count - a.count);
		const bestMatch = matchedNodes[0];
		if (bestMatch) {
			const { oldStartIndex, newStartIndex, oldEndIndex, newEndIndex } =
				bestMatch;
			const oldBeforeMatchChildren = diffOldChildren.slice(0, oldStartIndex);
			const newBeforeMatchChildren = diffNewChildren.slice(0, newStartIndex);

			finalLeftChildren.push(
				...patchRemainNodes(
					schema,
					oldBeforeMatchChildren,
					newBeforeMatchChildren,
				),
			);
			finalLeftChildren.push(
				...diffOldChildren.slice(oldStartIndex, oldEndIndex).flat(),
			);

			const oldAfterMatchChildren = diffOldChildren.slice(oldEndIndex);
			const newAfterMatchChildren = diffNewChildren.slice(newEndIndex);

			finalRightChildren.unshift(
				...patchRemainNodes(
					schema,
					oldAfterMatchChildren,
					newAfterMatchChildren,
				),
			);
		} else {
			finalLeftChildren.push(
				...patchRemainNodes(schema, diffOldChildren, diffNewChildren),
			);
		}
	} else {
		finalLeftChildren.push(
			...patchRemainNodes(schema, diffOldChildren, diffNewChildren),
		);
	}

	return createNewNode(oldNode, [
		...finalLeftChildren.flat(),
		...finalRightChildren.flat(),
	] as Node[]);
};

const matchNodes = (
	_schema: Schema,
	oldChildren: (Node | Node[])[],
	newChildren: (Node | Node[])[],
) => {
	const matches = [];
	for (
		let oldStartIndex = 0;
		oldStartIndex < oldChildren.length;
		oldStartIndex++
	) {
		const oldStartNode = oldChildren[oldStartIndex];
		const newStartIndex = findMatchNode(newChildren, oldStartNode);

		if (newStartIndex !== -1) {
			let oldEndIndex = oldStartIndex + 1;
			let newEndIndex = newStartIndex + 1;
			for (
				;
				oldEndIndex < oldChildren.length && newEndIndex < newChildren.length;
				oldEndIndex++, newEndIndex++
			) {
				const oldEndNode = oldChildren[oldEndIndex];
				if (!isNodeEqual(newChildren[newEndIndex], oldEndNode)) {
					break;
				}
			}
			matches.push({
				oldStartIndex,
				newStartIndex,
				oldEndIndex,
				newEndIndex,
				count: newEndIndex - newStartIndex,
			});
		}
	}
	return matches;
};

const findMatchNode = (
	children: (Node | Node[])[],
	node: Node | Node[],
	startIndex = 0,
) => {
	for (let i = startIndex; i < children.length; i++) {
		if (isNodeEqual(children[i], node)) {
			return i;
		}
	}
	return -1;
};

const patchRemainNodes = (
	schema: Schema,
	oldChildren: (Node | Node[])[],
	newChildren: (Node | Node[])[],
): (Node | Node[])[] => {
	const finalLeftChildren: (Node | Node[])[] = [];
	const finalRightChildren: (Node | Node[])[] = [];
	const oldChildLen = oldChildren.length;
	const newChildLen = newChildren.length;
	let left = 0;
	let right = 0;
	while (oldChildLen - left - right > 0 && newChildLen - left - right > 0) {
		const leftOldNode = oldChildren[left];
		const leftNewNode = newChildren[left];
		const rightOldNode = oldChildren[oldChildLen - right - 1];
		const rightNewNode = newChildren[newChildLen - right - 1];
		let updateLeft =
			!isTextNode(leftOldNode) && matchNodeType(leftOldNode, leftNewNode);
		let updateRight =
			!isTextNode(rightOldNode) && matchNodeType(rightOldNode, rightNewNode);
		if (Array.isArray(leftOldNode) && Array.isArray(leftNewNode)) {
			finalLeftChildren.push(
				...patchTextNodes(schema, leftOldNode, leftNewNode),
			);
			left += 1;
			continue;
		}

		if (updateLeft && updateRight) {
			const equalityLeft = computeChildEqualityFactor(leftOldNode, leftNewNode);
			const equalityRight = computeChildEqualityFactor(
				rightOldNode,
				rightNewNode,
			);
			if (equalityLeft < equalityRight) {
				updateLeft = false;
			} else {
				updateRight = false;
			}
		}
		if (updateLeft) {
			finalLeftChildren.push(
				patchDocumentNode(schema, leftOldNode as Node, leftNewNode as Node),
			);
			left += 1;
		} else if (updateRight) {
			finalRightChildren.unshift(
				patchDocumentNode(schema, rightOldNode as Node, rightNewNode as Node),
			);
			right += 1;
		} else {
			// Delete and insert
			finalLeftChildren.push(
				createDiffNode(schema, leftOldNode, DiffType.Deleted),
			);
			finalLeftChildren.push(
				createDiffNode(schema, leftNewNode, DiffType.Inserted),
			);
			left += 1;
		}
	}

	const deleteNodeLen = oldChildLen - left - right;
	const insertNodeLen = newChildLen - left - right;
	if (deleteNodeLen) {
		finalLeftChildren.push(
			...oldChildren
				.slice(left, left + deleteNodeLen)
				.flat()
				.map((node) => createDiffNode(schema, node, DiffType.Deleted)),
		);
	}

	if (insertNodeLen) {
		finalRightChildren.unshift(
			...newChildren
				.slice(left, left + insertNodeLen)
				.flat()
				.map((node) => createDiffNode(schema, node, DiffType.Inserted)),
		);
	}

	return [...finalLeftChildren, ...finalRightChildren];
};

// Updated function to perform sentence-level diffs
export const patchTextNodes = (
	schema: Schema,
	oldNode: Node[],
	newNode: Node[],
): Node[] => {
	const dmp = new diff_match_patch();

	// Concatenate the text from the text nodes
	const oldText = oldNode.map((n) => getNodeText(n)).join("");
	const newText = newNode.map((n) => getNodeText(n)).join("");

	// Tokenize the text into sentences
	const oldSentences = tokenizeSentences(oldText);
	const newSentences = tokenizeSentences(newText);

	// Map sentences to unique characters
	const { chars1, chars2, lineArray } = sentencesToChars(
		oldSentences,
		newSentences,
	);

	// Perform the diff
	const diffs = dmp.diff_main(chars1, chars2, false);

	// Convert back to sentences
	const sentenceDiffs: [number, string[]][] = diffs.map(([type, text]) => {
		const sentences = text
			.split("")
			.map((char) => lineArray[char.charCodeAt(0)]);
		return [type, sentences];
	});

	// Map diffs to nodes
	const res = sentenceDiffs.flatMap(([type, sentences]) => {
		return sentences.map((sentence) => {
			const node = createTextNode(
				schema,
				sentence,
				type !== DiffType.Unchanged ? [createDiffMark(schema, type)] : [],
			);
			return node;
		});
	});

	return res;
};

// Function to tokenize text into sentences
const tokenizeSentences = (text: string): string[] => {
	return text.match(/[^.!?]+[.!?]*\s*/g) || [];
};

// Function to map sentences to unique characters
const sentencesToChars = (oldSentences: string[], newSentences: string[]) => {
	const lineArray: string[] = [];
	const lineHash: Record<string, number> = {};
	let lineStart = 0;

	const chars1 = oldSentences
		.map((sentence) => {
			const line = sentence;
			if (line in lineHash) {
				return String.fromCharCode(lineHash[line]);
			}
			lineHash[line] = lineStart;
			lineArray[lineStart] = line;
			lineStart++;
			return String.fromCharCode(lineHash[line]);
		})
		.join("");

	const chars2 = newSentences
		.map((sentence) => {
			const line = sentence;
			if (line in lineHash) {
				return String.fromCharCode(lineHash[line]);
			}
			lineHash[line] = lineStart;
			lineArray[lineStart] = line;
			lineStart++;
			return String.fromCharCode(lineHash[line]);
		})
		.join("");

	return { chars1, chars2, lineArray };
};

export const computeChildEqualityFactor = (
	_node1: Node | Node[],
	_node2: Node | Node[],
) => {
	return 0;
};

export const assertNodeTypeEqual = (node1: Node, node2: Node) => {
	if (getNodeProperty(node1, "type") !== getNodeProperty(node2, "type")) {
		throw new Error(
			`node type not equal: ${node1.type.name} !== ${node2.type.name}`,
		);
	}
};

export const ensureArray = <T>(value: T | T[]): T[] => {
	return Array.isArray(value) ? value : [value];
};

export const isNodeEqual = (
	node1: Node | Node[],
	node2: Node | Node[],
): boolean => {
	const isNode1Array = Array.isArray(node1);
	const isNode2Array = Array.isArray(node2);
	if (isNode1Array !== isNode2Array) {
		return false;
	}
	if (isNode1Array && Array.isArray(node1) && Array.isArray(node2)) {
		return (
			node1.length === node2.length &&
			node1.every((node, index) => isNodeEqual(node, node2[index]))
		);
	}

	if (
		!isNode1Array &&
		!isNode2Array &&
		node1 instanceof Node &&
		node2 instanceof Node
	) {
		const type1 = getNodeProperty(node1, "type");
		const type2 = getNodeProperty(node2, "type");
		if (type1 !== type2) {
			return false;
		}
		if (isTextNode(node1)) {
			const text1 = getNodeProperty(node1, "text");
			const text2 = getNodeProperty(node2, "text");
			if (text1 !== text2) {
				return false;
			}
		}
		const attrs1 = getNodeAttributes(node1);
		const attrs2 = getNodeAttributes(node2);
		const attrs = [
			...new Set([...Object.keys(attrs1), ...Object.keys(attrs2)]),
		];
		for (const attr of attrs) {
			if (attrs1[attr] !== attrs2[attr]) {
				return false;
			}
		}
		const marks1 = getNodeMarks(node1);
		const marks2 = getNodeMarks(node2);
		if (marks1.length !== marks2.length) {
			return false;
		}
		for (let i = 0; i < marks1.length; i++) {
			if (!marks1[i].eq(marks2[i])) {
				return false;
			}
		}
		const children1 = getNodeChildren(node1);
		const children2 = getNodeChildren(node2);
		if (children1.length !== children2.length) {
			return false;
		}
		for (let i = 0; i < children1.length; i++) {
			if (!isNodeEqual(children1[i], children2[i])) {
				return false;
			}
		}
		return true;
	} else if (node1 instanceof Mark && node2 instanceof Mark) {
		// Handle Mark equality if passed
		return node1.eq(node2);
	}

	return false;
};

export const normalizeNodeContent = (node: Node): (Node | Node[])[] => {
	const content = getNodeChildren(node) ?? [];
	const res: (Node | Node[])[] = [];
	for (let i = 0; i < content.length; i++) {
		const child = content[i];
		if (isTextNode(child)) {
			const textNodes: Node[] = [];
			for (
				let textNode = content[i];
				i < content.length && isTextNode(textNode);
				textNode = content[++i]
			) {
				textNodes.push(textNode);
			}
			i--;
			res.push(textNodes);
		} else {
			res.push(child);
		}
	}
	return res;
};

export const getNodeProperty = (node: Node, property: string) => {
	if (property === "type") {
		return node.type?.name;
	}
	// @ts-expect-error - dynamic access
	return node[property];
};

export const getNodeAttribute = (node: Node, attribute: string) =>
	node.attrs ? node.attrs[attribute] : undefined;

export const getNodeAttributes = (node: Node) => (node.attrs ? node.attrs : {});

export const getNodeMarks = (node: Node) => node.marks ?? [];

export const getNodeChildren = (node: Node): Node[] => {
	// Prosemirror Node content is a Fragment, which has content property but we access it via array methods usually
	// But here the original code accessed content.content
	// Fragment.content is the array of nodes
	// @ts-expect-error - private property access pattern from original code
	return node.content?.content ?? [];
};

export const getNodeText = (node: Node) => node.text || "";

export const isTextNode = (node: Node | Node[]): boolean => {
	if (Array.isArray(node)) return false;
	return node.type?.name === "text";
};

export const matchNodeType = (
	node1: Node | Node[],
	node2: Node | Node[],
): boolean => {
	if (Array.isArray(node1) && Array.isArray(node2)) return true;
	if (node1 instanceof Node && node2 instanceof Node) {
		return node1.type?.name === node2.type?.name;
	}
	return false;
};

export const createNewNode = (oldNode: Node, children: Node[]) => {
	if (!oldNode.type) {
		throw new Error("oldNode.type is undefined");
	}
	return oldNode.type.create(
		oldNode.attrs,
		Fragment.fromArray(children),
		oldNode.marks,
	);
};

export const createDiffNode = (
	schema: Schema,
	node: Node | Node[],
	type: DiffType,
): Node => {
	if (Array.isArray(node)) {
		throw new Error("createDiffNode does not support array");
	}

	return mapDocumentNode(node, (currentNode) => {
		if (isTextNode(currentNode)) {
			return createTextNode(schema, getNodeText(currentNode), [
				...(currentNode.marks || []),
				createDiffMark(schema, type),
			]);
		}
		return currentNode;
	});
};

function mapDocumentNode(node: Node, mapper: (node: Node) => Node): Node {
	const children: Node[] = [];
	node.content.forEach((child) => {
		children.push(mapDocumentNode(child, mapper));
	});

	const copy = node.copy(Fragment.from(children.filter((n) => n)));
	return mapper(copy) || copy;
}

export const createDiffMark = (schema: Schema, type: number): Mark => {
	if (type === DiffType.Inserted) {
		return schema.mark("diffMark", { type });
	}
	if (type === DiffType.Deleted) {
		return schema.mark("diffMark", { type });
	}
	throw new Error("type is not valid");
};

export const createTextNode = (
	schema: Schema,
	content: string,
	marks: Mark[] = [],
): Node => {
	return schema.text(content, marks);
};

export const diffEditor = (
	schema: Schema,
	oldDoc: { [key: string]: any },
	newDoc: { [key: string]: any },
): Node => {
	const oldNode = Node.fromJSON(schema, oldDoc);
	const newNode = Node.fromJSON(schema, newDoc);
	return patchDocumentNode(schema, oldNode, newNode);
};
