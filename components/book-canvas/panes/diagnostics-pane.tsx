"use client";

import {
  AlertTriangleIcon,
  CheckCircleIcon,
  InfoIcon,
  SparklesIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type ReadinessScore = {
  label: string;
  score: number;
  feedback: string;
  color: string;
};

const mockScores: ReadinessScore[] = [
  {
    label: "Characters",
    score: 0,
    feedback: "Start by creating your cast",
    color: "bg-rose-500",
  },
  {
    label: "World",
    score: 0,
    feedback: "Add locations and lore",
    color: "bg-amber-500",
  },
  {
    label: "Plot",
    score: 0,
    feedback: "Create an outline",
    color: "bg-blue-500",
  },
];

function ScoreRing({
  score,
  label,
  color,
}: {
  score: number;
  label: string;
  color: string;
}) {
  const getScoreClass = (s: number) => {
    if (s >= 70) return "text-green-600 dark:text-green-400";
    if (s >= 40) return "text-amber-600 dark:text-amber-400";
    return "text-muted-foreground";
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative flex h-14 w-14 items-center justify-center">
        <svg className="-rotate-90 h-full w-full" viewBox="0 0 36 36">
          <path
            className="stroke-muted"
            d="M18 2.5 a 15.5 15.5 0 1 1 0 31 a 15.5 15.5 0 1 1 0 -31"
            fill="none"
            strokeWidth="3"
          />
          <path
            className={color.replace("bg-", "stroke-")}
            d="M18 2.5 a 15.5 15.5 0 1 1 0 31 a 15.5 15.5 0 1 1 0 -31"
            fill="none"
            strokeDasharray={`${score}, 100`}
            strokeLinecap="round"
            strokeWidth="3"
          />
        </svg>
        <span
          className={cn("absolute font-semibold text-sm", getScoreClass(score))}
        >
          {score}
        </span>
      </div>
      <span className="text-muted-foreground text-xs">{label}</span>
    </div>
  );
}

export function DiagnosticsPane() {
  const overallScore = Math.round(
    mockScores.reduce((acc, s) => acc + s.score, 0) / mockScores.length
  );
  const hasWarnings = overallScore < 40;
  const hasContent = overallScore > 0;

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <h3 className="font-semibold text-lg">Readiness</h3>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs",
            overallScore >= 60
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : overallScore >= 30
                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                : "bg-muted text-muted-foreground"
          )}
        >
          {overallScore}% Ready
        </span>
      </div>

      {/* Score Rings */}
      <div className="flex justify-around rounded-lg border bg-muted/20 p-4">
        {mockScores.map((score) => (
          <ScoreRing
            color={score.color}
            key={score.label}
            label={score.label}
            score={score.score}
          />
        ))}
      </div>

      {/* Feedback Items */}
      <div className="space-y-2">
        {mockScores.map((score) => (
          <div
            className="flex items-start gap-2 rounded-lg border bg-background p-3"
            key={score.label}
          >
            <div
              className={cn(
                "mt-0.5 h-2 w-2 rounded-full",
                score.score >= 60
                  ? "bg-green-500"
                  : score.score >= 30
                    ? "bg-amber-500"
                    : "bg-muted-foreground/30"
              )}
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{score.label}</span>
                <span className="text-muted-foreground text-xs">
                  {score.score}%
                </span>
              </div>
              <p className="text-muted-foreground text-xs">{score.feedback}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Info/Warning Box */}
      {hasContent ? (
        hasWarnings ? (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30">
            <AlertTriangleIcon className="mt-0.5 h-4 w-4 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="font-medium text-amber-900 text-sm dark:text-amber-100">
                Low Readiness
              </p>
              <p className="text-amber-700 text-xs dark:text-amber-300">
                You can still write, but adding more content will improve
                quality.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950/30">
            <CheckCircleIcon className="mt-0.5 h-4 w-4 text-green-600 dark:text-green-400" />
            <div>
              <p className="font-medium text-green-900 text-sm dark:text-green-100">
                Good to Write!
              </p>
              <p className="text-green-700 text-xs dark:text-green-300">
                Your world is well-prepared for chapter generation.
              </p>
            </div>
          </div>
        )
      ) : (
        <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950/30">
          <SparklesIcon className="mt-0.5 h-4 w-4 text-blue-600 dark:text-blue-400" />
          <div>
            <p className="font-medium text-blue-900 text-sm dark:text-blue-100">
              Getting Started
            </p>
            <p className="text-blue-700 text-xs dark:text-blue-300">
              Start chatting to build your story. Ask me to create characters,
              locations, or dive right into writing!
            </p>
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="flex flex-col gap-2">
        <Button className="w-full" size="sm" variant="outline">
          <InfoIcon className="mr-1.5 h-3.5 w-3.5" />
          Ask AI to Assess Readiness
        </Button>
        {overallScore < 60 && (
          <p className="text-center text-muted-foreground text-xs">
            You can always proceed — these are just suggestions!
          </p>
        )}
      </div>
    </div>
  );
}
