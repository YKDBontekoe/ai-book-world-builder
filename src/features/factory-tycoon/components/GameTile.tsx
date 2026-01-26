import React, { memo } from 'react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/atoms/tooltip';
import { BUILDINGS } from '../config';
import { BuildingEntity, BuildingType, Direction, Resource } from '../types';
import { ICONS, STATUS_CONFIG, BUILDING_COLORS, getRotation } from './visuals';

interface GameTileProps {
  x: number;
  y: number;
  building: BuildingEntity | undefined;
  selectedBuilding: BuildingType | null;
  currentDirection: Direction; // Passed for preview rotation
  isHovered: boolean;
  onInteract: (x: number, y: number) => void;
  onContext: (e: React.MouseEvent, id?: string) => void;
  onHover: (coords: { x: number; y: number }) => void;
}

const GameTile = memo(({
  x,
  y,
  building,
  selectedBuilding,
  currentDirection,
  isHovered,
  onInteract,
  onContext,
  onHover
}: GameTileProps) => {
  const Icon = building ? ICONS[building.type] : null;
  const statusConfig = building ? STATUS_CONFIG[building.status] : null;
  const StatusIcon = statusConfig?.Icon;
  const buildingColor = building ? BUILDING_COLORS[building.type] : '';
  const rotation = building ? getRotation(building.type, building.direction) : 0;

  const content = (
    <div
      onClick={() => onInteract(x, y)}
      onContextMenu={(e) => onContext(e, building?.id)}
      onMouseEnter={() => onHover({ x, y })}
      className={cn(
        "factory-tile group relative",
        building && "has-building",
        !building && selectedBuilding && "cursor-crosshair"
      )}
      style={{
        background: building
          ? 'var(--factory-bg-elevated)'
          : (x + y) % 2 === 0
            ? 'var(--factory-bg-card)'
            : 'var(--factory-bg-panel)'
      }}
    >
      {building && Icon && (
        <>
          <div
            className={cn(
              "relative z-10 transition-all duration-300",
              building.status === 'RUNNING' && building.type !== 'Belt' && "scale-110"
            )}
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <Icon className={cn(
              "w-7 h-7 transition-all duration-300",
              buildingColor || 'text-slate-400',
              building.status === 'RUNNING' && building.type !== 'Belt' && "drop-shadow-[0_0_8px_currentColor]",
              building.status === 'RUNNING' && building.type === 'Mine' && "animate-shake-vertical",
              building.status === 'RUNNING' && (building.type === 'Smelter' || building.type === 'Factory') && "animate-working-pulse",
              building.status === 'RUNNING' && building.type === 'Lab' && "animate-pulse",
              building.status === 'RUNNING' && building.type === 'Inserter' && "animate-swing"
            )} />
          </div>

          {/* Status Indicator (Not for Belt/Splitter to avoid clutter) */}
          {building.type !== 'Belt' && building.type !== 'Splitter' && (
            <div className={cn("status-indicator", statusConfig?.className)} />
          )}

          {/* Problem Overlay */}
          {building.status !== 'RUNNING' && building.status !== 'IDLE' && StatusIcon && building.type !== 'Belt' && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center animate-in fade-in zoom-in duration-200 z-20">
              <StatusIcon
                className={cn(
                  "w-6 h-6 drop-shadow-lg",
                  building.status === 'BLOCKED' ? "text-red-400" : "text-amber-400"
                )}
              />
            </div>
          )}
        </>
      )}

      {/* Hover Preview for Empty Tiles */}
      {!building && selectedBuilding && isHovered && (
        <div className="absolute inset-0 flex items-center justify-center opacity-60 transition-opacity">
          {(() => {
            const PreviewIcon = ICONS[selectedBuilding];
            const previewRot = getRotation(selectedBuilding, currentDirection);
            return (
              <div style={{ transform: `rotate(${previewRot}deg)` }}>
                <PreviewIcon className="w-6 h-6 text-amber-400" />
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );

  if (!building) return content;
  if (building.type === 'Belt') return content; // No tooltip for belts

  const config = BUILDINGS[building.type];

  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        {content}
      </TooltipTrigger>
      <TooltipContent
        side="right"
        className="factory-panel flex flex-col gap-2 p-3 min-w-[180px]"
      >
        <div className="flex items-center justify-between gap-3">
          <span className="font-bold text-[var(--factory-text-primary)]">
            {building.type}
          </span>
          <span
            className="text-[10px] uppercase px-2 py-0.5 rounded-full font-bold"
            style={{
              background: statusConfig?.color,
              color: '#0a0e14'
            }}
          >
            {building.status}
          </span>
        </div>
        <p className="text-xs text-[var(--factory-text-secondary)]">
          {config.description}
        </p>
        <div className="text-xs border-t border-[var(--factory-border)] pt-2 text-[var(--factory-text-muted)]">
          {statusConfig?.label}
        </div>
        {building.localInventory && (
          <div className="text-xs border-t border-[var(--factory-border)] pt-2">
            <div>Inventory:</div>
            {Object.entries(building.localInventory).map(([k, v]) => (
              <div key={k}>{k}: {v}</div>
            ))}
          </div>
        )}
        <div className="text-[10px] text-[var(--factory-amber)] italic">
          Right-click to demolish. R to rotate.
        </div>
      </TooltipContent>
    </Tooltip>
  );
}, (prev, next) => {
  // Custom Comparison Function for React.memo

  // 1. Primitive checks
  if (prev.x !== next.x) return false;
  if (prev.y !== next.y) return false;
  if (prev.isHovered !== next.isHovered) return false;
  if (prev.selectedBuilding !== next.selectedBuilding) return false;
  if (prev.currentDirection !== next.currentDirection) return false;

  // 2. Building existence check
  const b1 = prev.building;
  const b2 = next.building;

  if (!b1 && !b2) return true; // Both empty
  if (!b1 || !b2) return false; // One empty, one not

  // 3. Building Identity & Visual State checks
  if (b1.id !== b2.id) return false;
  if (b1.type !== b2.type) return false;
  if (b1.status !== b2.status) return false;
  if (b1.direction !== b2.direction) return false;

  // 4. Inventory check (shallow equality is enough for Record<string, number>)
  // If one has inventory and other doesn't
  if (!!b1.localInventory !== !!b2.localInventory) return false;

  if (b1.localInventory && b2.localInventory) {
      const k1 = Object.keys(b1.localInventory);
      const k2 = Object.keys(b2.localInventory);
      if (k1.length !== k2.length) return false;

      for (const key of k1) {
          const resKey = key as Resource;
          if (b1.localInventory[resKey] !== b2.localInventory[resKey]) return false;
      }
  }

  // NOTE: We deliberately IGNORE b.beltItems and b.holdingItem
  // because they are rendered in a separate global layer (GameCanvas -> allItems).
  // The Tile component purely renders the building icon/status.

  return true;
});

export default GameTile;
