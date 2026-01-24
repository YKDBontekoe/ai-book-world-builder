'use client';

import React, { createContext, useContext, useRef, useState } from 'react';

type SoundType = 'place' | 'delete' | 'cash' | 'rotate' | 'pickup';

interface SoundContextType {
  playSound: (type: SoundType) => void;
  muted: boolean;
  toggleMute: () => void;
}

const SoundContext = createContext<SoundContextType | null>(null);

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [muted, setMuted] = useState(false);
  
  // Placeholders for Audio objects
  // TODO: load actual Audio objects from /public/sounds/ and handle lifecycle/errors
  // Tracker: https://github.com/YKDBontekoe/ai-book-world-builder/issues/969
  const audioRefs = useRef<Record<SoundType, HTMLAudioElement | null>>({
    place: null, // new Audio('/sounds/place.mp3')
    delete: null,
    cash: null,
    rotate: null,
    pickup: null,
  });

  const playSound = (type: SoundType) => {
    if (muted) return;
    
    // Real implementation:
    // const audio = audioRefs.current[type];
    // if (audio) {
    //   audio.currentTime = 0;
    //   audio.play().catch(() => {});
    // }
  };

  const toggleMute = () => setMuted((prev) => !prev);

  return (
    <SoundContext.Provider value={{ playSound, muted, toggleMute }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  const context = useContext(SoundContext);
  if (!context) throw new Error('useSound must be used within SoundProvider');
  return context;
}
