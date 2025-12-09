import React, { useEffect, useRef } from 'react';
import { Game } from '../engine/Game';
import { ExitSlider } from './ExitSlider';

interface CanvasStageProps {
    mode: 'classic' | 'laser';
    onExit: (score: number) => void;
    audioEnabled: boolean;
    hapticsEnabled: boolean;
}

export const CanvasStage: React.FC<CanvasStageProps> = ({ /* mode, */ onExit, audioEnabled, hapticsEnabled }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gameRef = useRef<Game | null>(null);
    const startTimeRef = useRef(Date.now());

    // Update settings live
    useEffect(() => {
        if (gameRef.current) {
            gameRef.current.setAudioEnabled(audioEnabled);
            gameRef.current.setHapticsEnabled(hapticsEnabled);
        }
    }, [audioEnabled, hapticsEnabled]);

    useEffect(() => {
        if (!canvasRef.current) return;

        // Check Premium State
        const isPremium = localStorage.getItem('isPremium') === 'true';

        let sessionLimit = 90; // Default Free: 90s

        if (isPremium) {
            const storedDuration = localStorage.getItem('cat_engage_play_duration');
            const minutes = storedDuration ? parseInt(storedDuration) : 0;
            // 0 means Unlimited (Infinity), otherwise minutes * 60
            sessionLimit = minutes === 0 ? Infinity : minutes * 60;
        }

        console.log(`Starting Game with Limit: ${sessionLimit === Infinity ? 'Unlimited' : sessionLimit + 's'}`);

        const handleSessionComplete = () => {
            console.log("Session Limit Reached. Triggering Rest Phase.");
            localStorage.setItem('lastSessionEnd', Date.now().toString());
            // Need to ensure we exit safely
            onExit(gameRef.current?.getScore() || 0);
        };

        gameRef.current = new Game(canvasRef.current, handleSessionComplete);
        gameRef.current.setSessionLimit(sessionLimit);

        // Init settings
        gameRef.current.setAudioEnabled(audioEnabled);
        gameRef.current.setHapticsEnabled(hapticsEnabled);

        startTimeRef.current = Date.now();

        // Initial Resize
        gameRef.current.resize(window.innerWidth, window.innerHeight);

        const handleResize = () => {
            if (canvasRef.current && gameRef.current) {
                gameRef.current.resize(window.innerWidth, window.innerHeight);
            }
        };

        window.addEventListener('resize', handleResize);

        // Start Game
        gameRef.current.start();

        return () => {
            window.removeEventListener('resize', handleResize);
            gameRef.current?.stop();
        };
    }, []);

    const handleTouchStart = (e: React.TouchEvent) => {
        // e.preventDefault(); // CSS touch-action: none handles this
        if (!gameRef.current) return;

        // Handle multi-touch
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            gameRef.current.handleTouch(touch.clientX, touch.clientY);
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!gameRef.current) return;
        gameRef.current.handleTouch(e.clientX, e.clientY);
    };

    const handleExit = () => {
        const score = gameRef.current?.getScore() || 0;
        onExit(score);
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
            <ExitSlider onExit={handleExit} />
        </div>
    );
};
