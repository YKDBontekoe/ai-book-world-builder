import { cn } from "@/lib/utils";

interface GridListProps extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode;
	columns?: {
		mobile?: number;
		sm?: number;
		md?: number;
		lg?: number;
		xl?: number;
	};
	gap?: number;
}

export function GridList({
	children,
	className,
	columns = { mobile: 1, sm: 2, lg: 3 },
	gap = 4,
	...props
}: GridListProps) {
	// We'll use style for custom gap to avoid complex tailwind classes if needed,
	// but standard tailwind gap classes are usually cleaner.
	// For now let's map the gap number to a tailwind class if possible, or use inline style.

	// Tailwind default spacing scale usually matches numbers directly (gap-4 = 1rem).

	return (
		<div
			className={cn(
				"grid",
				// Default mappings - simple version
				"grid-cols-1",
				columns.sm && `sm:grid-cols-${columns.sm}`,
				columns.md && `md:grid-cols-${columns.md}`,
				columns.lg && `lg:grid-cols-${columns.lg}`,
				columns.xl && `xl:grid-cols-${columns.xl}`,
				`gap-${gap}`,
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
}
