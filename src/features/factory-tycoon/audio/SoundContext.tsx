"use client";

import type React from "react";
import { createContext, useContext, useRef, useState } from "react";

type SoundType = "place" | "delete" | "cash" | "rotate" | "pickup";

interface SoundContextType {
	playSound: (type: SoundType) => void;
	muted: boolean;
	toggleMute: () => void;
}

const SoundContext = createContext<SoundContextType | null>(null);

export function SoundProvider({ children }: { children: React.ReactNode }) {
	const [muted, setMuted] = useState(false);

	// Placeholders for Audio objects
	// In a real app, we would load these from /public/sounds/
	const _audioRefs = useRef<Record<SoundType, HTMLAudioElement | null>>({
		place: null, // new Audio('/sounds/place.mp3')
		delete: null,
		cash: null,
		rotate: null,
		pickup: null,
	});

	const playSound = (type: SoundType) => {
		if (muted) return;

		// Fallback visual log if no audio
		console.log(`[Audio] Playing ${type}`);

		// Real implementation:
		// const audio = audioRefs.current[type];
		// if (audio) {
		//   audio.currentTime = 0;
		//   audio.play().catch(() => {});
		// }
	};

	const toggleMute = () => setMuted(!muted);

	return (
		<SoundContext.Provider value={{ playSound, muted, toggleMute }}>
			{children}
		</SoundContext.Provider>
	);
}

export function useSound() {
	const context = useContext(SoundContext);
	if (!context) throw new Error("useSound must be used within SoundProvider");
	return context;
}
