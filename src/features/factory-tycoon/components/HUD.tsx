'use client';

import React, { useState } from 'react';
import { useGame } from '../store';
import { Coins, Database, Activity, Play, Pause, Settings, Beaker, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GameSettings } from './GameSettings';
import { ResearchModal } from './ResearchModal';
import { RESOURCE_VALUES } from '../config';
import { Button } from '@/components/atoms/button';
import { ScrollArea } from '@/components/atoms/scroll-area';
import { Progress } from '@/components/atoms/progress';

const RESOURCE_ICONS: Record<string, { icon: string; color: string }> = {
  ore: { icon: '/images/factory-tycoon/ore.png', color: 'text-amber-600' },
  ingot: { icon: '/images/factory-tycoon/ingot.png', color: 'text-orange-500' },
  gadget: { icon: '/images/factory-tycoon/gadget.png', color: 'text-blue-600' },
  science: { icon: '/images/factory-tycoon/science.png', color: 'text-purple-600' },
};

export function HUD() {
  const { state, isRunning, setIsRunning, sellResource } = useGame();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isResearchOpen, setIsResearchOpen] = useState(false);
  
  const totalVolume = Object.values(state.inventory).reduce((a, b) => a + b, 0);
  const capacityPct = Math.min(100, (totalVolume / state.capacity) * 100);
  const cashDelta = state.lastTickDelta.cash ?? 0;

  return (
    <>
    <GameSettings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    <ResearchModal isOpen={isResearchOpen} onClose={() => setIsResearchOpen(false)} />
    
    <div className="glass-panel w-80 shrink-0 h-full flex flex-col overflow-hidden border border-border/50 bg-background/50 backdrop-blur-xl">
      
      {/* Header with Controls */}
      <div className="flex items-center justify-between p-4 border-b border-border/50 bg-background/40">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-amber-500" />
          <span className="font-bold text-foreground">Control Panel</span>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsResearchOpen(true)}
            className="h-8 w-8 text-muted-foreground hover:text-purple-400 hover:bg-purple-500/10"
            title="Research"
          >
            <Beaker className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSettingsOpen(true)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">

          {/* Simulation Status */}
          <div className="flex items-center justify-between bg-muted/30 p-3 rounded-lg border border-border/50">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Tick</div>
              <div className="font-mono text-2xl font-bold text-amber-500">{state.tickCount}</div>
            </div>
            <Button
              onClick={() => setIsRunning(!isRunning)}
              variant={isRunning ? "secondary" : "default"}
              className={cn(
                "w-24 gap-2",
                isRunning && "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-200/50"
              )}
            >
              {isRunning ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> Start</>}
            </Button>
          </div>

          {/* Finances */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-2">
              <Coins className="w-4 h-4 text-yellow-500" />
              Finances
            </h3>

            <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-3xl font-bold text-emerald-600 dark:text-emerald-400">${state.cash}</span>
                <div className={cn(
                  "flex items-center gap-1 text-xs font-mono px-2 py-1 rounded",
                  cashDelta > 0 ? "text-emerald-600 bg-emerald-500/10" :
                  cashDelta < 0 ? "text-red-500 bg-red-500/10" : "text-muted-foreground"
                )}>
                  {cashDelta > 0 ? <TrendingUp className="w-3 h-3" /> :
                   cashDelta < 0 ? <TrendingDown className="w-3 h-3" /> :
                   <Minus className="w-3 h-3" />}
                  {cashDelta > 0 ? '+' : ''}{cashDelta}/tick
                </div>
              </div>
            </div>
          </div>

          {/* Research */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-2">
              <Beaker className="w-4 h-4 text-purple-400" />
              Research
            </h3>

            <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-3xl font-bold text-purple-500">{state.science}</span>
                <div className={cn(
                  "flex items-center gap-1 text-xs font-mono px-2 py-1 rounded",
                  (state.lastTickDelta.science ?? 0) > 0 ? "text-emerald-600 bg-emerald-500/10" : "text-muted-foreground"
                )}>
                  {(state.lastTickDelta.science ?? 0) > 0 ? <TrendingUp className="w-3 h-3" /> :
                   <Minus className="w-3 h-3" />}
                  {(state.lastTickDelta.science ?? 0) > 0 ? '+' : ''}{state.lastTickDelta.science ?? 0}/tick
                </div>
              </div>
            </div>
          </div>

          {/* Storage Capacity */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-400" />
              Storage
            </h3>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Capacity</span>
                <span className="font-mono text-foreground">{totalVolume} / {state.capacity}</span>
              </div>
              <Progress
                value={capacityPct}
                className={cn(
                  "h-2",
                  capacityPct > 90 ? "[&>div]:bg-red-500" :
                  capacityPct > 75 ? "[&>div]:bg-amber-500" : "[&>div]:bg-blue-500"
                )}
              />
            </div>
          </div>

          {/* Inventory */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
              Inventory
            </h3>

            <div className="space-y-2">
              {Object.entries(state.inventory).map(([res, count]) => {
                const delta = state.lastTickDelta[res as keyof typeof state.inventory] ?? 0;
                const config = RESOURCE_ICONS[res];
                const value = RESOURCE_VALUES[res as keyof typeof RESOURCE_VALUES] || 0;

                return (
                  <div key={res} className="flex flex-col gap-2 p-3 bg-card border border-border/50 rounded-lg shadow-sm hover:border-amber-500/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 flex items-center justify-center bg-muted/50 rounded-md border border-border/50 p-1">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={config?.icon} alt={res} className="w-full h-full object-contain" />
                        </div>
                        <span className={cn(
                          "capitalize font-medium text-sm",
                          config?.color || 'text-foreground'
                        )}>
                          {res}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "text-xs font-mono w-10 text-right",
                          delta > 0 ? 'text-emerald-600' :
                          delta < 0 ? 'text-red-500' :
                          'text-muted-foreground'
                        )}>
                          {delta > 0 ? '+' : ''}{delta !== 0 ? delta : '-'}
                        </span>
                        <span className="text-xl font-mono font-bold text-foreground w-10 text-right">
                          {count}
                        </span>
                      </div>
                    </div>

                    {value > 0 && (
                      <Button
                          variant="outline"
                          size="sm"
                          onClick={() => sellResource(res as any)}
                          disabled={count <= 0}
                          className={cn(
                              "w-full h-7 text-[10px] gap-1",
                              count > 0
                                  ? "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border-emerald-200"
                                  : "opacity-50"
                          )}
                      >
                          <Coins className="w-3 h-3" />
                          Sell 1 for ${value}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </ScrollArea>
      
      {/* Footer Stats */}
      <div className="grid grid-cols-3 gap-px bg-border/50 border-t border-border/50 p-px">
        <div className="flex flex-col items-center gap-1 p-2 bg-background/50">
          <span className="font-mono text-lg font-bold text-emerald-600">{state.buildings.filter(b => b.status === 'RUNNING').length}</span>
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Running</span>
        </div>
        <div className="flex flex-col items-center gap-1 p-2 bg-background/50">
          <span className="font-mono text-lg font-bold text-amber-500">{state.buildings.filter(b => b.status === 'STARVED').length}</span>
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Starved</span>
        </div>
        <div className="flex flex-col items-center gap-1 p-2 bg-background/50">
          <span className="font-mono text-lg font-bold text-red-500">{state.buildings.filter(b => b.status === 'BLOCKED').length}</span>
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Blocked</span>
        </div>
      </div>
    </div>
    </>
  );
}
