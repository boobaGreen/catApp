
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CanvasStage } from '../components/CanvasStage';
import { MainMenu } from '../components/MainMenu';
import { SettingsPage } from '../components/SettingsPage';
import type { GameMode } from '../engine/types';
import { useWakeLock } from '../hooks/useWakeLock';
import { useDeviceGuard } from '../hooks/useDeviceGuard';

import { DesktopBlocker } from '../components/DesktopBlocker';
import { MobileWebBlocker } from '../components/MobileWebBlocker';
import { RestScreen } from '../components/RestScreen';

type ViewState = 'menu' | 'game' | 'settings' | 'rest';

export function GamePage() {
    // DEBUG BYPASS: Allow PC testing via ?debug=1
    const searchParams = new URLSearchParams(window.location.search);
    const isDebug = searchParams.get('debug') === '1';

    const deviceStatus = useDeviceGuard();

    const [view, setView] = useState<ViewState>('menu');

    // V2: Mode Selection
    const [selectedMode, setSelectedMode] = useState<GameMode>('mouse');

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

    // --- Game Logic ---
    const startGame = (mode: GameMode) => {
        setSelectedMode(mode);
        setView('game');

        // Request Fullscreen
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch((e) => {
                console.log('Fullscreen rejected:', e);
            });
        }
    };

    const endGame = () => {
        // Stats are handled by CanvasStage live updates

        // Auto-Play Logic: Switch to REST mode
        // Auto-Play Logic: Switch to REST mode
        // DEBUG: Force Rest screen if debug is on, so we can test cooldown
        if (autoPlayActive || isDebug) {
            let cooldownMs = 0;

            if (isDebug) {
                // DEBUG MODE: Fast 5 seconds cooldown
                cooldownMs = 5000;
            } else {
                // NORMAL MODE: Load from settings
                const stored = localStorage.getItem('cat_engage_cooldown_duration');
                const cooldownMinutes = stored ? parseInt(stored) : 0;
                // Default minimal rest if 0, to restart logic (10s so user has time to cancel)
                const baseMs = (cooldownMinutes > 0 ? cooldownMinutes : 0.15) * 60 * 1000;
                cooldownMs = Math.max(5000, baseMs); // Min 5s
            }

            console.log(`🔄 Auto - Play: Resting for ${cooldownMs}ms... (Debug: ${isDebug})`);
            setCurrentCooldown(cooldownMs);
            setView('rest');
        } else {
            setView('menu');
        }
    };

    // --- RENDER ---

    // DEBUG BYPASS: Documented in docs/AI_LOGIC.md
    // (Logic moved to top of component)

    if (!isDebug) {
        if (deviceStatus === 'desktop') {
            return <DesktopBlocker />;
        }

        if (deviceStatus === 'mobile_web') {
            return <MobileWebBlocker />;
        }
    }

    return (
        <div className="w-full h-screen bg-black overflow-hidden relative font-sans select-none touch-none text-white">
            <AnimatePresence mode='wait'>
                {view === 'menu' && (
                    <motion.div
                        key="menu"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50"
                    >
                        <MainMenu
                            onStartGame={startGame}
                            onSettings={() => setView('settings')}
                            autoPlayActive={autoPlayActive}
                            onToggleAutoPlay={() => setAutoPlayActive(!autoPlayActive)}
                        />
                    </motion.div>
                )}

                {view === 'settings' && (
                    <motion.div
                        key="settings"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50"
                    >
                        <SettingsPage
                            audioEnabled={audioEnabled}
                            hapticsEnabled={hapticsEnabled}
                            onToggleAudio={() => setAudioEnabled(!audioEnabled)}
                            onToggleHaptics={() => setHapticsEnabled(!hapticsEnabled)}
                            onBack={() => setView('menu')}
                        />
                    </motion.div>
                )}

                {view === 'game' && (
                    <div key="game" className="absolute inset-0 z-50">
                        <CanvasStage
                            onExit={() => endGame()}
                            mode={selectedMode}
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
                            onWakeUp={() => startGame(selectedMode)}
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
