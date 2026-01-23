"use client";

import { CheckCircle, Hammer, Loader2, Play } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/atoms/card";
import { ScrollArea } from "@/components/atoms/scroll-area";
import type { ProposedPlan } from "./use-planner-chat";

interface PlanProposalCardProps {
    plan: ProposedPlan;
    onExecute: () => void;
    isExecuting: boolean;
}

export function PlanProposalCard({ plan, onExecute, isExecuting }: PlanProposalCardProps) {
    return (
        <Card className="w-full border-primary/20 bg-primary/5 shadow-sm">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Hammer className="w-5 h-5 text-primary" />
                            Proposed Feature Plan
                        </CardTitle>
                        <CardDescription>
                            Review the breakdown before sending to Jules.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <h3 className="font-semibold">{plan.title}</h3>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>

                <div className="space-y-2">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-muted-foreground" />
                        Tasks ({plan.tasks.length})
                    </h4>
                    <ScrollArea className="h-[200px] w-full rounded-md border bg-background p-2">
                        <div className="space-y-2">
                            {plan.tasks.map((task, i) => (
                                <div key={i} className="p-2 rounded-lg bg-muted/50 text-sm">
                                    <div className="font-medium">{task.title}</div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        {task.description}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </CardContent>
            <CardFooter className="justify-end gap-2 pt-0 pb-4">
                <Button
                    onClick={onExecute}
                    disabled={isExecuting}
                    className="gap-2"
                >
                    {isExecuting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Play className="w-4 h-4" />
                    )}
                    Execute Plan
                </Button>
            </CardFooter>
        </Card>
    );
}
