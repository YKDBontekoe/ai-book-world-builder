'use client';

import React, { useState } from 'react';
import { GameProvider } from './store';
import { GameCanvas } from './components/GameCanvas';
import { BuildingPalette } from './components/BuildingPalette';
import { HUD } from './components/HUD';
import { BuildingType } from './types';
import { SoundProvider } from './audio/SoundContext';
import './factory-theme.css';

function TycoonGameContent() {
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingType | null>(null);

  return (
    <div className="factory-theme flex h-screen w-full overflow-hidden">
      <BuildingPalette selected={selectedBuilding} onSelect={setSelectedBuilding} />
      <GameCanvas selectedBuilding={selectedBuilding} />
      <HUD />
    </div>
  );
}

export default function TycoonGame() {
  return (
    <SoundProvider>
        <GameProvider>
          <TycoonGameContent />
        </GameProvider>
    </SoundProvider>
  );
}