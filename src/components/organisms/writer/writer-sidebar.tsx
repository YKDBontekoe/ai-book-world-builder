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
import { SceneNavigation } from "@/components/organisms/writer/left-sidebar/scene-navigation";
import { StructureEditorDialog } from "@/components/organisms/writer/structure-editor-dialog";
import { useWriterContext } from "@/components/organisms/writer/writer-context";
import { useWriterLayoutContext } from "@/components/organisms/writer/writer-layout-context";

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
			className="flex flex-col h-full bg-sidebar/30 backdrop-blur-xl overflow-hidden"
			data-testid="writer-sidebar"
		>
			<div className="px-3 py-2">
				<Link href={`/projects/${project.id}/dashboard`}>
					<Button variant="ghost" size="sm" className="w-full justify-start">
						<LayoutDashboard className="mr-2 h-4 w-4" />
						Dashboard
					</Button>
				</Link>
			</div>

			<div className="px-4 py-3 flex items-center justify-between bg-sidebar/20 backdrop-blur-md sticky top-0 z-10">
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
					<div className="flex items-center gap-2 text-sidebar-foreground/90">
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
								className="h-7 w-7 text-muted-foreground/70 hover:text-foreground transition-colors"
								aria-label="Edit Structure"
							>
								<FileText className="h-4 w-4" />
							</Button>
						</StructureEditorDialog>
					)}
					{isReadOnly && (
						<span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/60 flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/50">
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
