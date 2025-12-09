
import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { CanvasStage } from '../components/CanvasStage';
import { MainMenu } from '../components/MainMenu';
import { SettingsPage } from '../components/SettingsPage';
import { useWakeLock } from '../hooks/useWakeLock';

type ViewState = 'menu' | 'game' | 'settings';
type GameMode = 'classic' | 'laser';

// @ts-ignore
import { useDeviceGuard } from '../hooks/useDeviceGuard';
import { DesktopBlocker } from '../components/DesktopBlocker';
import { MobileWebBlocker } from '../components/MobileWebBlocker';

export function GamePage() {
    const deviceStatus = useDeviceGuard();

    const [view, setView] = useState<ViewState>('menu');
    const [mode, setMode] = useState<GameMode>('classic');

    // State for Auto-Play Loop (Pro Feature)
    const [autoPlayActive, setAutoPlayActive] = useState(false);

    // Wake Lock is active if playing OR if Auto-Play is waiting in menu
    useWakeLock(view === 'game' || autoPlayActive);

    // Settings State with Persistence
    const [audioEnabled, setAudioEnabled] = useState(() => {
        const stored = localStorage.getItem('cat_engage_audio');
        return stored !== null ? JSON.parse(stored) : true;
    });

    const [hapticsEnabled, setHapticsEnabled] = useState(() => {
        const stored = localStorage.getItem('cat_engage_haptics');
        return stored !== null ? JSON.parse(stored) : true;
    });

    useEffect(() => {
        localStorage.setItem('cat_engage_audio', JSON.stringify(audioEnabled));
    }, [audioEnabled]);

    useEffect(() => {
        localStorage.setItem('cat_engage_haptics', JSON.stringify(hapticsEnabled));
    }, [hapticsEnabled]);

    const startGame = (selectedMode: GameMode) => {
        setMode(selectedMode);
        setView('game');
    };

    const endGame = (_score: number) => {
        // Stats are now handled by CanvasStage auto-save mechanism
        setView('menu');

        // Auto-Play Logic: Restart after cooldown
        if (autoPlayActive) {
            // Get cooldown duration
            const stored = localStorage.getItem('cat_engage_cooldown_duration');
            const cooldownMinutes = stored ? parseInt(stored) : 0;
            const cooldownMs = cooldownMinutes * 60 * 1000;

            console.log(`🔄 Auto-Play: Resting for ${cooldownMinutes}m...`);

            // Set a timeout to restart
            // NOTE: We rely on MainMenu to show the countdown, 
            // but we need an actual trigger here or in MainMenu to restart.
            // Better approach: Let MainMenu handle the countdown UI, 
            // and we pass a prop or effect to restart when ready?
            // Actually, simplest is to use a simple timeout here if we trust the browser keeps running (WakeLock is on).

            if (cooldownMs > 0) {
                setTimeout(() => {
                    if (autoPlayActive) { // Check if still active
                        startGame(mode);
                    }
                }, cooldownMs);
            } else {
                // Immediate restart (no cooldown) -> give it a breather of 2s so it's not jarring
                setTimeout(() => {
                    if (autoPlayActive) startGame(mode);
                }, 2000);
            }
        }
    };

    // 🛡️ DEVICE GUARDS 🛡️
    if (deviceStatus === 'loading') {
        return <div className="w-full h-screen bg-black flex items-center justify-center text-gray-500">Processing...</div>;
    }

    if (deviceStatus === 'desktop') {
        return <DesktopBlocker />;
    }

    if (deviceStatus === 'mobile_web') {
        return <MobileWebBlocker />;
    }

    // Only render GAME if app is installed (TWA/PWA)
    return (
        <div className="w-full h-screen bg-black overflow-hidden relative font-sans select-none touch-none text-white">
            <AnimatePresence mode='wait'>
                {view === 'menu' && (
                    <MainMenu
                        key="menu"
                        onStartGame={startGame}
                        onSettings={() => setView('settings')}
                        autoPlayActive={autoPlayActive}
                        onToggleAutoPlay={() => setAutoPlayActive(!autoPlayActive)}
                    />
                )}

                {view === 'settings' && (
                    <SettingsPage
                        key="settings"
                        audioEnabled={audioEnabled}
                        hapticsEnabled={hapticsEnabled}
                        onToggleAudio={() => setAudioEnabled(!audioEnabled)}
                        onToggleHaptics={() => setHapticsEnabled(!hapticsEnabled)}
                        onBack={() => setView('menu')}
                    />
                )}

                {view === 'game' && (
                    <div key="game" className="absolute inset-0 z-50">
                        <CanvasStage
                            mode={mode}
                            onExit={endGame}
                            audioEnabled={audioEnabled}
                            hapticsEnabled={hapticsEnabled}
                        />
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
