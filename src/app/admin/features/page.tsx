import { GlassCard } from "@/components/molecules/glass-card";
import { Button } from "@/components/atoms/button";
import { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/atoms/card";
import { Bot, Github, Terminal, Settings2 } from "lucide-react";

export default function FeaturesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Features & Integrations</h1>
        <p className="text-muted-foreground mt-2">
          Manage system-wide features and external integrations.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Jules API Interaction Placeholder */}
        <GlassCard variant="liquid" className="flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Bot className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">Jules Agent Console</CardTitle>
            </div>
            <CardDescription>
              Interact directly with the system agent to generate new features or run diagnostics.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto pt-4">
             <Button className="w-full" variant="secondary">
                <Terminal className="mr-2 h-4 w-4" />
                Open Console
             </Button>
          </CardContent>
        </GlassCard>

        {/* GitHub Integration Placeholder */}
        <GlassCard variant="liquid" className="flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-zinc-800/10 dark:bg-zinc-100/10 rounded-lg">
                <Github className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">GitHub Integration</CardTitle>
            </div>
            <CardDescription>
              Sync repository data, manage pull requests, and trigger CI/CD pipelines.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto pt-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-muted-foreground font-medium">System Connected</span>
            </div>
            <Button className="w-full" variant="outline">
              Manage Sync Settings
            </Button>
          </CardContent>
        </GlassCard>

        {/* Feature Flags / System Config Placeholder */}
        <GlassCard variant="liquid" className="flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                <Settings2 className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">System Configuration</CardTitle>
            </div>
            <CardDescription>
              Toggle global features, manage maintenance mode, and configure API limits.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto pt-4">
             <Button className="w-full" variant="outline">
                View Configuration
             </Button>
          </CardContent>
        </GlassCard>
      </div>
    </div>
  );
}

