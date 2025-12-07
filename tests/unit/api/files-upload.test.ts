import { Buffer } from "node:buffer";

import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/app/(auth)/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db/queries", () => ({
  getProjectByIdWithAccess: vi.fn(),
}));

vi.mock("@/lib/source-materials", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/lib/source-materials")>();

  return {
    ...actual,
    createPendingSourceMaterial: vi.fn(),
    markSourceMaterialAsUploaded: vi.fn(),
    markSourceMaterialAsFailed: vi.fn(),
  };
});

vi.mock("@vercel/blob", () => ({
  put: vi.fn(),
}));

import { put } from "@vercel/blob";
import type { Session } from "next-auth";
import { auth } from "@/app/(auth)/auth";
import { POST } from "@/app/(chat)/api/files/upload/route";
import { getProjectByIdWithAccess } from "@/lib/db/queries";
import type { Project, SourceMaterial } from "@/lib/db/schema";
import {
  createPendingSourceMaterial,
  markSourceMaterialAsFailed,
  markSourceMaterialAsUploaded,
  sourceMaterialSizeLimits,
} from "@/lib/source-materials";

const mockedAuth = vi.mocked(auth);
const mockedGetProjectByIdWithAccess = vi.mocked(getProjectByIdWithAccess);
const mockedCreatePendingSourceMaterial = vi.mocked(
  createPendingSourceMaterial
);
const mockedMarkSourceMaterialAsUploaded = vi.mocked(
  markSourceMaterialAsUploaded
);
const mockedMarkSourceMaterialAsFailed = vi.mocked(markSourceMaterialAsFailed);
const mockedPut = vi.mocked(put);
const projectId = "11111111-1111-1111-1111-111111111111";

function buildSession(userId: string, type: "guest" | "regular"): Session {
  return {
    user: {
      email: null,
      id: userId,
      image: null,
      name: null,
      type,
    },
    expires: new Date().toISOString(),
  };
}

function buildProject(projectId: string, userId: string): Project {
  return {
    createdAt: new Date(),
    description: null,
    folders: [],
    id: projectId,
    name: "Test Project",
    userId,
    visibility: "private",
  };
}

function buildRequest({ file, projectId }: { file: File; projectId: string }) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("projectId", projectId);

  return new Request("http://localhost/api/files/upload", {
    method: "POST",
    body: formData,
  });
}

