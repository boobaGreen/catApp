import React from 'react';
import { motion } from 'framer-motion';
import type { GameMode, CatProfile } from '../engine/types';

interface GameModeSelectorProps {
    onStart: (mode: GameMode) => void;
    activeProfile: CatProfile;
    updateProfile: (id: string, updates: Partial<CatProfile>) => void;
    isPremium: boolean;
    onShowUpsell: () => void;
}

export const GameModeSelector: React.FC<GameModeSelectorProps> = ({
    onStart,
    activeProfile,
    updateProfile,
    isPremium,
    onShowUpsell
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

    const MODES: { id: GameMode; label: string; icon: string; desc: string; color: string; locked?: boolean }[] = [
        {
            id: 'classic',
            label: 'Classic',
            icon: '🐁',
            desc: 'Mice & Bugs',
            color: 'from-blue-600 to-indigo-600'
        },
        {
            id: 'laser',
            label: 'Laser',
            icon: '🔴',
            desc: 'High Speed Chase',
            color: 'from-red-500 to-pink-600'
        },
        {
            id: 'shuffle',
            label: 'Shuffle',
            icon: '🎲',
            desc: 'Auto-Switching Loop',
            color: 'from-purple-600 to-amber-500',
            locked: !isPremium
        }
    ];

    return (
        <div className="w-full max-w-sm flex gap-3 overflow-x-auto pb-4 px-2 snap-x custom-scrollbar">
            {MODES.map((mode) => (
                <motion.div
                    key={mode.id}
                    className="relative flex-none w-32 snap-center group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {/* Favorite Button */}
                    <button
                        onClick={(e) => toggleFavorite(mode.id, e)}
                        className={`absolute top-2 right-2 z-20 text-lg transition-transform hover:scale-125 ${isFavorite(mode.id) ? 'text-red-500' : 'text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100'}`}
                    >
                        {isFavorite(mode.id) ? '❤️' : '🤍'}
                    </button>

                    <div
                        onClick={() => {
                            if (mode.locked) onShowUpsell();
                            else onStart(mode.id);
                        }}
                        className={`
                            h-40 rounded-2xl p-4 flex flex-col items-center justify-between
                            bg-gradient-to-br ${mode.locked ? 'from-slate-800 to-slate-900 grayscale opacity-80' : mode.color}
                            border border-white/10 shadow-lg cursor-pointer
                            hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all
                        `}
                    >
                        <div className="text-xs font-bold uppercase tracking-widest text-white/70">
                            {mode.label}
                        </div>

                        <div className="text-5xl filter drop-shadow-md">
                            {mode.icon}
                        </div>

                        <div className="text-[10px] text-center font-medium text-white/80 leading-tight">
                            {mode.desc}
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
