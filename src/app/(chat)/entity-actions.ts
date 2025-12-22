"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/app/(auth)/auth";
import {
	createEntity,
	createEntityAttribute,
	deleteEntity,
	updateEntity,
} from "@/lib/db/queries";

export type EntityOperation = {
	action: "create" | "update" | "delete";
	entityId?: string;
	payload?: {
		name?: string;
		kind?: string;
		summary?: string;
		startDate?: string;
		endDate?: string;
		attributes?: {
			name: string;
			value: string;
			dataType: string;
		}[];
	};
};

export async function executeEntityOperations({
	projectId,
	operations,
}: {
	projectId: string;
	operations: EntityOperation[];
}) {
	const session = await auth();
	if (!session?.user) {
		throw new Error("Unauthorized");
	}

	const results = [];

	for (const op of operations) {
		try {
			if (op.action === "create") {
				if (!op.payload?.name || !op.payload?.kind) {
					results.push({
						success: false,
						error: "Missing name or kind for create",
					});
					continue;
				}

				const created = await createEntity({
					projectId,
					name: op.payload.name,
					kind: op.payload.kind,
					summary: op.payload.summary,
					startDate: op.payload.startDate,
					endDate: op.payload.endDate,
				});

				if (op.payload.attributes && op.payload.attributes.length > 0) {
					await Promise.all(
						op.payload.attributes.map((attr) =>
							createEntityAttribute({
								projectId,
								entityId: created.id,
								name: attr.name,
								value: attr.value,
								dataType: attr.dataType,
							}),
						),
					);
				}

				results.push({
					success: true,
					action: "created",
					id: created.id,
					name: created.name,
				});
			} else if (op.action === "update") {
				if (!op.entityId) {
					results.push({
						success: false,
						error: "Missing entityId for update",
					});
					continue;
				}

				const updated = await updateEntity({
					id: op.entityId,
					name: op.payload?.name,
					kind: op.payload?.kind,
					summary: op.payload?.summary,
					startDate: op.payload?.startDate,
					endDate: op.payload?.endDate,
					// attributes are replaced if provided
					attributes: op.payload?.attributes?.map((a) => ({
						name: a.name,
						value: a.value,
					})),
				});

				results.push({
					success: true,
					action: "updated",
					id: updated.id,
					name: updated.name,
				});
			} else if (op.action === "delete") {
				if (!op.entityId) {
					results.push({
						success: false,
						error: "Missing entityId for delete",
					});
					continue;
				}

				await deleteEntity({ id: op.entityId });
				results.push({ success: true, action: "deleted", id: op.entityId });
			}
		} catch (error) {
			results.push({
				success: false,
				error: error instanceof Error ? error.message : String(error),
			});
		}
	}

	revalidatePath(`/chat`, "layout"); // broadly revalidate for now
	// Specific revalidations could be added if we knew the specific path structure better or if we want to be more granular.
	// But `revalidatePath` with layout is safest to ensure sidebars and context update.

	return { message: "Operations processed", results };
}
