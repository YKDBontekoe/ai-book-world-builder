import { AnimatePresence, motion } from "framer-motion";
import * as ReactNamespace from "react";
import { TOOLS } from "@/features/writer/components/tools/tool-config";
import type { ToolType } from "@/features/writer/components/tools/tool-strategies";
import { ControlButton } from "./control-button";

interface PowerDockTrayProps {
	mode: "default" | "tools" | "input";
	onSelectTool: (toolId: ToolType) => void;
}

export function PowerDockTray({
	mode,
	onSelectTool,
}: PowerDockTrayProps): ReactNamespace.JSX.Element {
	return (
		<AnimatePresence mode="popLayout">
			{mode === "tools" && (
				<motion.div
					initial={{ opacity: 0, width: 0 }}
					animate={{ opacity: 1, width: "auto" }}
					exit={{ opacity: 0, width: 0 }}
					transition={{ type: "spring", stiffness: 400, damping: 25 }}
					className="flex items-center gap-1 overflow-hidden pl-2 border-l border-white/10 ml-1"
				>
					{TOOLS.map((tool, index) => (
						<motion.div
							key={tool.id}
							initial={{ opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{
								delay: index * 0.03,
								type: "spring",
								stiffness: 400,
								damping: 25,
							}}
						>
							<ControlButton
								label={tool.label}
								icon={tool.icon}
								onClick={() => onSelectTool(tool.id as ToolType)}
								className={tool.color}
							/>
						</motion.div>
					))}
				</motion.div>
			)}
		</AnimatePresence>
	);
}