describe("POST /api/files/upload", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("persists a supported file type and returns the uploaded material", async () => {
    const file = new File(["hello"], "story.pdf", { type: "application/pdf" });
    const pendingMaterial: SourceMaterial = {
      id: "mat-1",
      createdAt: new Date("2024-01-01T00:00:00Z"),
      updatedAt: new Date("2024-01-01T00:00:00Z"),
      filename: file.name,
      mimeType: file.type,
      projectId,
      size: file.size,
      status: "pending",
      userId: "user-1",
      blobUrl: null,
    };

    mockedAuth.mockResolvedValue(buildSession("user-1", "regular") as any);
    mockedGetProjectByIdWithAccess.mockResolvedValue(
      buildProject(projectId, "user-1")
    );
    mockedCreatePendingSourceMaterial.mockResolvedValue(pendingMaterial);
    mockedPut.mockResolvedValue({
      url: `https://blob.vercel.store/projects/${projectId}/story.pdf`,
      pathname: `projects/${projectId}/story.pdf`,
      contentType: file.type,
    } as any);
    mockedMarkSourceMaterialAsUploaded.mockResolvedValue({
      ...pendingMaterial,
      status: "uploaded",
      blobUrl: `https://blob.vercel.store/projects/${projectId}/story.pdf`,
      updatedAt: new Date("2024-01-02T00:00:00Z"),
    });

    const response = await POST(
      buildRequest({ file, projectId: pendingMaterial.projectId })
    );

    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.status).toBe("uploaded");
    expect(payload.previousStatus).toBe("pending");
    expect(payload.material.blobUrl).toContain("story.pdf");
    expect(mockedPut).toHaveBeenCalledWith(
      expect.stringContaining(`projects/${pendingMaterial.projectId}`),
      expect.any(Buffer),
      expect.objectContaining({ contentType: file.type })
    );
    expect(mockedMarkSourceMaterialAsUploaded).toHaveBeenCalledWith({
      blobUrl: expect.stringContaining("story.pdf"),
      id: pendingMaterial.id,
    });
  });

  it("rejects unsupported MIME types", async () => {
    const file = new File(["bad"], "image.gif", { type: "image/gif" });

    mockedAuth.mockResolvedValue(buildSession("user-1", "regular") as any);
    mockedGetProjectByIdWithAccess.mockResolvedValue(
      buildProject(projectId, "user-1")
    );

    const response = await POST(buildRequest({ file, projectId }));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.code).toBe("invalid_type:upload");
    expect(mockedCreatePendingSourceMaterial).not.toHaveBeenCalled();
    expect(mockedPut).not.toHaveBeenCalled();
  });

  it("enforces per-role size caps", async () => {
    const sizeLimit = sourceMaterialSizeLimits.guest;
    const file = new File([new Uint8Array(sizeLimit + 1)], "oversize.pdf", {
      type: "application/pdf",
    });

    mockedAuth.mockResolvedValue(buildSession("guest-1", "guest") as any);
    mockedGetProjectByIdWithAccess.mockResolvedValue(
      buildProject(projectId, "guest-1")
    );

    const response = await POST(buildRequest({ file, projectId }));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.code).toBe("too_large:upload");
    expect(mockedCreatePendingSourceMaterial).not.toHaveBeenCalled();
    expect(mockedPut).not.toHaveBeenCalled();
  });

  it("requires an authenticated session", async () => {
    const file = new File(["hello"], "story.pdf", { type: "application/pdf" });

    mockedAuth.mockResolvedValue(null as any);

    const response = await POST(buildRequest({ file, projectId }));
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.code).toBe("unauthorized:upload");
    expect(mockedGetProjectByIdWithAccess).not.toHaveBeenCalled();
  });

  it("returns an error when the project cannot be found", async () => {
    const file = new File(["hello"], "story.pdf", { type: "application/pdf" });

    mockedAuth.mockResolvedValue(buildSession("user-1", "regular") as any);
    mockedGetProjectByIdWithAccess.mockResolvedValue(null);

    const response = await POST(buildRequest({ file, projectId }));
    const payload = await response.json();

    expect(response.status).toBe(403);
    expect(payload.code).toBe("missing_project:upload");
    expect(mockedCreatePendingSourceMaterial).not.toHaveBeenCalled();
  });

  it("marks a pending material as failed when blob persistence errors", async () => {
    const file = new File(["hello"], "story.pdf", { type: "application/pdf" });
    const pendingMaterial: SourceMaterial = {
      id: "mat-err",
      createdAt: new Date("2024-01-01T00:00:00Z"),
      updatedAt: new Date("2024-01-01T00:00:00Z"),
      filename: file.name,
      mimeType: file.type,
      projectId,
      size: file.size,
      status: "pending",
      userId: "user-1",
      blobUrl: null,
    };

    mockedAuth.mockResolvedValue(buildSession("user-1", "regular") as any);
    mockedGetProjectByIdWithAccess.mockResolvedValue(
      buildProject(projectId, "user-1")
    );
    mockedCreatePendingSourceMaterial.mockResolvedValue(pendingMaterial);
    mockedPut.mockRejectedValue(new Error("blob failed"));

    const response = await POST(
      buildRequest({ file, projectId: pendingMaterial.projectId })
    );
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload.code).toBe("server_error:upload");
    expect(mockedMarkSourceMaterialAsFailed).toHaveBeenCalledWith({
      id: pendingMaterial.id,
    });
  });
});
