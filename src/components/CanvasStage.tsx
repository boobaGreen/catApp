import React, { useEffect, useRef } from 'react';
import { Game } from '../engine/Game';

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

    // Long Press State
    const [isPressingExit, setIsPressingExit] = React.useState(false);
    const exitTimerRef = useRef<number | null>(null);

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

    // Long Press Logic
    const startExitPress = () => {
        setIsPressingExit(true);
        exitTimerRef.current = window.setTimeout(() => {
            // Trigger Exit
            setIsPressingExit(false);
            if (gameRef.current) {
                const score = gameRef.current.getScore();
                onExit(score);
            }
        }, 2000); // 2 seconds hold
    };

    const cancelExitPress = () => {
        setIsPressingExit(false);
        if (exitTimerRef.current) {
            clearTimeout(exitTimerRef.current);
            exitTimerRef.current = null;
        }
    };

    return (
        <div className="relative w-full h-full bg-black overflow-hidden select-none">
            <canvas
                ref={canvasRef}
                className="block w-full h-full touch-none relative z-10"
                onTouchStart={handleTouchStart}
                onMouseDown={handleMouseDown}
            />

            {/* "Cat-Proof" Exit Button */}
            <div
                className="absolute top-4 right-4 z-50 text-white/20 p-4 active:text-white/80 transition-colors duration-500"
                onTouchStart={startExitPress}
                onTouchEnd={cancelExitPress}
                onMouseDown={startExitPress}
                onMouseUp={cancelExitPress}
                onMouseLeave={cancelExitPress}
            >
                {/* Visual Indicator of Press */}
                <div className="relative w-8 h-8 rounded-full border-2 border-current flex items-center justify-center">
                    <div className={`w-full h-full bg-white rounded-full transition-all ease-linear ${isPressingExit ? 'opacity-100 scale-100 duration-[2000ms]' : 'opacity-0 scale-0 duration-100'}`} />
                    <span className="absolute text-[10px] font-bold mix-blend-difference">X</span>
                </div>
            </div>
        </div>
    );
};
