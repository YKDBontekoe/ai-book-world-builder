import { randomUUID } from "node:crypto";

import type { UserType } from "@/app/(auth)/auth";
import { createSourceMaterial, updateSourceMaterial } from "@/lib/db/queries";
import type { SourceMaterial } from "@/lib/db/schema";
import {
	isSupportedIngestionMimeType,
	supportedIngestionMimeTypes,
} from "@/lib/ingestion/mime-types";

export const supportedSourceMaterialMimeTypes = supportedIngestionMimeTypes;

export const sourceMaterialSizeLimits: Record<UserType, number> = {
	regular: 20 * 1024 * 1024,
};

export type SerializedSourceMaterial = Omit<
	SourceMaterial,
	"createdAt" | "updatedAt"
> & {
	createdAt: string;
	updatedAt: string;
};

export function isSupportedSourceMaterialType(mimeType: string): boolean {
	return isSupportedIngestionMimeType(mimeType);
}

export function sanitizeSourceMaterialName(filename: string): string {
	const trimmed = filename.trim();
	const safeName = trimmed.replace(/[^a-zA-Z0-9._-]+/g, "_");
	return safeName.length > 0 ? safeName : `upload-${randomUUID()}`;
}

export function getSourceMaterialUploadKey(
	projectId: string,
	filename: string,
): string {
	const timestamp = Date.now();
	const safeName = sanitizeSourceMaterialName(filename);
	return `projects/${projectId}/${timestamp}-${safeName}`;
}

export function serializeSourceMaterial(
	material: SourceMaterial,
): SerializedSourceMaterial {
	return {
		...material,
		createdAt: material.createdAt.toISOString(),
		updatedAt: material.updatedAt.toISOString(),
	};
}

export async function createPendingSourceMaterial({
	filename,
	mimeType,
	projectId,
	size,
	userId,
}: {
	filename: string;
	mimeType: string;
	projectId: string;
	size: number;
	userId: string;
}): Promise<SourceMaterial> {
	return createSourceMaterial({
		filename,
		mimeType,
		projectId,
		size,
		status: "pending",
		userId,
	});
}

export async function markSourceMaterialAsUploaded({
	blobUrl,
	id,
}: {
	blobUrl: string;
	id: string;
}): Promise<SourceMaterial | null> {
	return updateSourceMaterial({
		blobUrl,
		id,
		status: "uploaded",
	});
}

export async function markSourceMaterialAsFailed({
	id,
}: {
	id: string;
}): Promise<SourceMaterial | null> {
	return updateSourceMaterial({
		blobUrl: null,
		id,
		status: "failed",
	});
}

export function formatBytes(bytes: number): string {
	const megabytes = bytes / (1024 * 1024);
	return `${megabytes.toFixed(1)}MB`;
}
