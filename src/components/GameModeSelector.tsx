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
                id: 'classic',
                label: 'Classic',
                icon: '🐁',
                desc: 'Mice & Bugs',
                color: 'from-blue-600 to-indigo-600',
                statLabel: 'CAUGHT',
                statValue: `${(stats.preyCounts?.mouse || 0) + (stats.preyCounts?.insect || 0) + (stats.preyCounts?.worm || 0)}`
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
                    {/* Favorite Button */}
                    <button
                        onClick={(e) => toggleFavorite(mode.id, e)}
                        className={`absolute top-3 right-3 z-20 text-lg transition-transform hover:scale-125 ${isFavorite(mode.id) ? 'text-white drop-shadow-md' : 'text-white/30 hover:text-white'}`}
                    >
                        {isFavorite(mode.id) ? '❤️' : '🤍'}
                    </button>

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
