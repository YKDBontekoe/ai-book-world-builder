import { Buffer } from "node:buffer";

import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/app/(auth)/auth";
import { getProjectByIdWithAccess } from "@/lib/db/queries";
import {
  createPendingSourceMaterial,
  formatBytes,
  getSourceMaterialUploadKey,
  markSourceMaterialAsFailed,
  markSourceMaterialAsUploaded,
  sanitizeSourceMaterialName,
  serializeSourceMaterial,
  sourceMaterialSizeLimits,
  supportedSourceMaterialMimeTypes,
} from "@/lib/source-materials";

const uploadSchema = z.object({
  projectId: z.string().uuid(),
});

type UploadErrorCode =
  | "unauthorized:upload"
  | "invalid_payload:upload"
  | "missing_project:upload"
  | "invalid_type:upload"
  | "too_large:upload"
  | "server_error:upload";

const uploadErrorResponses: Record<
  UploadErrorCode,
  { message: string; status: number }
> = {
  "unauthorized:upload": {
    message: "You must be signed in to upload files.",
    status: 401,
  },
  "invalid_payload:upload": {
    message: "A valid file upload payload is required.",
    status: 400,
  },
  "missing_project:upload": {
    message: "Uploads must be associated with a valid project.",
    status: 403,
  },
  "invalid_type:upload": {
    message: "Unsupported file type. Upload a PDF, EPUB, DOCX, or TXT file.",
    status: 400,
  },
  "too_large:upload": {
    message: "File exceeds the maximum allowed size for your account.",
    status: 400,
  },
  "server_error:upload": {
    message: "Upload failed. Please try again.",
    status: 500,
  },
};

function errorResponse(
  code: UploadErrorCode,
  messageOverride?: string,
  statusOverride?: number
) {
  const base = uploadErrorResponses[code];
  return NextResponse.json(
    {
      code,
      status: "error",
      message: messageOverride ?? base.message,
    },
    { status: statusOverride ?? base.status }
  );
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return errorResponse("unauthorized:upload");
  }

  if (!request.body) {
    return errorResponse("invalid_payload:upload", "Request body is empty.");
  }

  const formData = await request.formData().catch(() => null);

  if (!formData) {
    return errorResponse(
      "invalid_payload:upload",
      "Unable to parse the provided form data."
    );
  }

  const fileEntry = formData.get("file");
  const projectIdValue = formData.get("projectId");

  if (!(fileEntry instanceof File)) {
    return errorResponse("invalid_payload:upload", "A file must be provided.");
  }

  const parsedProjectId = uploadSchema.safeParse({ projectId: projectIdValue });

  if (!parsedProjectId.success) {
    return errorResponse(
      "missing_project:upload",
      "A valid projectId is required before uploading files."
    );
  }

  const projectId = parsedProjectId.data.projectId;

  const project = await getProjectByIdWithAccess({
    id: projectId,
    userId: session.user.id,
  });

  if (!project) {
    return errorResponse(
      "missing_project:upload",
      "Project not found or unavailable.",
      403
    );
  }

  const mimeType = fileEntry.type.toLowerCase();

  if (!supportedSourceMaterialMimeTypes.has(mimeType)) {
    return errorResponse("invalid_type:upload");
  }

  const sizeLimit =
    sourceMaterialSizeLimits[session.user.type] ??
    sourceMaterialSizeLimits.regular;

  if (fileEntry.size > sizeLimit) {
    return errorResponse(
      "too_large:upload",
      `File exceeds the ${formatBytes(sizeLimit)} limit for your account.`
    );
  }

  const filename = sanitizeSourceMaterialName(fileEntry.name);

  const pendingMaterial = await createPendingSourceMaterial({
    filename,
    mimeType,
    projectId,
    size: fileEntry.size,
    userId: session.user.id,
  });

  const uploadKey = getSourceMaterialUploadKey(projectId, filename);

  try {
    const fileBuffer = Buffer.from(await fileEntry.arrayBuffer());
    const blob = await put(uploadKey, fileBuffer, {
      access: "public",
      contentType: mimeType,
    });

    const uploadedMaterial = await markSourceMaterialAsUploaded({
      blobUrl: blob.url,
      id: pendingMaterial.id,
    });

    if (!uploadedMaterial) {
      await Promise.resolve(
        markSourceMaterialAsFailed({ id: pendingMaterial.id })
      ).catch(() => null);
      return errorResponse(
        "server_error:upload",
        "Upload was stored but metadata could not be finalized."
      );
    }

    return NextResponse.json({
      status: "uploaded",
      previousStatus: pendingMaterial.status,
      material: serializeSourceMaterial(uploadedMaterial),
      blob: {
        url: blob.url,
        pathname: blob.pathname,
        contentType: blob.contentType,
        size: fileEntry.size,
      },
    });
  } catch (error) {
    await Promise.resolve(
      markSourceMaterialAsFailed({ id: pendingMaterial.id })
    ).catch(() => null);

    const message =
      error instanceof Error ? error.message : uploadErrorResponses["server_error:upload"].message;

    return errorResponse("server_error:upload", message);
  }
}
