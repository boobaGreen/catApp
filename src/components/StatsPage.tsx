import React from 'react';
import { motion } from 'framer-motion';
import type { GameStats } from '../engine/types';

interface StatsPageProps {
    onClose: () => void;
    isPremium: boolean;
    stats: GameStats | null;
}

export const StatsPage: React.FC<StatsPageProps> = ({ onClose, isPremium, stats }) => {
    // Rank Logic (V2 Styled)
    const getRank = (kills: number) => {
        if (kills < 50) return { title: "House Cat", icon: "🐈", color: "text-slate-400" };
        if (kills < 200) return { title: "Barn Hunter", icon: "🐁", color: "text-amber-400" };
        if (kills < 500) return { title: "Street Tiger", icon: "🐅", color: "text-orange-500" };
        return { title: "APEX PREDATOR", icon: "🦁", color: "text-purple-400" }; // Apex is now Purple
    };

    const rank = stats ? getRank(stats.preyCaught) : getRank(0);

    // Time Formatting
    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        if (h > 0) return `${h}h ${m}m`;
        return `${m}m`;
    };

    // Prey Calculations
    const totalPrey = stats?.preyCounts ? (stats.preyCounts.mouse + stats.preyCounts.insect + stats.preyCounts.worm) : 0;
    const getPercent = (count: number) => totalPrey > 0 ? Math.round((count / totalPrey) * 100) : 0;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#0a0a12]/95 backdrop-blur-xl z-50 flex flex-col items-center justify-center p-6 font-sans text-slate-200"
        >
            <div className="w-full max-w-sm md:max-w-2xl bg-[#1a1a2e]/80 border border-white/10 rounded-3xl p-6 relative overflow-hidden flex flex-col h-auto max-h-[90vh] transform transition-transform duration-300 md:scale-[1.7] lg:scale-[1.0] shadow-2xl">

                {/* Header */}
                <div className="flex justify-between items-center mb-6 shrink-0">
                    <h2 className="text-white font-black text-2xl md:text-3xl tracking-tighter uppercase flex items-center gap-2 drop-shadow-md">
                        <span>📊</span>
                        Performance
                    </h2>
                    <button onClick={onClose} className="text-purple-400 hover:text-white uppercase text-xs md:text-sm font-bold tracking-widest transition-colors">
                        CLOSE
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 relative w-full flex flex-col gap-4 overflow-y-auto custom-scrollbar">

                    {/* 1. HERO RANK CARD */}
                    <div className={`w-full bg-gradient-to-br from-[#2a2a40] to-transparent border border-white/5 rounded-2xl p-6 flex items-center justify-between ${!isPremium ? 'opacity-50 blur-[2px] grayscale' : ''}`}>
                        <div>
                            <div className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">Current Rank</div>
                            <div className={`text-2xl md:text-3xl font-black uppercase tracking-tighter ${rank.color} drop-shadow-lg`}>
                                {rank.title}
                            </div>
                            <div className="text-xs text-slate-400 mt-1 font-mono">
                                {stats?.preyCaught || 0} Total Catches
                            </div>
                        </div>
                        <div className="text-5xl md:text-6xl filter drop-shadow-2xl grayscale transition-all hover:grayscale-0">
                            {rank.icon}
                        </div>
                    </div>

                    {/* 2. CORE METRICS GRID */}
                    <div className={`grid grid-cols-2 gap-3 ${!isPremium ? 'opacity-40 blur-[2px]' : ''}`}>
                        <div className="bg-[#1a1a2e] rounded-xl p-4 border border-white/5 hover:border-purple-500/20 transition-colors">
                            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Play Time</div>
                            <div className="text-xl md:text-2xl font-black text-white">
                                {stats ? formatTime(stats.totalPlayTime) : '0m'}
                            </div>
                        </div>
                        <div className="bg-[#1a1a2e] rounded-xl p-4 border border-white/5 hover:border-purple-500/20 transition-colors">
                            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Sessions</div>
                            <div className="text-xl md:text-2xl font-black text-white">
                                {stats?.sessionsCompleted || 0}
                            </div>
                        </div>
                    </div>

                    {/* 3. PREY PREFERENCE CHART */}
                    <div className={`bg-[#1a1a2e] rounded-xl p-5 border border-white/5 ${!isPremium ? 'opacity-30 blur-[2px]' : ''}`}>
                        <div className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-4 flex justify-between">
                            <span>Favorite Prey</span>
                            <span className="text-purple-400">Distribution</span>
                        </div>

                        <div className="space-y-4">
                            {/* Mouse */}
                            <div className="relative group">
                                <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                                    <span className="flex items-center gap-2 group-hover:text-purple-300 transition-colors">🐭 Mice</span>
                                    <span>{stats?.preyCounts ? getPercent(stats.preyCounts.mouse) : 0}%</span>
                                </div>
                                <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-purple-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                                        style={{ width: `${stats?.preyCounts ? getPercent(stats.preyCounts.mouse) : 0}%` }}
                                    />
                                </div>
                            </div>

                            {/* Insect */}
                            <div className="relative group">
                                <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                                    <span className="flex items-center gap-2 group-hover:text-green-300 transition-colors">🦟 Insects</span>
                                    <span>{stats?.preyCounts ? getPercent(stats.preyCounts.insect) : 0}%</span>
                                </div>
                                <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-green-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                                        style={{ width: `${stats?.preyCounts ? getPercent(stats.preyCounts.insect) : 0}%` }}
                                    />
                                </div>
                            </div>

                            {/* Worm */}
                            <div className="relative group">
                                <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                                    <span className="flex items-center gap-2 group-hover:text-amber-300 transition-colors">🪱 Worms</span>
                                    <span>{stats?.preyCounts ? getPercent(stats.preyCounts.worm) : 0}%</span>
                                </div>
                                <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-amber-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                                        style={{ width: `${stats?.preyCounts ? getPercent(stats.preyCounts.worm) : 0}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* PREMIUM LOCK OVERLAY */}
                    {!isPremium && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-20 backdrop-blur-md bg-[#0a0a12]/60 rounded-xl border border-white/10">
                            <div className="mb-4 text-5xl animate-bounce filter drop-shadow-xl ">🔒</div>
                            <h3 className="text-2xl font-black text-white mb-2 tracking-tighter">PREMIUM DATA</h3>
                            <p className="text-slate-300 text-sm mb-8 max-w-[240px] leading-relaxed">
                                See exactly what your cat prefers and track their journey to becoming an <span className="text-purple-400 font-bold">Apex Predator</span>.
                            </p>
                            <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black py-4 px-10 rounded-full text-sm tracking-widest shadow-[0_10px_30px_-10px_rgba(168,85,247,0.5)] hover:scale-105 transition-transform">
                                UNLOCK STATS
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};
