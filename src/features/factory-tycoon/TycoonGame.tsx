"use client";

import React, { useState } from "react";
import type { loadGameState, saveGameState } from "./actions";
import { SoundProvider } from "./audio/SoundContext";
import { BuildingPalette } from "./components/BuildingPalette";
import { GameCanvas } from "./components/GameCanvas";
import { HUD } from "./components/HUD";
import { GameProvider, useGame } from "./store";
import type { BuildingType } from "./types";
import "./factory-theme.css";

function TycoonGameContent() {
	const [selectedBuilding, setSelectedBuilding] = useState<BuildingType | null>(
		null,
	);
	const { isLoading } = useGame();

	return (
		<div className="factory-theme flex h-screen w-full overflow-hidden relative">
			<BuildingPalette
				selected={selectedBuilding}
				onSelect={setSelectedBuilding}
			/>
			<GameCanvas selectedBuilding={selectedBuilding} />
			<HUD />
			{isLoading && (
				<div
					className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 text-white font-mono text-xl backdrop-blur-sm"
					data-testid="loading-indicator"
				>
					INITIALIZING SYSTEMS...
				</div>
			)}
		</div>
	);
}

interface TycoonGameProps {
	loadGameAction?: typeof loadGameState;
	saveGameAction?: typeof saveGameState;
}

export default function TycoonGame({
	loadGameAction,
	saveGameAction,
}: TycoonGameProps): JSX.Element {
	return (
		<SoundProvider>
			<GameProvider
				loadGameAction={loadGameAction}
				saveGameAction={saveGameAction}
			>
				<TycoonGameContent />
			</GameProvider>
		</SoundProvider>
	);
}
