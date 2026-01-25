'use client';

import React from 'react';
import { BUILDINGS } from '../config';
import type { BuildingType } from '../types';
import { useGame } from '../store';
import { Pickaxe, Factory, Store, Box, HandCoins, Beaker, Coins, ArrowRight, GitFork, ArrowUpFromLine } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
    <div className="flex flex-col w-72 shrink-0 h-full factory-panel overflow-hidden">
      {/* Header */}
      <div className="factory-panel-header">
        <div className="w-8 h-8 rounded-md bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
          <Factory className="w-4 h-4 text-black" />
        </div>
        <div>
          <h2 className="font-bold text-[var(--factory-text-primary)]">Buildings</h2>
          <p className="text-[10px] text-[var(--factory-text-muted)]">Click to select, then place on grid</p>
        </div>
      </div>
      
      {/* Building List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {unlockedByCategory.map(({ category, buildings }) => (
          <div key={category}>
            <h3 className={cn(
              "text-[10px] uppercase font-bold tracking-wider mb-2 flex items-center gap-2",
              CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]
            )}>
              <span className="w-4 h-px bg-current opacity-50" />
              {category}
              <span className="flex-1 h-px bg-current opacity-20" />
            </h3>
            
            <div className="space-y-2">
              {buildings.map((type) => {
                const config = BUILDINGS[type];
                const Icon = ICONS[type];
                const canAfford = state.cash >= config.cost;
                const isSelected = selected === type;
                
                return (
                  <button
                    key={type}
                    onClick={() => onSelect(isSelected ? null : type)}
                    disabled={!canAfford && !isSelected}
                    className={cn(
                      "factory-building-card w-full text-left",
                      isSelected && "selected"
                    )}
                  >
                    <div className="flex items-start gap-3 relative z-10">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-all",
                        "bg-[var(--factory-bg-deep)] border border-[var(--factory-border)]",
                        isSelected && "border-[var(--factory-amber)] shadow-[0_0_12px_var(--factory-amber-glow)]"
                      )}>
                        <Icon className={cn(
                          "w-5 h-5 transition-colors",
                          isSelected ? "text-[var(--factory-amber)]" : "text-[var(--factory-text-secondary)]"
                        )} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className={cn(
                            "font-semibold text-sm",
                            isSelected ? "text-[var(--factory-amber)]" : "text-[var(--factory-text-primary)]"
                          )}>
                            {type}
                          </span>
                          <span className={cn(
                            "font-mono text-sm font-bold flex items-center gap-1",
                            canAfford ? "text-[var(--factory-success)]" : "text-[var(--factory-danger)]"
                          )}>
                            <Coins className="w-3 h-3" />
                            {config.cost}
                          </span>
                        </div>
                        <p className="text-[11px] text-[var(--factory-text-muted)] leading-tight mt-0.5 line-clamp-2">
                          {config.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      {/* Footer Instructions */}
      <div className="p-4 border-t border-[var(--factory-border)] bg-[var(--factory-bg-deep)]">
        <p className="text-[11px] text-[var(--factory-text-muted)] leading-relaxed">
          <span className="text-[var(--factory-amber)] font-semibold">Left-click</span> on grid to place building.
          <br />
          <span className="text-[var(--factory-danger)] font-semibold">Right-click</span> to demolish.
        </p>
      </div>
    </div>
  );
}
