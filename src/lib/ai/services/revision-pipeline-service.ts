/**
 * Revision Pipeline Service
 *
 * Orchestrates multi-pass revisions on text content, including:
 * - Structural improvements
 * - Prose polishing (Clarify, Flow, Sensory details)
 * - Dialogue enhancement
 * - "Show, Don't Tell" conversion
 */

import "server-only";

import { z } from "zod";
import { BaseAIService } from "@/lib/ai/services/base-ai-service";

// =============================================================================
// Types
// =============================================================================

export type RevisionFocus = 
    | "clarity" 
    | "flow" 
    | "sensory" 
    | "dialogue" 
    | "show_dont_tell" 
    | "pacing" 
    | "tone";

export interface RevisionOptions {
    focus?: RevisionFocus[];
    style?: string;
    iterations?: number; // Default 1
    detectProblems?: boolean; // Whether to analyze first
}

export interface RevisionResult {
    original: string;
    revised: string;
    changes: {
        type: RevisionFocus | "general";
        description: string;
        diff?: string; // Optional diff description
    }[];
    qualityScore?: number;
}

const revisionAnalysisSchema = z.object({
    needsRevision: z.boolean(),
    issues: z.array(z.string()),
    recommendedFocus: z.array(z.enum([
        "clarity", "flow", "sensory", "dialogue", "show_dont_tell", "pacing", "tone"
    ])),
    plan: z.string(),
});

const revisionExecutionSchema = z.object({
    revisedText: z.string(),
    substantiveChanges: z.array(z.object({
        type: z.enum(["clarity", "flow", "sensory", "dialogue", "show_dont_tell", "pacing", "tone", "general"]),
        description: z.string(),
    })),
});

// =============================================================================
// Service
// =============================================================================

export class RevisionPipelineService extends BaseAIService {
    
    /**
     * Run a revision on the provided text based on instructions and options.
     */
    async revise(
        text: string, 
        instructions: string, 
        options: RevisionOptions = {}
    ): Promise<RevisionResult> {
        let currentText = text;
        const allChanges: RevisionResult["changes"] = [];

        // 1. Analysis Step (Optional)
        // If specific focus not provided, or detectProblems is true, ask AI what to fix.
        let focusAreas = options.focus || [];
        
        if (options.detectProblems || focusAreas.length === 0) {
            const analysis = await this.analyzeForRevision(text, instructions);
            if (!analysis.needsRevision) {
                return { original: text, revised: text, changes: [] };
            }
            // Merge detected focus areas if not explicit
            if (focusAreas.length === 0) {
                focusAreas = analysis.recommendedFocus as RevisionFocus[];
            }
        }

        // 2. Execution Loop
        // We can run all focus areas in one prompt, or chain them.
        // For quality, chaining 1-2 passes is often better, but expensive.
        // Let's do a smart strategy: Group compatible passes.
        // "Prose" group: clarity, flow, sensory, tone.
        // "Structure" group: pacing, show_dont_tell.
        // "Dialogue" group: dialogue.

        // For this version, we'll do a single powerful pass with explicit focus instructions,
        // unless 'iterations' > 1.
        
        const styleInstruction = options.style ? `Target Style: ${options.style}` : "";
        const focusInstruction = focusAreas.length > 0 
            ? `Focus heavily on improving: ${focusAreas.join(", ")}.\n` 
            : "";

        const systemPrompt = `You are a master editor and creative writing coach known for transforming good drafts into exceptional, publishable prose.
        Your task is to revise the provided text based on the instructions below.
        
        ${styleInstruction}
        ${focusInstruction}

        CRITICAL EDITING GUIDELINES:
        1. **Deepen Immersion**: Convert abstract descriptions into concrete sensory experiences (Show, Don't Tell).
        2. **Strengthen Verbs**: Replace weak verbs and excessive adverbs with precise, active verbs. Avoid passive voice.
        3. **Enhance Flow**: Vary sentence structure to create pleasing rhythm. Eliminate clunky phrasing and repetition.
        4. **Preserve Story**: Improve the execution without altering the core plot events or character motivations unless strictly necessary.
        5. **Dialogue Polish**: Ensure spoken lines sound authentic to the characters and include natural subtext.
        
        Return the polished text and a summary of your substantive changes.`;

        const result = await this.generateObjectWithSystem(
            systemPrompt,
            `Instructions: ${instructions}\n\nOriginal Text:\n${currentText}`,
            revisionExecutionSchema,
            { modelRole: "writer" } // Use a good writing model
        );

        if (result.success) {
            currentText = result.data.object.revisedText;
            allChanges.push(...result.data.object.substantiveChanges.map(c => ({
                type: c.type,
                description: c.description
            })));
        }

        return {
            original: text,
            revised: currentText,
            changes: allChanges
        };
    }

    /**
     * Run a multi-pass full revision pipeline.
     * Executes: Structure/Clarity -> Dialogue/Show-Dont-Tell -> Polish/Sensory
     */
    async runFullRevision(text: string, style?: string): Promise<RevisionResult> {
        // Pass 1: Clarity & Flow
        const pass1 = await this.revise(text, "Improve clarity, sentence flow, and pacing.", {
             focus: ["clarity", "flow", "pacing"],
             style
        });
        
        // Pass 2: Dialogue & Show/Tell
        const pass2 = await this.revise(pass1.revised, "Enhance dialogue naturalness and convert 'telling' to 'showing'.", {
             focus: ["dialogue", "show_dont_tell"],
             style
        });
        
        // Pass 3: Polish & Sensory
        const pass3 = await this.revise(pass2.revised, "Final polish: add sensory details and ensure consistent tone.", {
             focus: ["sensory", "tone"],
             style
        });

        // Consolidate changes
        const allChanges = [
            ...pass1.changes.map(c => ({ ...c, description: `[Pass 1] ${c.description}` })),
            ...pass2.changes.map(c => ({ ...c, description: `[Pass 2] ${c.description}` })),
            ...pass3.changes.map(c => ({ ...c, description: `[Pass 3] ${c.description}` }))
        ];
        
        return {
            original: text,
            revised: pass3.revised,
            changes: allChanges
        };
    }

    /**
     * Analyze text to determine what kind of revision is needed.
     */
    private async analyzeForRevision(text: string, instructions: string) {
        const systemPrompt = `You are a critique partner. Analyze the text to identify areas for improvement based on the user's goal.`;
        
        const result = await this.generateObjectWithSystem(
            systemPrompt,
            `Goal: ${instructions}\n\nText:\n${text}`,
            revisionAnalysisSchema,
            { modelRole: "checker" }
        );

        if (!result.success) {
            return { needsRevision: true, recommendedFocus: [], plan: "Default revision" };
        }
        return result.data.object;
    }
}

export const revisionPipelineService = new RevisionPipelineService();
