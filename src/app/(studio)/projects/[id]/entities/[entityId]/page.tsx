import { eq } from "drizzle-orm";
import {
	ArrowLeft,
	BookOpen,
	Calendar,
	MapPin,
	Package,
	User,
	Users,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { Button } from "@/components/atoms/button";
import { db, getProjectByIdWithAccess } from "@/lib/db/queries";
import { entityAttribute, entity as entityTable } from "@/lib/db/schema";

interface PageProps {
	params: Promise<{
		id: string;
		entityId: string;
	}>;
}

const entityIcons = {
	character: User,
	location: MapPin,
	item: Package,
	organization: Users,
	event: Calendar,
	other: BookOpen,
};

const entityColors = {
	character:
		"text-violet-700 bg-violet-100 dark:text-violet-300 dark:bg-violet-900/40",
	location:
		"text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/40",
	item: "text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-900/40",
	organization:
		"text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/40",
	event:
		"text-orange-700 bg-orange-100 dark:text-orange-300 dark:bg-orange-900/40",
	other: "text-zinc-700 bg-zinc-100 dark:text-zinc-300 dark:bg-zinc-800/40",
};

export default async function EntityPage({ params }: PageProps) {
	const { id: projectId, entityId } = await params;
	const session = await auth();

	const project = await getProjectByIdWithAccess({
		id: projectId,
		userId: session?.user?.id,
	});

	if (!project) {
		notFound();
	}

	const [entity] = await db
		.select()
		.from(entityTable)
		.where(eq(entityTable.id, entityId))
		.limit(1);

	if (!entity || entity.projectId !== projectId) {
		notFound();
	}

	const attributes = await db
		.select()
		.from(entityAttribute)
		.where(eq(entityAttribute.entityId, entityId));

	const Icon = entityIcons[entity.kind as keyof typeof entityIcons] || BookOpen;
	const colorClass =
		entityColors[entity.kind as keyof typeof entityColors] ||
		entityColors.other;

	return (
		<div className="flex flex-col h-full overflow-hidden">
			<header className="flex items-center gap-2 border-b bg-background/95 px-6 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<Link href={`/chat`}>
					<Button variant="ghost" size="icon" className="h-8 w-8">
						<ArrowLeft size={16} />
					</Button>
				</Link>
				<div className="flex items-center gap-2">
					<div className={`p-1.5 rounded-md ${colorClass}`}>
						<Icon size={16} />
					</div>
					<h1 className="text-lg font-semibold">{entity.name}</h1>
				</div>
			</header>

			<main className="flex-1 overflow-y-auto p-6 md:p-8 max-w-4xl mx-auto w-full space-y-8">
				<section className="space-y-4">
					<h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
						Overview
					</h2>
					<div className="prose dark:prose-invert max-w-none">
						<p className="text-lg leading-relaxed">
							{entity.summary || "No summary available."}
						</p>
					</div>
				</section>

				{(entity.startDate || entity.endDate) && (
					<section className="space-y-4">
						<h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
							Timeline
						</h2>
						<div className="flex flex-wrap gap-4">
							{entity.startDate && (
								<div className="flex flex-col">
									<span className="text-xs text-muted-foreground">
										Start Date
									</span>
									<span className="font-medium">
										{new Date(entity.startDate).toLocaleDateString()}
									</span>
								</div>
							)}
							{entity.endDate && (
								<div className="flex flex-col">
									<span className="text-xs text-muted-foreground">
										End Date
									</span>
									<span className="font-medium">
										{new Date(entity.endDate).toLocaleDateString()}
									</span>
								</div>
							)}
						</div>
					</section>
				)}

				{attributes.length > 0 && (
					<section className="space-y-4">
						<h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
							Attributes
						</h2>
						<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
							{attributes.map(
								(attr: { id: string; name: string; value: string }) => (
									<div
										key={attr.id}
										className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm"
									>
										<h3 className="text-xs font-semibold text-muted-foreground uppercase mb-1">
											{attr.name}
										</h3>
										<p className="text-sm font-medium break-words">
											{attr.value}
										</p>
									</div>
								),
							)}
						</div>
					</section>
				)}
			</main>
		</div>
	);
}
