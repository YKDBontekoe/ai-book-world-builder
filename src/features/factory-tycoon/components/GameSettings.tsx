'use client';

import React, { useState } from 'react';
import { useGame } from '../store';
import { Trash2, Volume2, VolumeX, X, AlertTriangle, Check, X as XIcon } from 'lucide-react';
import { toast } from 'sonner';
import { saveGameState } from '../actions';
import { INITIAL_STATE } from '../config';
import { useSound } from '../audio/SoundContext';

export function GameSettings({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { state, setIsRunning } = useGame();
  const { muted, toggleMute } = useSound();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  // Pause game when menu is open, resume when closed
  React.useEffect(() => {
    if (isOpen) {
        setIsRunning(false);
    } else {
        setIsRunning(true);
        setShowResetConfirm(false); // Reset internal state
    }
  }, [isOpen, setIsRunning]);

  const handleReset = async () => {
    try {
        await saveGameState(INITIAL_STATE);
        window.location.reload();
    } catch {
        toast.error('Failed to reset game');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 factory-modal-overlay z-50 flex items-center justify-center animate-in fade-in duration-200">
      <div className="factory-modal w-96">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--factory-border)]">
          <h2 className="text-xl font-bold text-[var(--factory-text-primary)]">Game Settings</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg text-[var(--factory-text-muted)] hover:text-[var(--factory-text-primary)] hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Sound Toggle */}
          <div className="flex items-center justify-between p-4 bg-[var(--factory-bg-deep)] rounded-lg border border-[var(--factory-border)]">
            <div className="flex items-center gap-3">
              {muted ? (
                <VolumeX className="w-5 h-5 text-[var(--factory-text-muted)]" />
              ) : (
                <Volume2 className="w-5 h-5 text-[var(--factory-amber)]" />
              )}
              <span className="font-medium text-[var(--factory-text-primary)]">Sound Effects</span>
            </div>
            <button 
              onClick={toggleMute}
              className={`
                relative w-12 h-6 rounded-full transition-colors
                ${muted ? 'bg-[var(--factory-bg-card)]' : 'bg-[var(--factory-amber)]'}
              `}
            >
              <div className={`
                absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-transform
                ${muted ? 'left-1' : 'left-7'}
              `} />
            </button>
          </div>

          {/* Danger Zone */}
          <div className="p-4 bg-[var(--factory-danger)]/10 rounded-lg border border-[var(--factory-danger)]/30">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[var(--factory-danger)] shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-[var(--factory-danger)]">Danger Zone</h3>
                <p className="text-xs text-[var(--factory-danger)]/80 mt-1">
                  Reset all progress and start fresh. This action cannot be undone.
                </p>

                {!showResetConfirm ? (
                    <button
                        onClick={() => setShowResetConfirm(true)}
                        className="factory-btn-danger mt-3 w-full flex items-center justify-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        Reset All Progress
                    </button>
                ) : (
                    <div className="mt-3 flex gap-2">
                        <button
                            onClick={handleReset}
                            className="factory-btn-danger flex-1 flex items-center justify-center gap-2 text-xs"
                        >
                            <Check className="w-3 h-3" />
                            Confirm
                        </button>
                        <button
                            onClick={() => setShowResetConfirm(false)}
                            className="bg-white border border-[var(--factory-border)] rounded-lg px-3 py-2 text-xs font-semibold hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Version Info */}
          <div className="pt-4 border-t border-[var(--factory-border)] text-center">
            <p className="text-xs text-[var(--factory-text-muted)]">
              Factory Tycoon v0.1.0
            </p>
            <p className="text-[10px] text-[var(--factory-text-muted)] mt-1">
              Current Tick: <span className="font-mono text-[var(--factory-amber)]">{state.tickCount}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
