'use client';

import React from 'react';
import { BUILDINGS } from '../config';
import type { BuildingType } from '../types';
import { useGame } from '../store';
import { Pickaxe, Factory, Store, Box, HandCoins, Beaker, Coins, ArrowRight, GitFork, ArrowUpFromLine } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/atoms/scroll-area';
import { Button } from '@/components/atoms/button';

const ICONS: Record<BuildingType, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  Mine: Pickaxe,
  Smelter: Factory,
  Factory: Factory,
  Warehouse: Box,
  Market: Store,
  TradingPost: HandCoins,
  Lab: Beaker,
  Belt: ArrowRight,
  Splitter: GitFork,
  Inserter: ArrowUpFromLine,
};

const BUILDING_CATEGORIES = {
  'Production': ['Mine', 'Smelter', 'Factory'],
  'Logistics': ['Belt', 'Splitter', 'Inserter'],
  'Storage': ['Warehouse'],
  'Economy': ['TradingPost', 'Market'],
  'Research': ['Lab'],
} as const;

const CATEGORY_COLORS: Record<string, string> = {
  'Production': 'text-orange-600',
  'Logistics': 'text-cyan-600',
  'Storage': 'text-slate-600',
  'Economy': 'text-emerald-600',
  'Research': 'text-purple-600',
};

export function BuildingPalette({ selected, onSelect }: { selected: BuildingType | null, onSelect: (t: BuildingType | null) => void }) {
  const { state } = useGame();

  const unlockedByCategory = Object.entries(BUILDING_CATEGORIES).map(([category, types]) => ({
    category,
    buildings: (types as readonly BuildingType[]).filter(type => state.unlockedBuildings.includes(type))
  })).filter(cat => cat.buildings.length > 0);

  return (
    <div className="glass-panel flex flex-col w-72 shrink-0 h-full overflow-hidden border border-border/50 bg-background/50 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border/50 bg-background/40">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
          <Factory className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-foreground text-sm">Buildings</h2>
          <p className="text-[10px] text-muted-foreground">Select to place on grid</p>
        </div>
      </div>
      
      {/* Building List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {unlockedByCategory.map(({ category, buildings }) => (
            <div key={category}>
              <h3 className={cn(
                "text-[10px] uppercase font-bold tracking-wider mb-3 flex items-center gap-2",
                CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]
              )}>
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                {category}
                <span className="flex-1 h-px bg-border/60" />
              </h3>

              <div className="space-y-2">
                {buildings.map((type) => {
                  const config = BUILDINGS[type];
                  const Icon = ICONS[type];
                  const canAfford = state.cash >= config.cost;
                  const isSelected = selected === type;

                  return (
                    <Button
                      key={type}
                      variant="ghost"
                      onClick={() => onSelect(isSelected ? null : type)}
                      disabled={!canAfford && !isSelected}
                      className={cn(
                        "w-full justify-start h-auto p-2.5 relative overflow-hidden group hover:bg-muted/50",
                        isSelected && "bg-amber-500/10 hover:bg-amber-500/15 ring-1 ring-amber-500/50"
                      )}
                    >
                      <div className="flex items-start gap-3 w-full text-left">
                        <div className={cn(
                          "w-10 h-10 rounded-md flex items-center justify-center shrink-0 transition-all border",
                          isSelected
                            ? "bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-500/20"
                            : "bg-background border-border text-muted-foreground group-hover:text-foreground group-hover:border-amber-500/50"
                        )}>
                          <Icon className="w-5 h-5" />
                        </div>

                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className={cn(
                              "font-semibold text-sm leading-none",
                              isSelected ? "text-amber-700 dark:text-amber-400" : "text-foreground"
                            )}>
                              {type}
                            </span>
                            <span className={cn(
                              "font-mono text-xs font-bold flex items-center gap-1 bg-background/50 px-1.5 py-0.5 rounded",
                              canAfford ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"
                            )}>
                              <Coins className="w-3 h-3" />
                              {config.cost}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-tight line-clamp-2">
                            {config.description}
                          </p>
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      
      {/* Footer Instructions */}
      <div className="p-3 border-t border-border/50 bg-muted/30">
        <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
          <span className="text-foreground font-medium">Left-click</span> to place.
          <span className="mx-1 opacity-30">|</span>
          <span className="text-foreground font-medium">Right-click</span> to delete.
        </p>
      </div>
    </div>
  );
}
