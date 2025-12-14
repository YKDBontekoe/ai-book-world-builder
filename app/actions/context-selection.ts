'use server';

import { generateObject } from 'ai';
import { z } from 'zod';
import { auth } from '../(auth)/auth';
import { myProvider } from '../../lib/ai/providers';
import {
  getEntitiesForProject,
  getScenesForProject,
  getOutlineForProject,
  getProjectByIdWithAccess,
} from '../../lib/db/queries';
import { ChatSDKError } from '../../lib/errors';

export async function predictRelevantContext(projectId: string, focus: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new ChatSDKError('unauthorized:auth');
  }

  // 1. Verify Access
  const project = await getProjectByIdWithAccess({
    id: projectId,
    userId: session.user.id
  });

  if (!project) {
    throw new ChatSDKError('not-found:project');
  }

  // 2. Fetch all candidates (lightweight)
  const [entities, scenes, outline] = await Promise.all([
    getEntitiesForProject({ projectId }),
    getScenesForProject({ projectId }),
    getOutlineForProject({ projectId }),
  ]);

  // 3. Ask AI to filter
  // We handle empty lists gracefully
  const entityList = entities.length > 0
    ? entities.map(e => `${e.id}: ${e.name} (${e.kind})`).join('\n')
    : "No entities found.";

  const sceneList = scenes.length > 0
    ? scenes.map(s => `${s.id}: ${s.title} (Status: ${s.status})`).join('\n')
    : "No scenes found.";

  const outlineContext = outline
    ? `Outline: ${outline.title}\n${outline.summary?.slice(0, 500) ?? ''}`
    : 'No outline found.';

  const { object } = await generateObject({
    model: myProvider.languageModel('gpt-4o'), // Use a smart model
    schema: z.object({
      entityIds: z.array(z.string()).describe('IDs of entities relevant to the focus'),
      sceneIds: z.array(z.string()).describe('IDs of scenes relevant to the focus'),
      outlineIds: z.array(z.string()).describe('IDs of outlines/chapters relevant'),
      reasoning: z.string().describe('Why these were selected'),
    }),
    prompt: `
    You are an expert editor assisting an author.

    PROJECT: ${project.name}
    FOCUS: "${focus}"

    OUTLINE CONTEXT:
    ${outlineContext}

    CANDIDATE ENTITIES:
    ${entityList}

    CANDIDATE SCENES:
    ${sceneList}

    TASK:
    Identify which Entities and Scenes are CRITICALLY relevant to the user's focus.
    Select items that should be included in the context window for generating text about "${focus}".
    Don't select everything. Be selective.
    `,
  });

  return object;
}
