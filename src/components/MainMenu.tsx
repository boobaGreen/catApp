import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './UI/Button';
import { StatsManager } from '../engine/StatsManager';
import { InfoModal } from './InfoModal';

interface MainMenuProps {
    onStartGame: (mode: 'classic' | 'laser') => void;
    onSettings: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStartGame, onSettings }) => {
    const [stats, setStats] = useState<any>(null);
    const [showInfo, setShowInfo] = useState(false);
    const [isPremium, setIsPremium] = useState(false);

    useEffect(() => {
        const manager = new StatsManager();
        setStats(manager.getStats());
        // Load Premium State
        setIsPremium(localStorage.getItem('isPremium') === 'true');
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
        if (hours > 0) return `${hours}h ${mins}m`;
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
                {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}
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
                    onClick={togglePremium}
                    title="Secret: Tap to toggle Premium"
                >
                    <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-200 to-gray-400 tracking-tighter drop-shadow-2xl">
                        CAT<br />ENGAGE
                    </h1>
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
                        <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 mb-2">Total Catches</div>
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
                    <Button onClick={() => onStartGame('classic')} className="h-16 text-xl shadow-cat-blue/50 shadow-lg">
                        START HUNTING
                    </Button>
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
