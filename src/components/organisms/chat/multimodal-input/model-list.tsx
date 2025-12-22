import { ClockIcon, SparklesIcon, StarIcon } from "lucide-react";
import type { ChatModel } from "@/lib/ai/models";
import { ProviderIcon } from "@/components/organisms/chat/provider-icon";
import type { TabType } from "@/components/organisms/chat/multimodal-input/constants";

type ModelListProps = {
        activeTab: TabType;
        searchQuery: string;
        favoriteModels: ChatModel[];
        recentModels: ChatModel[];
        groupedByProvider: Record<string, ChatModel[]>;
        renderModelCard: (model: ChatModel, keyPrefix: string, showProvider?: boolean) => React.ReactNode;
};

export function ModelList({
        activeTab,
        searchQuery,
        favoriteModels,
        recentModels,
        groupedByProvider,
        renderModelCard,
}: ModelListProps) {
        const hasProviders = Object.keys(groupedByProvider).length > 0;

        return (
                <div className="max-h-[400px] overflow-y-auto p-2" data-testid="model-list">
                        {activeTab === "all" && favoriteModels.length > 0 && !searchQuery && (
                                <div className="mb-3">
                                        <div className="mb-1.5 flex items-center gap-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                                <StarIcon className="h-3 w-3 text-yellow-500" />
                                                Favorites
                                        </div>
                                        <div className="space-y-0.5">
                                                {favoriteModels.map((model) => renderModelCard(model, "fav"))}
                                        </div>
                                </div>
                        )}

                        {activeTab === "all" && recentModels.length > 0 && !searchQuery && (
                                <div className="mb-3">
                                        <div className="mb-1.5 flex items-center gap-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                                <ClockIcon className="h-3 w-3" />
                                                Recent
                                        </div>
                                        <div className="space-y-0.5">
                                                {recentModels.map((model) => renderModelCard(model, "recent"))}
                                        </div>
                                </div>
                        )}

                        {hasProviders ? (
                                <div className="space-y-3">
                                        {Object.entries(groupedByProvider)
                                                .sort(([a], [b]) => a.localeCompare(b))
                                                .map(([provider, models]) => (
                                                        <div key={provider} data-testid={`model-provider-${provider}`}>
                                                                <div className="mb-1.5 flex items-center gap-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                                                        <ProviderIcon provider={provider} size="sm" />
                                                                        {provider}
                                                                        <span className="ml-auto text-[9px] font-normal">{models.length}</span>
                                                                </div>
                                                                <div className="space-y-0.5">
                                                                        {models.map((model) =>
                                                                                renderModelCard(model, `all-${provider}`, false),
                                                                        )}
                                                                </div>
                                                        </div>
                                                ))}
                                </div>
                        ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                        <SparklesIcon className="mb-2 h-8 w-8 text-muted-foreground/50" />
                                        <p className="text-muted-foreground text-sm">No models found</p>
                                        <p className="text-muted-foreground/70 text-xs">Try adjusting your search or filters</p>
                                </div>
                        )}
                </div>
        );
}
