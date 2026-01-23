export type MessagePart =
	| {
			type: "text";
			text: string;
	  }
	| {
			type: "tool-invocation";
			toolCallId: string;
			toolName: string;
			args: any;
	  };
