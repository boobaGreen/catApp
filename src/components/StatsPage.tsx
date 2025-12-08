import React from 'react';
import { motion } from 'framer-motion';

// Define the shape of Stats based on StatsManager
interface GameStats {
    totalKills: number;
    totalPlaytime: number; // seconds
    sessions: number;
    lastPlayed: string;
    preyPreference: {
        mouse: number;
        insect: number;
        worm: number;
    };
    highScore: number;
}

interface StatsPageProps {
    onClose: () => void;
    isPremium: boolean;
    stats: GameStats | null;
}

export const StatsPage: React.FC<StatsPageProps> = ({ onClose, isPremium, stats }) => {
    // Rank Logic
    const getRank = (kills: number) => {
        if (kills < 50) return { title: "House Cat", icon: "🐈", color: "text-gray-400" };
        if (kills < 200) return { title: "Barn Hunter", icon: "🐁", color: "text-yellow-500" };
        if (kills < 500) return { title: "Street Tiger", icon: "🐅", color: "text-orange-500" };
        return { title: "APEX PREDATOR", icon: "🦁", color: "text-cat-lime" };
    };

    const rank = stats ? getRank(stats.totalKills) : getRank(0);

    // Time Formatting
    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        if (h > 0) return `${h}h ${m}m`;
        return `${m}m`;
    };

    // Prey Calculations
    const totalPrey = stats ? (stats.preyPreference.mouse + stats.preyPreference.insect + stats.preyPreference.worm) : 0;
    const getPercent = (count: number) => totalPrey > 0 ? Math.round((count / totalPrey) * 100) : 0;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/95 backdrop-blur-xl z-50 flex flex-col items-center justify-center p-6"
        >
            <div className="w-full max-w-sm md:max-w-2xl bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden flex flex-col h-auto max-h-[90vh] transform transition-transform duration-300 md:scale-[1.7] lg:scale-[1.0]">

                {/* Header */}
                <div className="flex justify-between items-center mb-6 shrink-0">
                    <h2 className="text-white font-black text-2xl md:text-3xl tracking-tighter uppercase flex items-center gap-2">
                        <span>📊</span>
                        Performance
                    </h2>
                    <button onClick={onClose} className="text-cat-lime hover:text-white uppercase text-xs md:text-sm font-bold tracking-widest">
                        CLOSE
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 relative w-full flex flex-col gap-4 overflow-y-auto">

                    {/* 1. HERO RANK CARD */}
                    <div className={`w-full bg-gradient-to-br from-white/10 to-transparent border border-white/10 rounded-2xl p-6 flex items-center justify-between ${!isPremium ? 'opacity-50 blur-[2px]' : ''}`}>
                        <div>
                            <div className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Current Rank</div>
                            <div className={`text-2xl md:text-3xl font-black uppercase tracking-tighter ${rank.color}`}>
                                {rank.title}
                            </div>
                            <div className="text-xs text-gray-500 mt-1 font-mono">
                                {stats?.totalKills || 0} Total Catches
                            </div>
                        </div>
                        <div className="text-5xl md:text-6xl filter drop-shadow-2xl">
                            {rank.icon}
                        </div>
                    </div>

                    {/* 2. CORE METRICS GRID */}
                    <div className={`grid grid-cols-2 gap-3 ${!isPremium ? 'opacity-40 blur-[2px]' : ''}`}>
                        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                            <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Play Time</div>
                            <div className="text-xl md:text-2xl font-black text-white">
                                {stats ? formatTime(stats.totalPlaytime) : '0m'}
                            </div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                            <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Sessions</div>
                            <div className="text-xl md:text-2xl font-black text-white">
                                {stats?.sessions || 0}
                            </div>
                        </div>
                    </div>

                    {/* 3. PREY PREFERENCE CHART */}
                    <div className={`bg-white/5 rounded-xl p-5 border border-white/5 ${!isPremium ? 'opacity-30 blur-[2px]' : ''}`}>
                        <div className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-4 flex justify-between">
                            <span>Favorite Prey</span>
                            <span className="text-cat-blue">Distribution</span>
                        </div>

                        <div className="space-y-4">
                            {/* Mouse */}
                            <div className="relative">
                                <div className="flex justify-between text-xs font-bold text-gray-300 mb-1">
                                    <span className="flex items-center gap-2">🐭 Mice</span>
                                    <span>{stats ? getPercent(stats.preyPreference.mouse) : 0}%</span>
                                </div>
                                <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-cat-blue rounded-full transition-all duration-1000"
                                        style={{ width: `${stats ? getPercent(stats.preyPreference.mouse) : 0}%` }}
                                    />
                                </div>
                            </div>

                            {/* Insect */}
                            <div className="relative">
                                <div className="flex justify-between text-xs font-bold text-gray-300 mb-1">
                                    <span className="flex items-center gap-2">🦟 Insects</span>
                                    <span>{stats ? getPercent(stats.preyPreference.insect) : 0}%</span>
                                </div>
                                <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-cat-green rounded-full transition-all duration-1000"
                                        style={{ width: `${stats ? getPercent(stats.preyPreference.insect) : 0}%` }}
                                    />
                                </div>
                            </div>

                            {/* Worm */}
                            <div className="relative">
                                <div className="flex justify-between text-xs font-bold text-gray-300 mb-1">
                                    <span className="flex items-center gap-2">🪱 Worms</span>
                                    <span>{stats ? getPercent(stats.preyPreference.worm) : 0}%</span>
                                </div>
                                <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-yellow-500 rounded-full transition-all duration-1000"
                                        style={{ width: `${stats ? getPercent(stats.preyPreference.worm) : 0}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* PREMIUM LOCK OVERLAY */}
                    {!isPremium && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-20 backdrop-blur-sm bg-black/40 rounded-xl">
                            <div className="mb-4 text-5xl animate-bounce filter drop-shadow-xl ">🔒</div>
                            <h3 className="text-2xl font-black text-white mb-2 tracking-tighter">PREMIUM DATA</h3>
                            <p className="text-gray-300 text-sm mb-8 max-w-[240px] leading-relaxed">
                                See exactly what your cat prefers and track their journey to becoming an <span className="text-cat-lime font-bold">Apex Predator</span>.
                            </p>
                            <button className="bg-gradient-to-r from-cat-lime to-green-400 text-black font-black py-4 px-10 rounded-full text-sm tracking-widest shadow-2xl hover:scale-105 transition-transform">
                                UNLOCK STATS
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};
