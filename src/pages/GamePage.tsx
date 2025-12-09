
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CanvasStage } from '../components/CanvasStage';
import { MainMenu } from '../components/MainMenu';
import { SettingsPage } from '../components/SettingsPage';
import { useWakeLock } from '../hooks/useWakeLock';
import { useDeviceGuard } from '../hooks/useDeviceGuard';

import { DesktopBlocker } from '../components/DesktopBlocker';
import { MobileWebBlocker } from '../components/MobileWebBlocker';
import { RestScreen } from '../components/RestScreen';

type ViewState = 'menu' | 'game' | 'settings' | 'rest';
type GameMode = 'classic' | 'laser';

export function GamePage() {
    const deviceStatus = useDeviceGuard();

    const [view, setView] = useState<ViewState>('menu');
    const [mode, setMode] = useState<GameMode>('classic');

    // State for Auto-Play Loop (Pro Feature)
    const [autoPlayActive, setAutoPlayActive] = useState(false);

    // Track cooldown duration for Rest Screen
    const [currentCooldown, setCurrentCooldown] = useState(0);

    // Wake Lock is active if playing OR if Auto-Play is waiting in REST mode
    useWakeLock(view === 'game' || view === 'rest');

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
        // Force Fullscreen for immersion/cat-proofing
        try {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen().catch((e) => {
                    console.warn("Fullscreen request failed:", e);
                });
            }
        } catch (e) {
            // Ignore errors (e.g. not allowed by user gesture rules, though click should allow it)
        }

        setMode(selectedMode);
        setView('game');
    };

    const endGame = (_score: number) => {
        // Stats are now handled by CanvasStage auto-save mechanism

        // Auto-Play Logic: Switch to REST mode
        if (autoPlayActive) {
            const stored = localStorage.getItem('cat_engage_cooldown_duration');
            const cooldownMinutes = stored ? parseInt(stored) : 0;
            // Default minimal rest if 0, to restart logic (10s)
            const cooldownMs = (cooldownMinutes > 0 ? cooldownMinutes : 0.1) * 60 * 1000;

            console.log(`🔄 Auto-Play: Resting for ${cooldownMs}ms...`);
            setCurrentCooldown(cooldownMs);
            setView('rest');
        } else {
            setView('menu');
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

                {view === 'rest' && (
                    <motion.div
                        key="rest"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50"
                    >
                        <RestScreen
                            durationMs={currentCooldown}
                            onWakeUp={() => startGame(mode)}
                            onExit={() => {
                                setAutoPlayActive(false);
                                setView('menu');
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
