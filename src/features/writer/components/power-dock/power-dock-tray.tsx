import { AnimatePresence, motion } from "framer-motion";
import { ControlButton } from "./control-button";
import { TOOLS } from "@/features/writer/components/tools/tool-config";

interface PowerDockTrayProps {
	mode: "default" | "tools" | "input";
	onSelectTool: (toolId: string) => void;
}

export function PowerDockTray({ mode, onSelectTool }: PowerDockTrayProps) {
	return (
		<AnimatePresence mode="popLayout">
			{mode === "tools" && (
				<motion.div
					initial={{ opacity: 0, width: 0 }}
					animate={{ opacity: 1, width: "auto" }}
					exit={{ opacity: 0, width: 0 }}
					className="flex items-center gap-1 overflow-hidden pl-2 border-l border-white/10 ml-1"
				>
					{TOOLS.map((tool) => (
						<ControlButton
							key={tool.id}
							label={tool.label}
							icon={tool.icon}
							onClick={() => onSelectTool(tool.id)}
							className={tool.color}
						/>
					))}
				</motion.div>
			)}
		</AnimatePresence>
	);
}
