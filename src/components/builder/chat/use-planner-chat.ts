"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
	chatWithPlannerAction,
	createPlannerSessionAction,
	executePlannerPlanAction,
	getPlannerSessionAction,
} from "@/app/actions/planner";
import type { MessagePart } from "@/lib/types/message";

export interface Message {
	id: string;
	role: "user" | "assistant";
	content: string;
	parts?: MessagePart[];
	createdAt: Date;
	isOptimistic?: boolean;
}

export interface ProposedPlan {
	title: string;
	description: string;
	tasks: Array<{ title: string; description: string }>;
}

export function usePlannerChat(initialSessionId?: string) {
	const [sessionId, setSessionId] = useState<string | undefined>(
		initialSessionId,
	);
	const [input, setInput] = useState("");
	const [messages, setMessages] = useState<Message[]>([]);
	const [proposedPlan, setProposedPlan] = useState<ProposedPlan | null>(null);
	const queryClient = useQueryClient();

	// 1. Fetch Session & Messages
	const { data, isLoading: isLoadingHistory } = useQuery({
		queryKey: ["planner", "session", sessionId],
		queryFn: async () => {
			if (!sessionId) return null;
			const res = await getPlannerSessionAction({ sessionId });
			if (!res.success) throw new Error(res.error);
			return res.data;
		},
		enabled: !!sessionId,
	});

	// Update local messages when data is loaded
	useEffect(() => {
		if (data?.messages) {
			const mappedMessages: Message[] = data.messages.map((m: any) => ({
				id: m.id,
				role: m.role as "user" | "assistant",
				content: m.parts?.find((p: any) => p.type === "text")?.text || "",
				parts: m.parts as MessagePart[],
				createdAt: new Date(m.createdAt),
			}));

			setMessages(mappedMessages);

			// Find latest plan proposal (moved outside map to avoid side effects in map)
			const latestToolCall = mappedMessages
				.flatMap((m) => m.parts || [])
				.filter(
					(p): p is MessagePart & { type: "tool-invocation" } =>
						p.type === "tool-invocation" && p.toolName === "propose_plan",
				)
				.pop();

			if (latestToolCall) {
				setProposedPlan(latestToolCall.args);
			}
		}
	}, [data]);

	// 2. Create Session Mutation
	const { mutateAsync: createSession } = useMutation({
		mutationFn: async () => {
			const res = await createPlannerSessionAction({});
			if (!res.success) throw new Error(res.error);
			return res.data;
		},
	});

	// 3. Send Message Mutation
	const { mutate: sendMessage, isPending: isSending } = useMutation({
		mutationFn: async (content: string) => {
			let currentSessionId = sessionId;
			if (!currentSessionId) {
				const session = await createSession();
				currentSessionId = session.id;
				setSessionId(currentSessionId);
			}

			if (!currentSessionId) throw new Error("Failed to initialize session");

			const res = await chatWithPlannerAction({
				sessionId: currentSessionId,
				content,
			});
			if (!res.success) throw new Error(res.error);
			return { data: res.data, sessionId: currentSessionId };
		},
		onMutate: async (content) => {
			// Optimistic update
			const tempId = crypto.randomUUID();
			const newMessage: Message = {
				id: tempId,
				role: "user",
				content,
				createdAt: new Date(),
				isOptimistic: true,
			};
			setMessages((prev) => [...prev, newMessage]);
			setInput("");
			return { tempId };
		},
		onSuccess: (result, _vars, context) => {
			const { data, sessionId: usedSessionId } = result;

			// Check for tool calls in the response
			const toolCall = data.parts?.find(
				(p: any) =>
					p.type === "tool-invocation" && p.toolName === "propose_plan",
			);
			if (toolCall) {
				setProposedPlan(toolCall.args);
			}

			const assistantMsg: Message = {
				id: data.id,
				role: "assistant",
				content: data.parts?.find((p: any) => p.type === "text")?.text || "",
				parts: data.parts as MessagePart[],
				createdAt: new Date(data.createdAt),
			};

			setMessages((prev) => {
				// Remove optimistic user message (optional, or update ID)
				return prev
					.map((m) =>
						m.id === context?.tempId ? { ...m, isOptimistic: false } : m,
					)
					.concat(assistantMsg);
			});

			// Invalidate to be sure
			queryClient.invalidateQueries({
				queryKey: ["planner", "session", usedSessionId],
			});
		},
		onError: (_err, _vars, context) => {
			toast.error("Failed to send message");
			setMessages((prev) => prev.filter((m) => m.id !== context?.tempId));
		},
	});

	// 4. Execute Plan Mutation
	const { mutate: executePlan, isPending: isExecuting } = useMutation({
		mutationFn: async () => {
			if (!sessionId || !proposedPlan) throw new Error("No plan to execute");

			// Capture plan before async operation to avoid race conditions
			const currentPlan = proposedPlan;

			const res = await executePlannerPlanAction({
				sessionId,
				plan: currentPlan,
			});
			if (!res.success) throw new Error(res.error);
			return { data: res.data, plan: currentPlan };
		},
		onSuccess: ({ data, plan }) => {
			toast.success(`Plan executed! Created Epic #${data.issues.parentNumber}`);
			setProposedPlan(null);

			// Add a local system message for feedback
			const sysMsg: Message = {
				id: crypto.randomUUID(),
				role: "assistant",
				content: `Plan executed successfully! \n\nStarted working on **${plan.title}**.\n\n[View Epic #${data.issues.parentNumber}](/builder)`,
				createdAt: new Date(),
			};
			setMessages((prev) => [...prev, sysMsg]);

			// Force refresh of board?
			queryClient.invalidateQueries({ queryKey: ["github", "issues"] });
			queryClient.invalidateQueries({ queryKey: ["jules", "sessions"] });
		},
		onError: (err) => {
			toast.error(`Execution failed: ${err.message}`);
		},
	});

	return {
		sessionId,
		messages,
		input,
		setInput,
		sendMessage,
		isSending,
		proposedPlan,
		executePlan,
		isExecuting,
		isLoadingHistory,
	};
}
