'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { TooltipProvider } from '@/components/atoms/tooltip';
import { useSound } from '../audio/SoundContext';
import { GRID_SIZE, TICK_RATE_MS } from '../config';
import { useGame } from '../store';
import type { BeltItem, BuildingType, Direction } from '../types';
import GameTile from './GameTile';
import { getRotation, RESOURCE_COLORS } from './visuals';

export function GameCanvas({ selectedBuilding }: { selectedBuilding: BuildingType | null }) {
  const { state, addBuilding, removeBuilding, rotateBuilding, manualInteract } = useGame();
  const { playSound } = useSound();
  const [currentDirection, setCurrentDirection] = useState<Direction>('N');
  const [hoveredTile, setHoveredTile] = useState<{x: number, y: number} | null>(null);
  
  const cycleDirection = useCallback(() => {
      const dirs: Direction[] = ['N', 'E', 'S', 'W'];
      setCurrentDirection(prev => {
          const idx = dirs.indexOf(prev);
          return dirs[(idx + 1) % 4];
      });
  }, []);

  // Keyboard listener for Rotation
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key.toLowerCase() === 'r') {
              if (hoveredTile) {
                  const building = state.buildings.find(b => b.x === hoveredTile.x && b.y === hoveredTile.y);
                  if (building) {
                      rotateBuilding(building.id);
                      playSound('rotate'); // assume sound exists or fail gracefully
                  } else {
                      // Rotate placement
                      cycleDirection();
                  }
              } else {
                  cycleDirection();
              }
          }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hoveredTile, state.buildings, rotateBuilding, playSound, cycleDirection]);

  // Stable Handlers for GameTile
  const handleTileClick = useCallback((x: number, y: number) => {
    if (selectedBuilding) {
        addBuilding(selectedBuilding, x, y, currentDirection);
        playSound('place');
    } else {
        // Manual Interaction (Pickup items, collect output)
        manualInteract(x, y);
        playSound('pickup');
    }
  }, [selectedBuilding, addBuilding, currentDirection, manualInteract, playSound]);

  const handleContextMenu = useCallback((e: React.MouseEvent, id?: string) => {
    e.preventDefault();
    if (id) {
        removeBuilding(id);
        playSound('delete');
    }
  }, [removeBuilding, playSound]);

  // Create a map for O(1) lookup
  const buildingMap = new Map();
  state.buildings.forEach(b => {
      buildingMap.set(`${b.x},${b.y}`, b);
  });

  // Collect all items for global rendering
  const allItems: Array<{ item: BeltItem, x: number, y: number, color: string }> = [];
  state.buildings.forEach(b => {
      if (b.beltItems) {
          b.beltItems.forEach(item => {
              let itemX = b.x;
              let itemY = b.y;
              const p = item.position;
              if (b.direction === 'E') { itemX += p; itemY += 0.5; }
              else if (b.direction === 'W') { itemX += (1 - p); itemY += 0.5; }
              else if (b.direction === 'S') { itemX += 0.5; itemY += p; }
              else if (b.direction === 'N') { itemX += 0.5; itemY += (1 - p); }
              
              allItems.push({ item, x: itemX, y: itemY, color: RESOURCE_COLORS[item.resource] });
          });
      }
      if (b.holdingItem) {
          const item = b.holdingItem;
          let itemX = b.x;
          let itemY = b.y;
          const p = item.position; // 0 to 1
          
          const dx = b.direction === 'E' ? 1 : b.direction === 'W' ? -1 : 0;
          const dy = b.direction === 'S' ? 1 : b.direction === 'N' ? -1 : 0;
          
          itemX = b.x + 0.5 + (p - 0.5) * dx;
          itemY = b.y + 0.5 + (p - 0.5) * dy;

          allItems.push({ item, x: itemX, y: itemY, color: RESOURCE_COLORS[item.resource] });
      }
  });

  return (
    <TooltipProvider>
    <div className="flex-1 overflow-auto factory-grid-bg flex justify-center items-center p-8">
      <div 
        className="relative rounded-lg overflow-hidden"
        style={{ 
            boxShadow: '0 0 60px rgba(245, 158, 11, 0.1), 0 25px 50px rgba(0, 0, 0, 0.5)',
            border: '1px solid var(--factory-border)',
        }}
      >
        <div 
            className="grid"
            style={{ 
                gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            }}
            onMouseLeave={() => setHoveredTile(null)}
        >
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                const x = i % GRID_SIZE;
                const y = Math.floor(i / GRID_SIZE);
                const building = buildingMap.get(`${x},${y}`);
                const isHovered = hoveredTile?.x === x && hoveredTile?.y === y;

                return (
                    <GameTile
                        key={`${x}-${y}`}
                        x={x}
                        y={y}
                        building={building}
                        selectedBuilding={selectedBuilding}
                        currentDirection={currentDirection}
                        isHovered={isHovered}
                        onInteract={handleTileClick}
                        onContext={handleContextMenu}
                        onHover={setHoveredTile}
                    />
                );
            })}
        </div>
        
        {/* Global Item Layer */}
        <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
            <AnimatePresence mode="popLayout">
                {allItems.map(({ item, x, y, color }) => (
                    <motion.div
                        key={item.id}
                        initial={false}
                        animate={{ 
                            left: `${(x / GRID_SIZE) * 100}%`,
                            top: `${(y / GRID_SIZE) * 100}%`
                        }}
                        transition={{ 
                            type: 'tween', 
                            ease: 'linear', 
                            duration: TICK_RATE_MS / 1000
                        }}
                        className="absolute w-2 h-2 rounded-full shadow-sm border border-black/20"
                        style={{
                            backgroundColor: color,
                            transform: 'translate(-50%, -50%)'
                        }}
                    />
                ))}
            </AnimatePresence>
        </div>
      </div>
      
      {/* Current Direction Indicator (Bottom Right of Canvas) */}
      <div className="absolute bottom-8 right-8 bg-[var(--factory-bg-panel)] p-4 rounded border border-[var(--factory-border)]">
          <div className="text-xs text-[var(--factory-text-muted)] mb-1">Rotation (R)</div>
          <ArrowRight 
            className="w-8 h-8 text-[var(--factory-text-primary)] transition-transform duration-200" 
            style={{ transform: `rotate(${getRotation('Belt', currentDirection)}deg)` }}
          />
      </div>
    </div>
    </TooltipProvider>
  );
}
