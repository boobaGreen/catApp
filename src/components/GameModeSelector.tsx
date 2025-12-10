import React from 'react';
import { motion } from 'framer-motion';
import type { GameMode, CatProfile, GameStats } from '../engine/types';

interface GameModeSelectorProps {
    onStart: (mode: GameMode) => void;
    activeProfile: CatProfile;
    updateProfile: (id: string, updates: Partial<CatProfile>) => void;
    isPremium: boolean;
    onShowUpsell: () => void;
    stats: GameStats;
}

export const GameModeSelector: React.FC<GameModeSelectorProps> = ({
    onStart,
    activeProfile,
    updateProfile,
    isPremium,
    onShowUpsell,
    stats
}) => {

    const isFavorite = (mode: GameMode) => activeProfile.favorites.includes(mode);

    const toggleFavorite = (mode: GameMode, e: React.MouseEvent) => {
        e.stopPropagation();
        let newFavs = [...activeProfile.favorites];
        if (newFavs.includes(mode)) {
            newFavs = newFavs.filter(m => m !== mode);
        } else {
            newFavs.push(mode);
        }
        updateProfile(activeProfile.id, { favorites: newFavs });
    };

    const MODES: {
        id: GameMode;
        label: string;
        icon: string;
        desc: string;
        color: string;
        locked?: boolean;
        statLabel: string;
        statValue: string;
    }[] = [
            {
                id: 'mouse',
                label: 'Mouse',
                icon: '🐁',
                desc: 'Classic Hunting',
                color: 'from-blue-600 to-indigo-600',
                statLabel: 'CAUGHT',
                statValue: `${stats.preyCounts?.mouse || 0}`
            },
            {
                id: 'laser',
                label: 'Laser',
                icon: '🔴',
                desc: 'High Speed',
                color: 'from-red-500 to-pink-600',
                statLabel: 'REFLEX',
                statValue: `${stats.catReflexesScore}ms`
            },
            {
                id: 'butterfly',
                label: 'Butterfly',
                icon: '🦋',
                desc: 'Erratic Flight',
                color: 'from-fuchsia-500 to-pink-500',
                statLabel: 'CAUGHT',
                statValue: `${stats.preyCounts?.butterfly || 0}`
            },
            {
                id: 'feather',
                label: 'Feather',
                icon: '🪶',
                desc: 'Gentle Drift',
                color: 'from-slate-400 to-gray-500',
                statLabel: 'CAUGHT',
                statValue: `${stats.preyCounts?.feather || 0}`
            },
            {
                id: 'shuffle',
                label: 'Shuffle',
                icon: '🎲',
                desc: 'Auto-Loop',
                color: 'from-purple-600 to-amber-500',
                locked: !isPremium,
                statLabel: 'BEST',
                statValue: `${stats.highScore}`
            }
        ];

    return (
        <div className="w-full max-w-sm flex gap-3 overflow-x-auto pb-8 pt-4 px-4 snap-x custom-scrollbar">
            {MODES.map((mode) => (
                <motion.div
                    key={mode.id}
                    className="relative flex-none w-36 snap-center group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {/* Favorite Button (Hidden for Shuffle) */}
                    {mode.id !== 'shuffle' && (
                        <button
                            onClick={(e) => toggleFavorite(mode.id, e)}
                            className={`absolute top-2 right-2 z-20 p-2 rounded-full backdrop-blur-md transition-all duration-300 hover:scale-110 ${isFavorite(mode.id)
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_10px_rgba(251,191,36,0.5)]'
                                : 'bg-black/20 text-white/40 border border-white/10 hover:text-white hover:bg-black/40'
                                }`}
                        >
                            {isFavorite(mode.id) ? (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.563.045.797.77.361 1.144l-4.164 3.567a.563.563 0 00-.171.527l1.198 5.378c.13.585-.503.956-1.003.682L12 17.58a.563.563 0 00-.547 0l-4.706 2.614c-.5.274-1.133-.097-1.003-.682l1.198-5.378a.563.563 0 00-.171-.527L2.64 10.542c-.436-.374-.202-1.099.361-1.144l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                                </svg>
                            )}
                        </button>
                    )}

                    <div
                        onClick={() => {
                            if (mode.locked) onShowUpsell();
                            else onStart(mode.id);
                        }}
                        className={`
                            h-52 rounded-3xl p-4 flex flex-col items-center justify-between
                            bg-gradient-to-br ${mode.locked ? 'from-slate-800 to-slate-900 grayscale opacity-80' : mode.color}
                            border border-white/10 shadow-lg cursor-pointer
                            hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] transition-all relative overflow-hidden
                        `}
                    >
                        {/* Background Decor */}
                        <div className="absolute top-0 left-0 w-full h-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-1">
                            {mode.label}
                        </div>

                        <div className="flex-1 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-500">
                            <div className="text-6xl filter drop-shadow-2xl">
                                {mode.icon}
                            </div>
                        </div>

                        <div className="w-full space-y-3 relative z-10">
                            <div className="text-[10px] text-center font-medium text-white/80 leading-tight h-6">
                                {mode.desc}
                            </div>

                            {/* Stat Badge */}
                            {!mode.locked && (
                                <div className="bg-black/20 backdrop-blur-sm rounded-xl py-1 px-2 border border-white/10 flex items-center justify-between">
                                    <span className="text-[9px] font-bold text-white/50">{mode.statLabel}</span>
                                    <span className="text-sm font-black text-white">{mode.statValue}</span>
                                </div>
                            )}
                        </div>

                        {mode.locked && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-2xl backdrop-blur-[1px]">
                                <div className="bg-amber-400 text-black text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest shadow-lg transform rotate-12">
                                    PRO
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            ))}
        </div>
    );
};
