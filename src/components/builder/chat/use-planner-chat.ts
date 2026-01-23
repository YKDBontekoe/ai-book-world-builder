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

export interface Message {
	id: string;
	role: "user" | "assistant";
	content: string;
	parts?: any[];
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
			const mappedMessages: Message[] = data.messages.map((m: any) => {
				// Check for tool calls in parts
				const toolCall = m.parts?.find(
					(p: any) =>
						p.type === "tool-invocation" && p.toolName === "propose_plan",
				);
				if (toolCall) {
					setProposedPlan(toolCall.args);
				}

				return {
					id: m.id,
					role: m.role as "user" | "assistant",
					content: m.parts?.find((p: any) => p.type === "text")?.text || "",
					parts: m.parts,
					createdAt: new Date(m.createdAt),
				};
			});
			setMessages(mappedMessages);
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
				// Update URL without refresh? Or assume parent handles it?
				// For now, local state is enough.
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
				parts: data.parts as any[], // Casting for now
				createdAt: new Date(data.createdAt),
			};

			setMessages((prev) => {
				// Remove optimistic user message (optional, or update ID)
				// Actually, since we don't return the USER message from the action,
				// we should keep the optimistic one but mark it non-optimistic?
				// Or better: invalidate query.
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
			const res = await executePlannerPlanAction({
				sessionId,
				plan: proposedPlan,
			});
			if (!res.success) throw new Error(res.error);
			return res.data;
		},
		onSuccess: (data) => {
			toast.success(`Plan executed! Created Epic #${data.issues.parentNumber}`);
			setProposedPlan(null); // Clear plan after execution? Or keep it?
			// Maybe add a system message saying it was executed?

			// Add a local system message for feedback
			const sysMsg: Message = {
				id: crypto.randomUUID(),
				role: "assistant",
				content: `Plan executed successfully! \n\nStarted working on **${proposedPlan?.title}**.\n\n[View Epic #${data.issues.parentNumber}](/builder)`, // We can linkify this later
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
