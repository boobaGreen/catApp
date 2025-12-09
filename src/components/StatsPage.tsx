import React from 'react';
import { motion } from 'framer-motion';
import { useCatProfiles } from '../hooks/useCatProfiles';

import type { GameStats } from '../engine/types';

interface StatsPageProps {
    onClose: () => void;
    isPremium: boolean;
    stats: GameStats | null;
}

export const StatsPage: React.FC<StatsPageProps> = ({ onClose, isPremium }) => {
    const { activeProfile } = useCatProfiles();
    const { stats } = activeProfile;

    // Helper: Stat Card Component
    const StatCard = ({ label, value, icon, color, delay }: { label: string, value: string | number, icon: string, color: string, delay: number }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4 }}
            className="bg-white/5 border border-white/10 p-5 rounded-3xl flex items-center justify-between group hover:border-purple-500/30 transition-colors"
        >
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl ${color} bg-opacity-20 flex items-center justify-center text-2xl`}>
                    {icon}
                </div>
                <div>
                    <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold">{label}</div>
                    <div className="text-xl md:text-2xl font-black text-white">{value}</div>
                </div>
            </div>
        </motion.div>
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0a0a12] flex flex-col"
        >
            {/* 1. Header */}
            <header className="flex items-center justify-between p-6 md:p-8 bg-black/20 backdrop-blur-md sticky top-0 z-10">
                <div>
                    <h2 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-white">
                        DATA LOG
                    </h2>
                    <p className="text-xs font-mono text-purple-400/60 uppercase tracking-widest mt-1">
                        Subject: {activeProfile.name}
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 transition-all text-white/60 hover:text-white"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </header>

            {/* 2. Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 pb-20">

                {/* Hero Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <StatCard label="Total Hunted" value={stats?.preyCaught || 0} icon="🎯" color="bg-purple-500" delay={0.1} />
                    <StatCard label="High Score" value={stats?.highScore || 0} icon="🏆" color="bg-amber-500" delay={0.2} />
                </div>

                {/* Prey Breakdown */}
                <div>
                    <h3 className="text-xs font-bold text-white/30 uppercase tracking-[0.2em] mb-4 pl-1">Prey Analysis</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <StatCard label="Mice Caught" value={stats?.preyCounts?.mouse || 0} icon="🐁" color="bg-indigo-500" delay={0.3} />
                        <StatCard label="Insects Zapped" value={stats?.preyCounts?.insect || 0} icon="🪳" color="bg-emerald-500" delay={0.4} />
                        <StatCard label="Worms Snagged" value={stats?.preyCounts?.worm || 0} icon="🪱" color="bg-rose-500" delay={0.5} />
                        <StatCard label="Butterflies" value={stats?.preyCounts?.butterfly || 0} icon="🦋" color="bg-cyan-500" delay={0.6} />
                        <StatCard label="Feathers" value={stats?.preyCounts?.feather || 0} icon="🪶" color="bg-teal-500" delay={0.7} />
                    </div>
                </div>

                {/* Laser Accuracy (Mock for now or calc) */}
                <div className="bg-gradient-to-br from-red-900/20 to-black border border-red-500/20 p-6 rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-2xl -mr-10 -mt-10" />
                    <div className="relative z-10 flex justify-between items-end">
                        <div>
                            <div className="text-red-400 text-[10px] font-bold uppercase tracking-widest mb-1">Laser Accuracy</div>
                            <div className="text-3xl font-black text-white">{((stats?.preyCounts?.laser || 0) * 1.5).toFixed(0)} <span className="text-sm text-white/40">Points</span></div>
                        </div>
                        <div className="text-4xl">🔴</div>
                    </div>
                </div>

                {/* PREMIUM LOCK OVERLAY */}
                {!isPremium && (
                    <div className="mt-8 p-6 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center text-center">
                        <div className="text-4xl mb-2 animate-bounce">🔒</div>
                        <h3 className="text-lg font-bold text-white mb-1">Unlock Advanced Analytics</h3>
                        <p className="text-xs text-slate-400 mb-4 max-w-xs">
                            Get detailed breakdowns, historical trends, and multi-profile comparison data with our Pro plan.
                        </p>
                        <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full text-xs font-bold uppercase tracking-widest hover:scale-105 transition-transform">
                            Upgrade Now
                        </button>
                    </div>
                )}

            </div>
        </motion.div>
    );
};
