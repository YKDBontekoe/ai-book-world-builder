declare module "streamdown" {
	import * as React from "react";
	import { PluggableList } from "unified";

	export interface StreamdownProps {
		children?: string;
		className?: string;
		allowedLinkPrefixes?: string[];
		allowedImagePrefixes?: string[];
		allowDataImages?: boolean;
		rehypePlugins?: PluggableList;
		remarkPlugins?: PluggableList;
	}

	export const Streamdown: React.MemoExoticComponent<
		(props: StreamdownProps) => React.JSX.Element
	>;
}
