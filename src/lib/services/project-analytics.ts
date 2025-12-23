import { FullProjectData } from "@/lib/book-generation";
import { Scene } from "@/lib/db/schema";
import { getScenesForProject } from "@/lib/db/queries/scene";

export interface ProjectStats {
    characters: number;
    locations: number;
    items: number;
    events: number;
    organizations: number;
    outlines: number;
    volumes: number;
    chapters: number;
    scenes: number;
    draftedScenes: number;
    plannedScenes: number;
}

export class ProjectAnalyticsService {
    async getProjectStats(projectId: string, projectData: FullProjectData): Promise<ProjectStats> {
        const entities = projectData.entities || [];
        const characters = entities.filter((e) => e.kind === "character");
        const locations = entities.filter((e) => e.kind === "location");
        const items = entities.filter((e) => e.kind === "item");
        const events = entities.filter((e) => e.kind === "event");
        const organizations = entities.filter((e) => e.kind === "organization");

        // Count volumes, chapters
        const volumes = projectData.volumes || [];
        const allChapters = volumes.flatMap((v) => v.chapters || []);

        // Fetch scenes directly from database since they're not included in the volumes data
        // Optimization: Exclude content as we only need metadata for stats and readiness score
        const allScenes = await getScenesForProject({ projectId, excludeContent: true });
        const draftedScenes = allScenes.filter(
            (s) => s.status === "drafted" || s.status === "final",
        );
        const plannedScenes = allScenes.filter((s) => s.status === "planned");

        return {
            characters: characters.length,
            locations: locations.length,
            items: items.length,
            events: events.length,
            organizations: organizations.length,
            outlines: projectData.outlines?.length || 0,
            volumes: volumes.length,
            chapters: allChapters.length,
            scenes: allScenes.length,
            draftedScenes: draftedScenes.length,
            plannedScenes: plannedScenes.length,
        };
    }

    calculateReadinessScore(stats: ProjectStats): number {
        // Weight: characters 30%, locations 20%, outline 30%, chapters 20%
        const characterScore = Math.min(stats.characters * 20, 100);
        const locationScore = Math.min(stats.locations * 25, 100);
        const outlineScore = stats.outlines > 0 ? 100 : 0;
        const chapterScore = Math.min(stats.chapters * 10, 100);

        return Math.round(
            characterScore * 0.3 +
            locationScore * 0.2 +
            outlineScore * 0.3 +
            chapterScore * 0.2,
        );
    }
}

export const projectAnalytics = new ProjectAnalyticsService();
