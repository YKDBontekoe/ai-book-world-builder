import type { ReactNode } from "react";

type PageHeaderProps = {
	breadcrumb?: ReactNode;
	title: ReactNode;
	description?: string;
	action?: ReactNode;
	metadata?: ReactNode;
};

export function PageHeader({
	breadcrumb,
	title,
	description,
	action,
	metadata,
}: PageHeaderProps) {
	return (
		<div className="flex flex-wrap items-start justify-between gap-4">
			<div className="space-y-1">
				{breadcrumb &&
					(typeof breadcrumb === "string" ? (
						<p className="text-muted-foreground text-sm">{breadcrumb}</p>
					) : (
						breadcrumb
					))}
				{typeof title === "string" ? (
					<h1 className="font-semibold text-2xl">{title}</h1>
				) : (
					title
				)}
				{description && (
					<p className="text-muted-foreground text-sm">{description}</p>
				)}
			</div>
			{action && <div>{action}</div>}
			{metadata && (
				<div className="text-right text-muted-foreground text-sm">
					{metadata}
				</div>
			)}
		</div>
	);
}
