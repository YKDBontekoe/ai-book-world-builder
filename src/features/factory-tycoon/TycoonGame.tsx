'use client';

import React, { useState } from 'react';
import { GameProvider } from './store';
import { GameCanvas } from './components/GameCanvas';
import { BuildingPalette } from './components/BuildingPalette';
import { HUD } from './components/HUD';
import { BuildingType } from './types';
import { SoundProvider } from './audio/SoundContext';
import { loadGameState, saveGameState } from './actions';
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

interface TycoonGameProps {
  loadGameAction?: typeof loadGameState;
  saveGameAction?: typeof saveGameState;
}

export default function TycoonGame({ loadGameAction, saveGameAction }: TycoonGameProps) {
  return (
    <SoundProvider>
        <GameProvider loadGameAction={loadGameAction} saveGameAction={saveGameAction}>
          <TycoonGameContent />
        </GameProvider>
    </SoundProvider>
  );
}
