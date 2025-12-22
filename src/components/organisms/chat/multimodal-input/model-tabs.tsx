import { cn } from "@/lib/utils";
import { MODEL_TABS, PRICE_TABS, type TabDefinition, type TabType } from "@/components/organisms/chat/multimodal-input/constants";

type ModelTabsProps = {
        activeTab: TabType;
        onTabChange: (tab: TabType) => void;
};

function TabButton({ definition, isActive, onClick }: {
        definition: TabDefinition;
        isActive: boolean;
        onClick: () => void;
}) {
        return (
                <button
                        key={definition.id}
                        type="button"
                        onClick={onClick}
                        className={cn(
                                "flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all",
                                isActive
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                        data-testid={`model-tab-${definition.id}`}
                >
                        {definition.icon}
                        {definition.label}
                </button>
        );
}

export function ModelTabs({ activeTab, onTabChange }: ModelTabsProps) {
        return (
                <div className="space-y-1.5">
                        <div className="flex flex-wrap gap-1">
                                {MODEL_TABS.map((tab) => (
                                        <TabButton
                                                key={tab.id}
                                                definition={tab}
                                                isActive={activeTab === tab.id}
                                                onClick={() => onTabChange(tab.id)}
                                        />
                                ))}
                        </div>
                        <div className="flex gap-1">
                                {PRICE_TABS.map((tab) => (
                                        <TabButton
                                                key={tab.id}
                                                definition={tab}
                                                isActive={activeTab === tab.id}
                                                onClick={() => onTabChange(tab.id)}
                                        />
                                ))}
                        </div>
                </div>
        );
}
