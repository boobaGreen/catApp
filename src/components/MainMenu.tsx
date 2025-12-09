import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './UI/Button';
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

    // Local State
    const [showInfo, setShowInfo] = useState(false);
    const [showStats, setShowStats] = useState(false);
    const [showUpsell, setShowUpsell] = useState(false);
    const [showProfiles, setShowProfiles] = useState(false);
    const [isPremium, setIsPremium] = useState(false);
    const [cooldownRemaining, setCooldownRemaining] = useState(0);

    const stats = activeProfile.stats;

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
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-full w-full relative z-10 overflow-hidden bg-[#0a0a12] text-white"
        >
            <AnimatePresence>
                {showInfo && <InfoModal onClose={() => setShowInfo(false)} currentKills={stats?.preyCaught || 0} />}
                {showStats && <StatsPage onClose={() => setShowStats(false)} isPremium={isPremium} stats={stats} />}
                {showUpsell && <UpsellModal onClose={() => setShowUpsell(false)} onUnlock={togglePremium} />}
                {showProfiles && <ProfileSelector onClose={() => setShowProfiles(false)} />}
            </AnimatePresence>

            {/* Ambient Background Elements (V2 Style) */}
            <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-purple-900/20 blur-[100px] rounded-full mix-blend-screen animate-pulse pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-900/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />

            {/* Whiskers Decoration */}
            <div className="absolute top-10 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent pointer-events-none"></div>
            <div className="absolute bottom-10 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent pointer-events-none"></div>

            {/* SCALING WRAPPER: Zooms interface on Tablet/Desktop to match "Phone feel" but bigger */}
            <div className="flex flex-col items-center transform transition-transform duration-300 md:scale-[1.7] lg:scale-[1.0] relative z-20">

                {/* Logo / Title */}
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center mb-6 relative z-10 cursor-pointer"
                    onClick={import.meta.env.DEV ? togglePremium : undefined}
                >
                    <h1 className="text-6xl font-black text-white tracking-tighter drop-shadow-2xl relative">
                        FELIS<span className="text-purple-400">.</span>
                        {/* Cute Ears on Title */}
                        <span className="absolute -top-4 -right-4 text-3xl opacity-50 rotate-12">🐱</span>
                    </h1>
                    <div className="text-xl font-bold tracking-[0.5em] text-purple-300 uppercase mb-2">
                        Apex Hunter
                    </div>
                </motion.div>

                {/* ACTIVE CAT BADGE */}
                <motion.button
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowProfiles(true)}
                    className="mb-8 flex items-center gap-3 bg-[#1a1a2e] border border-white/10 rounded-full py-2 px-6 hover:border-purple-500/50 transition-colors group"
                >
                    <div className={`w-8 h-8 rounded-full ${activeProfile.avatarColor} flex items-center justify-center text-lg shadow-inner`}>
                        🐱
                    </div>
                    <div className="text-left">
                        <div className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Playing as</div>
                        <div className="text-sm font-black text-white group-hover:text-purple-300 transition-colors uppercase tracking-wider">{activeProfile.name}</div>
                    </div>
                    <div className="text-slate-600 group-hover:text-white transition-colors ml-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </motion.button>

                {/* Stats Card (Integrated - Glass V2) */}
                {stats && (
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="mb-10 bg-[#1a1a2e]/60 border border-white/5 rounded-3xl p-6 w-72 backdrop-blur-xl flex flex-col items-center text-center shadow-2xl relative z-10 hover:border-purple-500/30 transition-colors"
                    >
                        {/* ADAPTIVE AI STATUS */}
                        <div className="absolute -top-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#0a0a12] border border-purple-500/30 text-purple-300 shadow-lg">
                            PREY MOOD: {stats.preyConfidence < 30 ? 'FEARFUL 😨' : stats.preyConfidence < 70 ? 'BALANCED 😐' : 'APEX 😈'}
                        </div>

                        <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-400 mb-2 mt-2">Total Catches</div>
                        <div className="text-6xl font-black text-white mb-2 tracking-tighter">
                            {stats.preyCaught}
                        </div>

                        <div className="w-full flex justify-between items-center text-xs font-bold text-slate-400 border-t border-white/5 pt-4 mt-2">
                            <span>{formatTime(stats.totalPlayTime)}</span>
                            <div className="flex gap-3 text-sm">
                                <span className="text-pink-300 flex items-center gap-1" title="Mice">{stats.preyCounts?.mouse || 0} 🐭</span>
                                <span className="text-amber-300 flex items-center gap-1" title="Worms">{stats.preyCounts?.worm || 0} 🪱</span>
                                <span className="text-green-300 flex items-center gap-1" title="Insects">{stats.preyCounts?.insect || 0} 🦟</span>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Main Actions */}
                <div className="flex flex-col space-y-4 w-full max-w-sm relative z-10 items-center">
                    {cooldownRemaining > 0 && !isPremium ? (
                        <div
                            className="flex flex-col items-center space-y-2 animate-pulse cursor-pointer mb-4"
                            onClick={() => setShowUpsell(true)}
                        >
                            <Button disabled className="h-16 text-xl bg-slate-800 cursor-not-allowed opacity-50 border border-white/5 pointer-events-none text-slate-400">
                                💤 RESTING {formatTime(cooldownRemaining)}
                            </Button>
                            <span className="text-[10px] text-purple-300 uppercase tracking-widest font-bold">
                                Ethological Cool-down Active
                            </span>
                        </div>
                    ) : (
                        <GameModeSelector
                            onStart={onStartGame}
                            activeProfile={activeProfile}
                            updateProfile={updateProfile}
                            isPremium={isPremium}
                            onShowUpsell={() => setShowUpsell(true)}
                        />
                    )}

                    {!isPremium && (
                        <motion.button
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={togglePremium}
                            className="bg-gradient-to-r from-amber-400 to-orange-500 text-black font-black py-4 rounded-full uppercase tracking-widest shadow-[0_0_20px_rgba(251,191,36,0.4)] flex items-center justify-center gap-2 border-2 border-white/20"
                        >
                            <span className="text-lg">💎</span>
                            UNLOCK FULL GAME
                        </motion.button>
                    )}

                    {isPremium && (
                        <div className="flex flex-col items-center mt-2">
                            <label className="flex items-center gap-3 cursor-pointer group p-2 rounded-xl hover:bg-white/5 transition-colors">
                                <div className="relative">
                                    <input type="checkbox" className="sr-only" checked={autoPlayActive} onChange={onToggleAutoPlay} />
                                    <div className={`w-10 h-6 bg-slate-700 rounded-full shadow-inner transition-colors ${autoPlayActive ? 'bg-green-500' : ''}`}></div>
                                    <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${autoPlayActive ? 'translate-x-4' : ''}`}></div>
                                </div>
                                <span className={`text-xs font-bold tracking-widest uppercase transition-colors ${autoPlayActive ? 'text-green-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                                    Auto-Play Loop
                                </span>
                            </label>
                            {autoPlayActive && (
                                <span className="text-[9px] text-green-500/70 uppercase tracking-widest mt-1 animate-pulse">
                                    Screen Always On
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="flex space-x-12 mt-10 relative z-10">
                    <MenuIconButton
                        onClick={() => setShowInfo(true)}
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                        label="GUIDE"
                    />

                    <MenuIconButton
                        onClick={() => setShowStats(true)}
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        }
                        label="STATS"
                    />

                    <MenuIconButton
                        onClick={onSettings}
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        }
                        label="SETTINGS"
                    />
                </div>
            </div>
        </motion.div>
    );
};

const MenuIconButton: React.FC<{ onClick: () => void; icon: React.ReactNode; label: string }> = ({ onClick, icon, label }) => (
    <button
        onClick={onClick}
        className="flex flex-col items-center group transform transition-transform"
    >
        <div className="p-4 rounded-2xl bg-[#1a1a2e] border border-white/10 text-slate-400 group-hover:bg-purple-500/20 group-hover:text-purple-300 group-hover:scale-110 group-hover:border-purple-500/50 transition-all duration-300 shadow-xl backdrop-blur-sm">
            {icon}
        </div>
        <span className="mt-3 text-[10px] md:text-xs font-bold tracking-widest text-slate-500 group-hover:text-white transition-colors">
            {label}
        </span>
    </button>
);
