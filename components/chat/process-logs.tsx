"use client";

import { Loader2 } from "lucide-react";

export type ProcessLog = {
  type: "tool-log";
  message: string;
  tool: string;
  timestamp: number;
};

export function ProcessLogs({ logs }: { logs: ProcessLog[] }) {
  if (logs.length === 0) return null;

  const lastLog = logs[logs.length - 1];

  return (
    <div className="mt-2 flex w-full flex-col gap-1 rounded-md border border-border/50 bg-muted/30 px-3 py-2 text-sm">
      <div className="flex items-center gap-2 text-foreground/80">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
        <span className="font-mono text-xs font-medium uppercase text-primary/80">
          {lastLog.tool}
        </span>
        <span className="truncate">{lastLog.message}</span>
      </div>
      {logs.length > 1 && (
        <div className="flex flex-col gap-0.5 pl-[22px] text-xs text-muted-foreground">
          {logs
            .slice(0, -1)
            .slice(-2) // Show last 2 previous logs
            .map((log, i) => (
              <div key={i} className="truncate opacity-70">
                {log.message}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
