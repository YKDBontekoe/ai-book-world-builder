"use client";

import type { JSX } from "react";
import { Loader2, Send, Plus } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { ChatMessageList } from "./chat-message-list";
import { PlanProposalCard } from "./plan-proposal-card";
import { usePlannerChat } from "./use-planner-chat";
import { GlassCard } from "@/components/molecules/glass-card";

export function BuilderChatView(): JSX.Element {
    const {
        messages,
        input,
        setInput,
        sendMessage,
        isSending,
        proposedPlan,
        executePlan,
        isExecuting,
        sessionId,
    } = usePlannerChat(); // We let it manage its own session state (empty initially)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isSending) return;
        sendMessage(input);
    };

    return (
        <div className="flex h-full gap-4">
            {/* Left: Chat Interface */}
            <div className="flex-1 flex flex-col min-w-0">
                 <GlassCard className="flex-1 flex flex-col min-h-0 p-0 overflow-hidden">
                    {/* Header */}
                    <div className="p-3 border-b flex items-center justify-between bg-muted/20">
                        <div className="flex items-center gap-2">
                             <h3 className="font-semibold text-sm">Jules Planner</h3>
                             {sessionId && <span className="text-xs text-muted-foreground font-mono">#{sessionId.slice(0,8)}</span>}
                        </div>
                        {/* Future: Add 'New Session' button to reset state */}
                    </div>

                    <ChatMessageList messages={messages} />

                    {/* Input Area */}
                    <div className="p-4 border-t bg-background/50">
                        <form onSubmit={handleSubmit} className="flex gap-2">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Describe the feature you want to build..."
                                disabled={isSending}
                                className="flex-1"
                                autoFocus
                            />
                            <Button
                                type="submit"
                                size="icon"
                                disabled={!input.trim() || isSending}
                                aria-label="Send message"
                            >
                                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            </Button>
                        </form>
                    </div>
                </GlassCard>
            </div>

            {/* Right: Plan Preview (Visible when plan exists or permanent placeholder) */}
            <div className="w-[400px] flex-shrink-0 flex flex-col gap-4">
                {proposedPlan ? (
                    <div className="h-full overflow-y-auto pb-2">
                        <PlanProposalCard
                            plan={proposedPlan}
                            onExecute={() => executePlan()}
                            isExecuting={isExecuting}
                        />
                    </div>
                ) : (
                    <GlassCard className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground border-dashed">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                            <Plus className="w-6 h-6 opacity-50" />
                        </div>
                        <h4 className="font-medium mb-1">No Plan Drafted</h4>
                        <p className="text-sm opacity-70">
                            Ask Jules to "plan a feature" to see the breakdown here.
                        </p>
                    </GlassCard>
                )}
            </div>
        </div>
    );
}
