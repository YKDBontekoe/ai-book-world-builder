"use client";

import { useState } from "react";
import { SoundProvider } from "./audio/SoundContext";
import { BuildingPalette } from "./components/BuildingPalette";
import { GameCanvas } from "./components/GameCanvas";
import { HUD } from "./components/HUD";
import { GameProvider } from "./store";
import type { BuildingType } from "./types";
import "./factory-theme.css";

function TycoonGameContent() {
	const [selectedBuilding, setSelectedBuilding] = useState<BuildingType | null>(
		null,
	);

	return (
		<div className="factory-theme flex h-screen w-full overflow-hidden">
			<BuildingPalette
				selected={selectedBuilding}
				onSelect={setSelectedBuilding}
			/>
			<GameCanvas selectedBuilding={selectedBuilding} />
			<HUD />
		</div>
	);
}

export default function TycoonGame(): JSX.Element {
	return (
		<SoundProvider>
			<GameProvider>
				<TycoonGameContent />
			</GameProvider>
		</SoundProvider>
	);
}
