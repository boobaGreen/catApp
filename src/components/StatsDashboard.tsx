import React from 'react';
import { motion } from 'framer-motion';
import { StatsManager } from '../engine/StatsManager';
import { Button } from './UI/Button';

interface StatsDashboardProps {
    onBack: () => void;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ onBack }) => {
    // We instantiate manager inside component for simple read. 
    // In a bigger app we'd use a context/hook.
    const manager = new StatsManager();
    const stats = manager.getStats();

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        if (hours > 0) return `${hours}h ${mins}m`;
        return `${mins}m ${Math.floor(seconds % 60)}s`;
    };

    return (
        <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="absolute inset-0 bg-black/90 backdrop-blur-xl z-20 flex flex-col items-center justify-center p-8 text-white font-sans"
        >
            <h2 className="text-4xl font-black mb-8 text-white uppercase tracking-tighter">Hunter Stats</h2>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-8">
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl text-center">
                    <div className="text-5xl font-black text-cat-blue mb-2">{stats.totalKills}</div>
                    <div className="text-xs uppercase tracking-widest opacity-50">Total Kills</div>
                </div>
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl text-center">
                    <div className="text-5xl font-black text-cat-yellow mb-2">{formatTime(stats.totalPlaytime)}</div>
                    <div className="text-xs uppercase tracking-widest opacity-50">Play Time</div>
                </div>
            </div>

            {/* Preferences */}
            <h3 className="text-sm font-bold opacity-50 uppercase tracking-widest mb-4">Prey Preference</h3>
            <div className="grid grid-cols-3 gap-2 w-full max-w-md mb-12">
                <div className="bg-white/5 p-4 rounded-xl text-center">
                    <div className="text-2xl font-bold text-cat-blue">{stats.preyPreference.mouse}</div>
                    <div className="text-[10px] uppercase opacity-40">Mice</div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl text-center">
                    <div className="text-2xl font-bold text-cat-green">{stats.preyPreference.insect}</div>
                    <div className="text-[10px] uppercase opacity-40">Insects</div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl text-center">
                    <div className="text-2xl font-bold text-cat-yellow">{stats.preyPreference.worm}</div>
                    <div className="text-[10px] uppercase opacity-40">Worms</div>
                </div>
            </div>

            <Button onClick={onBack} variant="secondary">Back to Menu</Button>
        </motion.div>
    );
};
