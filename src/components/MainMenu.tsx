import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { InfoModal } from './InfoModal';
import { StatsPage } from './StatsPage';
import { UpsellModal } from './UpsellModal';
import { useCatProfiles } from '../hooks/useCatProfiles';
import { ProfileSelector } from './ProfileSelector';
import { GameModeSelector } from './GameModeSelector';

import type { GameMode } from '../engine/types';

interface MainMenuProps {
    onStartGame: (mode: GameMode) => void;
    onSettings: () => void;
    autoPlayActive: boolean;
    onToggleAutoPlay: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStartGame, onSettings, autoPlayActive, onToggleAutoPlay }) => {
    // Hooks
    const { activeProfile, updateProfile } = useCatProfiles();
    const mainRef = useRef<HTMLDivElement>(null);
    const bgRef = useRef<HTMLDivElement>(null);

    // Local State
    const [showInfo, setShowInfo] = useState(false);
    const [showStats, setShowStats] = useState(false);
    const [showUpsell, setShowUpsell] = useState(false);
    const [showProfiles, setShowProfiles] = useState(false);
    const [isPremium, setIsPremium] = useState(false);
    const [cooldownRemaining, setCooldownRemaining] = useState(0);

    const stats = activeProfile.stats;

    // GSAP Ambient Animations
    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // Floating Blobs
            gsap.to('.floating-blob', {
                y: "random(-20, 20)",
                x: "random(-20, 20)",
                rotation: "random(-10, 10)",
                duration: "random(3, 5)",
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                stagger: {
                    amount: 2,
                    from: "random"
                }
            });

            // Gentle Background Pulse
            gsap.to(bgRef.current, {
                backgroundPosition: "200% center",
                duration: 20,
                repeat: -1,
                ease: "none"
            });
        }, mainRef);

        return () => ctx.revert();
    }, []);

    useEffect(() => {
        // Load Premium State
        const premium = localStorage.getItem('isPremium') === 'true';
        setIsPremium(premium);

        // COOLDOWN LOGIC
        // Free: 5 Minutes (300s) default
        // Pro: User Defined (0-30m)
        let duration = 300;

        if (premium) {
            const stored = localStorage.getItem('cat_engage_cooldown_duration');
            const mins = stored ? parseInt(stored) : 0;
            // If user set 0 mins, cooldown is 0.
            duration = mins * 60;
        }

        // Only enforce check if duration > 0 (and not 0)
        if (duration > 0) {
            const checkCooldown = () => {
                const lastEnd = localStorage.getItem('lastSessionEnd');
                if (lastEnd) {
                    const elapsed = (Date.now() - parseInt(lastEnd)) / 1000;
                    if (elapsed < duration) {
                        setCooldownRemaining(Math.ceil(duration - elapsed));
                    } else {
                        setCooldownRemaining(0);
                    }
                }
            };

            checkCooldown();
            const interval = setInterval(checkCooldown, 1000);
            return () => clearInterval(interval);
        } else {
            setCooldownRemaining(0);
        }
    }, []);

    const togglePremium = () => {
        const newState = !isPremium;
        setIsPremium(newState);
        localStorage.setItem('isPremium', String(newState));
        // Force reload to apply to Game Director logic
        window.location.reload();
    }

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        if (hours > 0) return `${hours}h ${mins}m`;
        // For cooldown, show MM:SS
        if (seconds < 3600) return `${mins}m ${secs}s`;
        return `${mins}m`;
    };

    return (
        <div ref={mainRef} className="relative h-full w-full overflow-hidden bg-[#0a0a12] text-white">

            {/* --- ANIMATED BACKGROUND --- */}
            <div
                ref={bgRef}
                className="absolute inset-0 z-0 opacity-30"
                style={{
                    backgroundImage: 'linear-gradient(45deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
                    backgroundSize: '200% 200%'
                }}
            />
            {/* Pattern Overlay */}
            <div className="absolute inset-0 z-0 opacity-[0.03]"
                style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}
            />

            {/* Floating Orbs */}
            <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] floating-blob" />
            <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-pink-600/10 rounded-full blur-[80px] floating-blob" />
            <div className="absolute top-[40%] left-[20%] w-40 h-40 bg-blue-500/10 rounded-full blur-[60px] floating-blob" />

            {/* --- MODALS --- */}
            <AnimatePresence>
                {showInfo && <InfoModal onClose={() => setShowInfo(false)} currentKills={stats?.preyCaught || 0} />}
                {showStats && <StatsPage onClose={() => setShowStats(false)} isPremium={isPremium} stats={stats} />}
                {showUpsell && <UpsellModal onClose={() => setShowUpsell(false)} onUnlock={togglePremium} />}
                {showProfiles && <ProfileSelector onClose={() => setShowProfiles(false)} />}
            </AnimatePresence>

            {/* --- MAIN CONTENT STRIP --- */}
            <div className="relative z-10 flex flex-col h-full items-center justify-between px-6 py-6 md:justify-center md:gap-8">

                {/* 1. HEADER */}
                <header className="w-full max-w-md flex justify-between items-center">
                    <button onClick={() => setShowInfo(true)} className="p-3 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 hover:scale-110 transition-all backdrop-blur-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </button>

                    <div onClick={import.meta.env.DEV ? togglePremium : undefined} className="text-center cursor-pointer">
                        <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-pink-200 drop-shadow-lg">
                            FELIS<span className="text-purple-500">.</span>
                        </h1>
                    </div>

                    <button onClick={onSettings} className="p-3 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 hover:scale-110 transition-all backdrop-blur-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </button>
                </header>

                {/* 2. HERO / CONTENT */}
                <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md gap-6">

                    {/* Active Profile Badge */}
                    <motion.button
                        onClick={() => setShowProfiles(true)}
                        className="group relative flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 rounded-full py-2 pl-2 pr-4 transition-all w-fit"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-lg ${activeProfile.avatarColor}`}>
                            🐱
                        </div>
                        <div className="text-left">
                            <div className="text-[10px] uppercase tracking-wider text-white/40 font-bold group-hover:text-purple-300 transition-colors">Playing as</div>
                            <div className="text-sm font-bold text-white leading-none">{activeProfile.name}</div>
                        </div>
                        <div className="absolute right-3 opacity-0 group-hover:opacity-100 transition-opacity text-purple-400">
                            ✏️
                        </div>
                    </motion.button>

                    {/* Game Mode Selector (Carousel) */}
                    <div className="w-full">
                        {cooldownRemaining > 0 && !isPremium ? (
                            <div
                                className="flex flex-col items-center space-y-2 animate-pulse cursor-pointer w-full max-w-sm"
                                onClick={() => setShowUpsell(true)}
                            >
                                <motion.button
                                    className="h-40 w-full text-xl bg-slate-800 cursor-not-allowed opacity-50 border border-white/5 pointer-events-none text-slate-400 rounded-3xl flex flex-col items-center justify-center gap-2"
                                    initial={{ scale: 1 }}
                                    animate={{ scale: [1, 1.02, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    <span className="text-4xl">💤</span>
                                    RESTING {formatTime(cooldownRemaining)}
                                </motion.button>
                            </div>
                        ) : (
                            <GameModeSelector
                                onStart={onStartGame}
                                activeProfile={activeProfile}
                                updateProfile={updateProfile}
                                isPremium={isPremium}
                                onShowUpsell={() => setShowUpsell(true)}
                                stats={stats}
                            />
                        )}
                    </div>
                </div>

                {/* 3. FOOTER */}
                <div className="w-full max-w-md flex flex-col gap-4">
                    {/* Stats Button */}
                    <motion.button
                        onClick={() => setShowStats(true)}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 border border-white/10 flex items-center justify-between px-6 group hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] transition-all"
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-white/5 text-purple-300 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                                    <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                                </svg>
                            </div>
                            <div className="text-left">
                                <div className="text-sm font-bold text-white">Career Stats</div>
                                <div className="text-[10px] text-white/40 uppercase tracking-widest">Tap to view</div>
                            </div>
                        </div>
                        <div className="text-white/20 group-hover:text-white transition-colors">→</div>
                    </motion.button>

                    {/* Auto Play Footer */}
                    {isPremium ? (
                        <div className="flex items-center justify-between bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-md">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${autoPlayActive ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-white/40'}`}>
                                    ⚡
                                </div>
                                <div className="text-left">
                                    <div className="text-xs font-bold text-white">Auto-Play Loop</div>
                                    <div className="text-[10px] text-white/40">{autoPlayActive ? 'Active' : 'Disabled'}</div>
                                </div>
                            </div>
                            <div
                                onClick={onToggleAutoPlay}
                                className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${autoPlayActive ? 'bg-green-500' : 'bg-white/10'}`}
                            >
                                <motion.div
                                    className="w-4 h-4 rounded-full bg-white shadow-sm"
                                    animate={{ x: autoPlayActive ? 24 : 0 }}
                                />
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowUpsell(true)}
                            className="w-full py-3 text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 rounded-xl hover:bg-amber-500/20 transition-colors"
                        >
                            <span>🔒</span> Unlock Auto-Play
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
