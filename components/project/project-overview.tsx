"use client";

import {
  BookOpen,
  Copy,
  Edit,
  LayoutDashboard,
  Loader2,
  PenTool,
  GitBranch,
  Map,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { forkProject } from "@/app/actions/projects";
import { fetchGraphData, branchTimeline } from "@/app/actions/timeline";
import { QUERY_KEYS } from "@/lib/query-options";
import type { Project } from "@/lib/db/schema";

import { DashboardSheet } from "@/components/dashboard/dashboard-sheet";
import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { GlassCard } from "@/components/ui/glass-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MultiverseMap } from "@/components/timeline/multiverse-map";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ChapterWithContent {
  id: string;
  title: string;
  sequence: number;
  content: string | null;
}

interface ProjectOverviewProps {
  project: Project;
  isOwner: boolean;
  chapters: ChapterWithContent[];
}

export function ProjectOverview({
  project,
  isOwner,
  chapters,
}: ProjectOverviewProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // State
  const [isForking, setIsForking] = useState(false);
  const [activeChapterId, setActiveChapterId] = useState<string | null>(
    chapters.length > 0 ? chapters[0].id : null
  );
  const [viewMode, setViewMode] = useState<"reader" | "map">("reader");
  
  // Branching/Map State
  const [branchDialogOpen, setBranchDialogOpen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [branchDecision, setBranchDecision] = useState("");
  // unused in conflict but kept for safety if needed later: 
  // const [branchingSummary, setBranchingSummary] = useState<string | null>(null);

  const { data: graphData, isLoading: isGraphLoading } = useQuery({
    queryKey: QUERY_KEYS.timeline(project.id),
    queryFn: () => fetchGraphData(project.id),
    enabled: viewMode === "map",
  });

  const branchMutation = useMutation({
    mutationFn: branchTimeline,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.timeline(project.id),
      });
      setBranchDialogOpen(false);
      setBranchDecision("");
      toast.success("New timeline branch created!");
    },
    onError: (error) => {
      toast.error("Failed to create branch: " + error.message);
    },
  });

  const handleFork = async () => {
    setIsForking(true);
    try {
      const result = await forkProject(project.id);
      if ("error" in result && result.error) {
        toast.error(result.error);
      } else if ("projectId" in result) {
        toast.success("Project forked successfully!");
        router.push(`/projects/${result.projectId}`);
      }
    } catch (_error) {
      toast.error("Failed to fork project");
    } finally {
      setIsForking(false);
    }
  };

  const handleNodeClick = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    // Find node details to maybe show summary or allow jumping
    const node = graphData?.nodes.find((n) => n.id === nodeId);
    if (node && node.summary) {
      toast.info(`Selected Node: ${node.summary}`);
    }
    setBranchDialogOpen(true);
  };

  const handleCreateBranch = () => {
    if (!selectedNodeId || !branchDecision) return;
    branchMutation.mutate({
      projectId: project.id,
      parentNodeId: selectedNodeId,
      decisionText: branchDecision,
    });
  };

  const activeChapter = chapters.find((c) => c.id === activeChapterId);

  return (
    <PageContainer className="p-8">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-8 gap-4">
        <div>
          <PageHeader title={project.name} />
          <p className="text-muted-foreground mt-2 max-w-2xl">
            {project.description || "No description provided."}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          {isOwner ? (
            <>
              <DashboardSheet
                projectId={project.id}
                trigger={
                  <Button variant="outline" className="glass-panel">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                }
              />
              <Button
                onClick={() => router.push(`/projects/${project.id}/generate`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Open Workspace
              </Button>
            </>
          ) : (
            <Button onClick={handleFork} disabled={isForking}>
              {isForking ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Copy className="mr-2 h-4 w-4" />
              )}
              Fork Project
            </Button>
          )}
        </div>
      </div>

      <Tabs
        value={viewMode}
        onValueChange={(v) => setViewMode(v as "reader" | "map")}
        className="w-full"
      >
        <TabsList className="mb-6">
          <TabsTrigger value="reader" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Reader
          </TabsTrigger>
          <TabsTrigger value="map" className="flex items-center gap-2">
            <GitBranch className="w-4 h-4" />
            Multiverse Map
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reader">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar / Chapter List */}
            <div className="lg:col-span-1 space-y-4">
              <GlassCard className="p-4 sticky top-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Chapters
                </h3>
                <div className="space-y-1 max-h-[calc(100vh-300px)] overflow-y-auto">
                  {chapters.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed border-muted/50 rounded-lg bg-muted/5">
                      <BookOpen className="h-8 w-8 mb-2 text-muted-foreground/30" />
                      <p className="text-xs text-muted-foreground">
                        No chapters yet
                      </p>
                    </div>
                  )}
                  {chapters.map((chapter) => (
                    <button
                      key={chapter.id}
                      type="button"
                      onClick={() => setActiveChapterId(chapter.id)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        activeChapterId === chapter.id
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      {chapter.title}
                    </button>
                  ))}
                </div>
              </GlassCard>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-3">
              {activeChapter ? (
                <GlassCard className="p-8 min-h-[500px]">
                  <h2 className="text-2xl font-serif font-bold mb-6 text-center">
                    {activeChapter.title}
                  </h2>
                  <div className="prose dark:prose-invert max-w-none font-serif leading-relaxed">
                    {activeChapter.content ? (
                      activeChapter.content.split("\n").map((para, i) =>
                        para.trim() ? (
                          <p
                            key={i}
                            className="mb-4 hover:bg-primary/5 p-1 rounded cursor-pointer transition-colors"
                            title="Click to branch from here (coming soon)"
                          >
                            {para}
                          </p>
                        ) : (
                          <br key={i} />
                        )
                      )
                    ) : (
                      <p className="text-muted-foreground italic text-center mt-12">
                        No content drafted for this chapter.
                      </p>
                    )}
                  </div>
                </GlassCard>
              ) : (
                <EmptyState
                  icon={BookOpen}
                  title="No chapter selected"
                  description={
                    chapters.length === 0
                      ? "This project has no chapters yet. Start writing to bring your world to life."
                      : "Select a chapter from the sidebar to start reading."
                  }
                  action={
                    chapters.length === 0 && isOwner ? (
                      <Button
                        onClick={() =>
                          router.push(`/projects/${project.id}/generate`)
                        }
                      >
                        <PenTool className="mr-2 h-4 w-4" />
                        Start Writing
                      </Button>
                    ) : null
                  }
                  className="h-[500px]"
                />
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="map">
          <GlassCard className="p-4 h-[700px]">
            {isGraphLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <MultiverseMap
                nodes={graphData?.nodes || []}
                branches={graphData?.branches || []}
                onNodeClick={handleNodeClick}
              />
            )}
          </GlassCard>
        </TabsContent>
      </Tabs>

      <Dialog open={branchDialogOpen} onOpenChange={setBranchDialogOpen}>
        <DialogContent className="glass-panel">
          <DialogHeader>
            <DialogTitle>Create a Divergence</DialogTitle>
            <DialogDescription>
              What if things happened differently? Enter a decision to branch the
              timeline.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>The Twist</Label>
              <Input
                placeholder="e.g., The hero spares the villain..."
                value={branchDecision}
                onChange={(e) => setBranchDecision(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBranchDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateBranch}
              disabled={branchMutation.isPending || !branchDecision}
            >
              {branchMutation.isPending && (
                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
              )}
              Branch Timeline
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}