import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './UI/Button';
import { StatsManager } from '../engine/StatsManager';
import { InfoModal } from './InfoModal';
import { StatsPage } from './StatsPage';
import { UpsellModal } from './UpsellModal';

interface MainMenuProps {
    onStartGame: (mode: 'classic' | 'laser') => void;
    onSettings: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStartGame, onSettings }) => {
    const [stats, setStats] = useState<any>(null);
    const [showInfo, setShowInfo] = useState(false);
    const [showStats, setShowStats] = useState(false);
    const [showUpsell, setShowUpsell] = useState(false);
    const [isPremium, setIsPremium] = useState(false);
    const [cooldownRemaining, setCooldownRemaining] = useState(0);

    // const COOLDOWN_DURATION = 300; // Legacy constant, now dynamic

    useEffect(() => {
        const manager = new StatsManager();
        setStats(manager.getStats());

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
            className="flex flex-col items-center justify-center h-full w-full relative z-10 overflow-hidden"
        >
            <AnimatePresence>
                {showInfo && <InfoModal onClose={() => setShowInfo(false)} currentKills={stats?.totalKills || 0} />}
                {showStats && <StatsPage onClose={() => setShowStats(false)} isPremium={isPremium} stats={stats} />}
                {showUpsell && <UpsellModal onClose={() => setShowUpsell(false)} onUnlock={togglePremium} />}
            </AnimatePresence>

            {/* Ambient Background Elements */}
            <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-cat-blue/20 blur-[100px] rounded-full mix-blend-screen animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cat-purple/20 blur-[120px] rounded-full mix-blend-screen" />

            {/* SCALING WRAPPER: Zooms interface on Tablet/Desktop to match "Phone feel" but bigger */}
            <div className="flex flex-col items-center transform transition-transform duration-300 md:scale-[1.7] lg:scale-[1.0]">

                {/* Logo / Title */}
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center mb-10 relative z-10 cursor-pointer"
                    onClick={import.meta.env.DEV ? togglePremium : undefined}
                    title={import.meta.env.DEV ? "Secret: Tap to toggle Premium" : "FELIS: Apex Hunter"}
                >
                    <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-200 to-gray-400 tracking-tighter drop-shadow-2xl">
                        FELIS
                    </h1>
                    <div className="text-xl font-bold tracking-[0.5em] text-cat-lime uppercase mb-2">
                        Apex Hunter
                    </div>
                    <div className={`mt-2 text-xs font-bold tracking-[0.5em] uppercase ${isPremium ? 'text-yellow-400' : 'text-gray-500'}`}>
                        {isPremium ? '✨ Premium Unlocked' : 'Demo Mode'}
                    </div>
                </motion.div>

                {/* Stats Card (Integrated) */}
                {stats && (
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="mb-10 bg-white/5 border border-white/10 rounded-3xl p-6 w-72 backdrop-blur-md flex flex-col items-center text-center shadow-2xl relative z-10"
                    >
                        {/* ADAPTIVE AI STATUS */}
                        <div className="absolute -top-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-black/50 border border-white/20 text-cat-blue shadow-lg backdrop-blur-md">
                            PREY MOOD: {stats.preyConfidence < 30 ? 'FEARFUL 😨' : stats.preyConfidence < 70 ? 'BALANCED 😐' : 'APEX 😈'}
                        </div>

                        <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 mb-2 mt-2">Total Catches</div>
                        <div className="text-6xl font-black text-white mb-2 tracking-tighter">
                            {stats.totalKills}
                        </div>

                        <div className="w-full flex justify-between items-center text-xs font-bold text-gray-400 border-t border-white/10 pt-4 mt-2">
                            <span>{formatTime(stats.totalPlaytime)}</span>
                            <div className="flex gap-3 text-sm">
                                <span className="text-cat-blue flex items-center gap-1" title="Mice">{stats.preyPreference.mouse} 🐭</span>
                                <span className="text-yellow-400 flex items-center gap-1" title="Worms">{stats.preyPreference.worm} 🪱</span>
                                <span className="text-cat-green flex items-center gap-1" title="Insects">{stats.preyPreference.insect} 🦟</span>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Main Actions */}
                <div className="flex flex-col space-y-4 w-72 relative z-10">
                    {cooldownRemaining > 0 && !isPremium ? (
                        <div
                            className="flex flex-col items-center space-y-2 animate-pulse cursor-pointer"
                            onClick={() => setShowUpsell(true)}
                        >
                            <Button disabled className="h-16 text-xl bg-gray-600 cursor-not-allowed opacity-50 border border-white/10 pointer-events-none">
                                💤 RESTING {formatTime(cooldownRemaining)}
                            </Button>
                            <span className="text-[10px] text-cat-blue uppercase tracking-widest font-bold">
                                Ethological Cool-down Active
                            </span>
                        </div>
                    ) : (
                        <Button onClick={() => onStartGame('classic')} className="h-16 text-xl shadow-cat-blue/50 shadow-lg">
                            START HUNTING
                        </Button>
                    )}

                    {!isPremium && (
                        <motion.button
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={togglePremium}
                            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-black py-4 rounded-xl uppercase tracking-widest shadow-lg flex items-center justify-center gap-2"
                        >
                            <span className="text-lg">💎</span>
                            UNLOCK FULL GAME
                        </motion.button>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="flex space-x-12 mt-10 relative z-10">
                    {/* Info Guide */}
                    <MenuIconButton
                        onClick={() => setShowInfo(true)}
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                        label="GUIDE"
                    />

                    {/* Stats Page Button */}
                    <MenuIconButton
                        onClick={() => setShowStats(true)}
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        }
                        label="STATS"
                    />

                    {/* Settings */}
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
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-gray-300 group-hover:bg-white/20 group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-xl backdrop-blur-sm">
            {icon}
        </div>
        <span className="mt-3 text-[10px] md:text-xs font-bold tracking-widest text-gray-500 group-hover:text-white transition-colors">
            {label}
        </span>
    </button>
);
