import React, { useEffect, useRef } from 'react';
import { Game } from '../engine/Game';
import { ExitSlider } from './ExitSlider';
import { useCatProfiles } from '../hooks/useCatProfiles';

import type { GameMode } from '../engine/types';

interface CanvasStageProps {
    onExit: () => void;
    mode: GameMode;
    audioEnabled: boolean;
    hapticsEnabled: boolean;
}

export const CanvasStage: React.FC<CanvasStageProps> = ({ onExit, mode, audioEnabled, hapticsEnabled }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gameRef = useRef<Game | null>(null);
    const latestProfileRef = useRef<any>(null); // To track latest stats for callbacks

    // Profiles Hook
    const { activeProfileId, updateProfile, activeProfile } = useCatProfiles();

    // Keep ref updated
    useEffect(() => {
        latestProfileRef.current = activeProfile;
    }, [activeProfile]);

    // Handle game initialization
    useEffect(() => {
        if (!canvasRef.current) return;

        // Check Premium State for Session Limit
        const isPremium = localStorage.getItem('isPremium') === 'true';
        let sessionLimit = 90; // Default Free: 90s
        if (isPremium) {
            const storedDuration = localStorage.getItem('cat_engage_play_duration');
            const minutes = storedDuration ? parseInt(storedDuration) : 0;
            sessionLimit = minutes === 0 ? Infinity : minutes * 60;
        }

        const handleSessionComplete = () => {
            console.log("Session Limit Reached.");
            localStorage.setItem('lastSessionEnd', Date.now().toString());

            // Increment sessions count
            if (activeProfileId && latestProfileRef.current) {
                updateProfile(activeProfileId, {
                    stats: {
                        ...latestProfileRef.current.stats,
                        sessionsCompleted: (latestProfileRef.current.stats.sessionsCompleted || 0) + 1
                    }
                });
            }
            onExit();
        };

        // Initialize Game
        const initialConfidence = activeProfile?.stats?.preyConfidence ?? 0.5;
        gameRef.current = new Game(canvasRef.current, handleSessionComplete, initialConfidence);
        gameRef.current.sessionLimit = sessionLimit;

        // Bind Stat Updates
        gameRef.current.onStatUpdate = (delta) => {
            if (!activeProfileId || !latestProfileRef.current) return;

            const currentStats = latestProfileRef.current.stats;
            // Merge deep stats carefully
            const newStats = {
                ...currentStats,
                totalPlayTime: (currentStats.totalPlayTime || 0) + (delta.totalPlayTime || 0),
                preyCaught: (currentStats.preyCaught || 0) + (delta.preyCaught || 0),
                catReflexesScore: Math.min(100, (currentStats.catReflexesScore || 0) + (delta.catReflexesScore || 0)),
                preyConfidence: Math.max(0, Math.min(1, (currentStats.preyConfidence || 0.5) + (delta.preyConfidence || 0))),
                // Map merge for preyCounts
                preyCounts: {
                    mouse: (currentStats.preyCounts?.mouse || 0) + (delta.preyCounts?.mouse || 0),
                    insect: (currentStats.preyCounts?.insect || 0) + (delta.preyCounts?.insect || 0),
                    worm: (currentStats.preyCounts?.worm || 0) + (delta.preyCounts?.worm || 0),
                    laser: (currentStats.preyCounts?.laser || 0) + (delta.preyCounts?.laser || 0),
                }
            };

            updateProfile(activeProfileId, { stats: newStats });
        };

        // Initial settings
        gameRef.current.setAudioEnabled(audioEnabled);
        gameRef.current.setHapticsEnabled(hapticsEnabled);

        // Resize and Start
        gameRef.current.resize(window.innerWidth, window.innerHeight);

        // Resolve actual mode if shuffle
        let effectiveMode = mode;
        if (mode === 'shuffle') {
            effectiveMode = Math.random() > 0.5 ? 'classic' : 'laser';
        }

        // Use type assertion if needed, but Game.start accepts specific string values or GameMode type
        // The Game class expects 'classic' | 'laser' | 'shuffle' but internally handles logic.
        // Actually, if we resolved it here, we should pass the resolved mode.
        // But Game.currentMode is typed as 'classic' | 'laser' | 'shuffle'.
        // Let's pass the effective resolved mode to avoid Game loop confusion.
        // Cast to 'classic' | 'laser' which are valid for start().
        // Wait, start() accepts GameMode (which implies 'shuffle' is valid passed in).
        // My previous logic was: "GameDirector decides 'laser' vs others".
        // But 'shuffle' isn't a Prey type.
        // Let's pass the effective one.
        gameRef.current.start(effectiveMode as 'classic' | 'laser');

        return () => {
            gameRef.current?.stop();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run on mount only for the game instance

    // Update settings live
    useEffect(() => {
        if (gameRef.current) {
            gameRef.current.setAudioEnabled(audioEnabled);
            gameRef.current.setHapticsEnabled(hapticsEnabled);
        }
    }, [audioEnabled, hapticsEnabled]);

    // Resize Handler
    useEffect(() => {
        const handleResize = () => {
            if (gameRef.current) {
                gameRef.current.resize(window.innerWidth, window.innerHeight);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleTouchStart = (e: React.TouchEvent) => {
        if (!gameRef.current) return;
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            gameRef.current.handleTouch(touch.clientX, touch.clientY);
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!gameRef.current) return;
        gameRef.current.handleTouch(e.clientX, e.clientY);
    };

    const handleManualExit = () => {
        // Just call onExit, GamePage handles the rest
        onExit();
    };

    return (
        <div className="relative w-full h-full bg-black overflow-hidden select-none">
            <canvas
                ref={canvasRef}
                className="block w-full h-full touch-none relative z-10"
                onTouchStart={handleTouchStart}
                onMouseDown={handleMouseDown}
            />

            {/* "Cat-Proof" Slide to Exit */}
            <ExitSlider onExit={handleManualExit} />
        </div>
    );
};
