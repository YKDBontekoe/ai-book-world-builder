"use client";

import { use } from "react";
import { GenerationWizard } from "@/components/organisms/generation-wizard";
import { useRouter } from "next/navigation";

export default function GeneratePage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = use(params);
	const router = useRouter();

	return (
		<div className="h-full w-full bg-background">
			<GenerationWizard
				projectId={id}
				onComplete={(generationId) => {
					router.push(`/projects/${id}?generation=${generationId}`);
				}}
				onCancel={() => {
					router.push(`/projects/${id}`);
				}}
			/>
		</div>
	);
}
