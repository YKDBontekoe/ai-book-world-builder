"use client";

import {
	Book,
	FileText,
	LayoutDashboard,
	Lock,
	PanelLeftClose,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/atoms/button";
import { SceneNavigation } from "@/features/writer/components/left-sidebar/scene-navigation";
import { StructureEditorDialog } from "@/features/writer/components/structure-editor-dialog";
import { useWriterContext } from "@/features/writer/components/writer-context";
import { useWriterLayoutContext } from "@/features/writer/components/writer-layout-context";

export function WriterSidebar() {
	const { toggleSidebar } = useWriterLayoutContext();
	const {
		project,
		structure,
		structureText,
		loading,
		fetchStructure,
		isReadOnly,
		activeSceneId,
		setActiveSceneId,
	} = useWriterContext();

	return (
		<div
			className="flex flex-col h-full overflow-hidden"
			data-testid="writer-sidebar"
		>
			<div className="px-3 py-2">
				<Button
					asChild
					variant="ghost"
					size="sm"
					className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent/50"
				>
					<Link href={`/projects/${project.id}/dashboard`}>
						<LayoutDashboard className="mr-2 h-4 w-4" />
						Dashboard
					</Link>
				</Button>
			</div>

			<div className="px-4 py-3 flex items-center justify-between sticky top-0 z-10 glass border-b border-glass-border">
				<div className="flex items-center gap-2.5">
					<Button
						variant="ghost"
						size="icon"
						className="h-7 w-7 -ml-2 text-muted-foreground/70 hover:text-foreground lg:hidden"
						onClick={toggleSidebar}
						aria-label="Close Sidebar"
					>
						<PanelLeftClose className="h-4 w-4" />
					</Button>
					<div className="flex items-center gap-2 text-foreground/90">
						<Book className="h-4 w-4 opacity-70" />
						<h2 className="font-semibold text-sm tracking-tight">
							Book Structure
						</h2>
					</div>
				</div>
				<div className="flex items-center gap-0.5">
					{!isReadOnly && (
						<StructureEditorDialog
							projectId={project.id}
							currentStructure={structureText}
							onSave={() => {
								fetchStructure();
							}}
						>
							<Button
								variant="ghost"
								size="icon"
								className="h-7 w-7 text-muted-foreground/70 hover:text-foreground transition-colors hover:bg-accent/50"
								aria-label="Edit Structure"
							>
								<FileText className="h-4 w-4" />
							</Button>
						</StructureEditorDialog>
					)}
					{isReadOnly && (
						<span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/60 flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/30">
							<Lock className="h-3 w-3" /> Read Only
						</span>
					)}
				</div>
			</div>

			<SceneNavigation
				project={project}
				activeSceneId={activeSceneId}
				onSceneSelect={setActiveSceneId}
				structure={structure}
				loading={loading}
				onStructureUpdate={fetchStructure}
				readOnly={isReadOnly}
			/>
		</div>
	);
}
