import {
	BookOpen,
	File,
	FileCode,
	FileText,
	Image,
	Music,
	Video,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FileIconProps extends React.HTMLAttributes<HTMLDivElement> {
	mimeType?: string;
	extension?: string;
	size?: number;
}

export function FileIcon({
	mimeType,
	extension,
	className,
	size = 24,
	...props
}: FileIconProps) {
	const getIcon = () => {
		// Check mime type first
		if (mimeType) {
			if (mimeType === "application/pdf")
				return { icon: FileText, color: "text-red-500" };
			if (mimeType === "application/epub+zip")
				return { icon: BookOpen, color: "text-blue-500" };
			if (mimeType.startsWith("image/"))
				return { icon: Image, color: "text-purple-500" };
			if (mimeType.startsWith("video/"))
				return { icon: Video, color: "text-pink-500" };
			if (mimeType.startsWith("audio/"))
				return { icon: Music, color: "text-yellow-500" };
			if (mimeType.includes("word"))
				return { icon: FileText, color: "text-blue-600" };
			if (mimeType.includes("sheet") || mimeType.includes("excel"))
				return { icon: FileText, color: "text-green-600" };
		}

		// Check extension if provided
		if (extension) {
			const ext = extension.toLowerCase().replace(".", "");
			if (["pdf"].includes(ext))
				return { icon: FileText, color: "text-red-500" };
			if (["epub", "mobi", "azw3"].includes(ext))
				return { icon: BookOpen, color: "text-blue-500" };
			if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext))
				return { icon: Image, color: "text-purple-500" };
			if (["mp4", "mov", "avi", "webm"].includes(ext))
				return { icon: Video, color: "text-pink-500" };
			if (["mp3", "wav", "ogg", "m4a"].includes(ext))
				return { icon: Music, color: "text-yellow-500" };
			if (["doc", "docx"].includes(ext))
				return { icon: FileText, color: "text-blue-600" };
			if (["xls", "xlsx", "csv"].includes(ext))
				return { icon: FileText, color: "text-green-600" };
			if (
				["json", "xml", "js", "ts", "jsx", "tsx", "html", "css"].includes(ext)
			)
				return { icon: FileCode, color: "text-orange-500" };
		}

		return { icon: File, color: "text-muted-foreground" };
	};

	const { icon: Icon, color } = getIcon();

	return (
		<div
			className={cn("inline-flex items-center justify-center", className)}
			{...props}
		>
			<Icon
				className={cn(color)}
				style={{ width: size, height: size }}
				strokeWidth={1.5}
			/>
		</div>
	);
}
