import type { ChatMessage } from "@/lib/types";

export interface ExportFormat {
	name: string;
	extension: string;
	mimeType: string;
}

export const EXPORT_FORMATS = {
	MARKDOWN: {
		name: "Markdown",
		extension: "md",
		mimeType: "text/markdown",
	},
	JSON: {
		name: "JSON",
		extension: "json",
		mimeType: "application/json",
	},
	TEXT: {
		name: "Plain Text",
		extension: "txt",
		mimeType: "text/plain",
	},
	HTML: {
		name: "HTML",
		extension: "html",
		mimeType: "text/html",
	},
} as const;

/**
 * Extract text content from a message
 */
function getMessageText(message: ChatMessage): string {
	if (message.parts && message.parts.length > 0) {
		return message.parts
			.filter((part) => part.type === "text")
			.map((part) => part.text)
			.join("\n\n");
	}
	return message.content || "";
}

/**
 * Format timestamp for export
 */
function formatTimestamp(date: Date): string {
	return new Intl.DateTimeFormat("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	}).format(date);
}

/**
 * Export conversation as Markdown
 */
export function exportAsMarkdown(messages: ChatMessage[]): string {
	let markdown = "# Conversation Export\n\n";
	markdown += `*Exported on ${formatTimestamp(new Date())}*\n\n`;
	markdown += "---\n\n";

	for (const message of messages) {
		const role = message.role === "user" ? "**You**" : "**Assistant**";
		const text = getMessageText(message);
		const timestamp = message.createdAt
			? formatTimestamp(new Date(message.createdAt))
			: "";

		markdown += `### ${role}\n`;
		if (timestamp) {
			markdown += `*${timestamp}*\n\n`;
		}
		markdown += `${text}\n\n`;
		markdown += "---\n\n";
	}

	return markdown;
}

/**
 * Export conversation as JSON
 */
export function exportAsJSON(messages: ChatMessage[]): string {
	const exportData = {
		exportedAt: new Date().toISOString(),
		messageCount: messages.length,
		messages: messages.map((msg) => ({
			id: msg.id,
			role: msg.role,
			content: getMessageText(msg),
			createdAt: msg.createdAt,
			usage: msg.usage,
		})),
	};

	return JSON.stringify(exportData, null, 2);
}

/**
 * Export conversation as plain text
 */
export function exportAsText(messages: ChatMessage[]): string {
	let text = `CONVERSATION EXPORT\n`;
	text += `Exported: ${formatTimestamp(new Date())}\n`;
	text += `${"=".repeat(60)}\n\n`;

	for (const message of messages) {
		const role = message.role === "user" ? "YOU" : "ASSISTANT";
		const content = getMessageText(message);
		const timestamp = message.createdAt
			? formatTimestamp(new Date(message.createdAt))
			: "";

		text += `[${role}]`;
		if (timestamp) {
			text += ` - ${timestamp}`;
		}
		text += `\n${content}\n\n`;
		text += `${"-".repeat(60)}\n\n`;
	}

	return text;
}

/**
 * Export conversation as HTML
 */
export function exportAsHTML(messages: ChatMessage[]): string {
	const timestamp = formatTimestamp(new Date());

	let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Conversation Export</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            line-height: 1.6;
            color: #333;
            background: #f9fafb;
        }
        .header {
            text-align: center;
            margin-bottom: 3rem;
            padding-bottom: 1rem;
            border-bottom: 2px solid #e5e7eb;
        }
        .header h1 {
            margin: 0 0 0.5rem 0;
            color: #111827;
        }
        .timestamp {
            color: #6b7280;
            font-size: 0.875rem;
        }
        .message {
            background: white;
            border-radius: 0.75rem;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .message-header {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 1rem;
        }
        .role {
            font-weight: 600;
            font-size: 0.875rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .role.user {
            color: #2563eb;
        }
        .role.assistant {
            color: #7c3aed;
        }
        .message-timestamp {
            color: #9ca3af;
            font-size: 0.75rem;
        }
        .message-content {
            color: #374151;
            white-space: pre-wrap;
        }
        pre {
            background: #f3f4f6;
            padding: 1rem;
            border-radius: 0.5rem;
            overflow-x: auto;
        }
        code {
            font-family: 'Monaco', 'Courier New', monospace;
            font-size: 0.875rem;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Conversation Export</h1>
        <div class="timestamp">Exported on ${timestamp}</div>
    </div>
    <div class="messages">
`;

	for (const message of messages) {
		const role = message.role;
		const content = getMessageText(message);
		const messageTimestamp = message.createdAt
			? formatTimestamp(new Date(message.createdAt))
			: "";

		html += `
        <div class="message">
            <div class="message-header">
                <span class="role ${role}">${role === "user" ? "You" : "Assistant"}</span>
                ${messageTimestamp ? `<span class="message-timestamp">${messageTimestamp}</span>` : ""}
            </div>
            <div class="message-content">${content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
        </div>
`;
	}

	html += `
    </div>
</body>
</html>`;

	return html;
}

/**
 * Download content as a file
 */
export function downloadFile(
	content: string,
	filename: string,
	mimeType: string
): void {
	const blob = new Blob([content], { type: mimeType });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

/**
 * Export conversation in the specified format
 */
export function exportConversation(
	messages: ChatMessage[],
	format: keyof typeof EXPORT_FORMATS,
	filename = "conversation"
): void {
	const formatConfig = EXPORT_FORMATS[format];
	let content: string;

	switch (format) {
		case "MARKDOWN":
			content = exportAsMarkdown(messages);
			break;
		case "JSON":
			content = exportAsJSON(messages);
			break;
		case "TEXT":
			content = exportAsText(messages);
			break;
		case "HTML":
			content = exportAsHTML(messages);
			break;
		default:
			throw new Error(`Unsupported format: ${format}`);
	}

	const fullFilename = `${filename}.${formatConfig.extension}`;
	downloadFile(content, fullFilename, formatConfig.mimeType);
}
