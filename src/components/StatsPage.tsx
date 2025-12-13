import React from 'react';
import { motion, animate } from 'framer-motion';
import { useRef, useEffect } from 'react';
import { useCatProfiles } from '../hooks/useCatProfiles';

import type { GameStats } from '../engine/types';
import { Target, Mouse, Bug, Sprout, Flower2, Feather, Plane, Activity, Wind, Droplets, Fish, Sparkles, Crosshair, X, Lock } from 'lucide-react';
import { UpsellModal } from './UpsellModal';

interface StatsPageProps {
    onClose: () => void;
    isPremium: boolean;
    stats: GameStats | null;
}

export const StatsPage: React.FC<StatsPageProps> = ({ onClose, isPremium }) => {
    const { activeProfile, upgradeToPremium } = useCatProfiles();
    const { stats } = activeProfile;
    const [showUpsell, setShowUpsell] = React.useState(false);

    // Helper: CountUp Component
    const Counter = ({ from, to }: { from: number, to: number }) => {
        const nodeRef = useRef<HTMLSpanElement>(null);
        useEffect(() => {
            const node = nodeRef.current;
            if (!node) return;
            const controls = animate(from, to, {
                duration: 2,
                ease: [0.34, 1.56, 0.64, 1], // Spring-ish ease
                onUpdate(value) {
                    node.textContent = Math.round(value).toString();
                }
            });
            return () => controls.stop();
        }, [from, to]);
        return <span ref={nodeRef} />;
    };

    // Helper: Stat Card Component
    const StatCard = ({ label, value, Icon, color, delay, colSpan = "col-span-1" }: { label: string, value: number, Icon: React.ElementType, color: string, delay: number, colSpan?: string }) => (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay, duration: 0.5, type: 'spring' }}
            className={`
                ${colSpan} relative overflow-hidden rounded-[2rem] p-5 group transition-all duration-500
                bg-[#12121a] border border-white/5 hover:border-white/20
            `}
        >
            {/* Hover Glow */}
            <div className={`absolute -right-4 -top-4 w-24 h-24 ${color} blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity`} />

            <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex justify-between items-start mb-2">
                    <div className={`p-3 rounded-2xl ${color} bg-opacity-10 text-white group-hover:scale-110 transition-transform duration-300`}>
                        <Icon size={20} className="drop-shadow-md" />
                    </div>
                </div>

                <div>
                    <div className="text-3xl md:text-4xl font-black text-white tracking-tighter mb-1">
                        <Counter from={0} to={value} />
                    </div>
                    <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500 group-hover:text-white/80 transition-colors">
                        {label}
                    </div>
                </div>
            </div>
        </motion.div>
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#050508]/95 backdrop-blur-3xl flex flex-col"
        >
            {/* Background Atmosphere */}
            <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full" />
            </div>

            {/* 1. Header */}
            <div className="flex items-center justify-between p-8 relative z-10">
                <div>
                    <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white uppercase">
                        Mission <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Log</span>
                    </h2>
                    <div className="flex items-center gap-2 mt-2">
                        <div className={`w-2 h-2 rounded-full ${activeProfile.avatarColor} animate-pulse`} />
                        <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">
                            Subject: <span className="text-white font-bold">{activeProfile.name}</span>
                        </p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 transition-all text-slate-400 hover:text-white group"
                >
                    <X size={24} className="group-hover:rotate-90 transition-transform" />
                </button>
            </div>

            {/* 2. Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 pt-0 relative z-10 pb-24">
                <div className="max-w-5xl mx-auto space-y-8 relative">

                    {/* Hero Grid */}
                    <div className="grid grid-cols-1 gap-4">
                        <StatCard label="Total Prey Caught" value={stats?.preyCaught || 0} Icon={Crosshair} color="bg-red-500" delay={0.1} colSpan="col-span-1" />
                    </div>

                    {/* Prey Breakdown Grid */}
                    <div className={!isPremium ? 'blur-sm pointer-events-none select-none opacity-50 transition-all duration-500' : ''}>
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em] mb-6 pl-2 flex items-center gap-2">
                            <span className="w-8 h-[1px] bg-slate-700"></span>
                            Prey Database
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <StatCard label="Mice" value={stats?.preyCounts?.mouse || 0} Icon={Mouse} color="bg-indigo-500" delay={0.4} />
                            <StatCard label="Insects" value={stats?.preyCounts?.insect || 0} Icon={Wind} color="bg-emerald-500" delay={0.45} />
                            <StatCard label="Worms" value={stats?.preyCounts?.worm || 0} Icon={Sprout} color="bg-rose-500" delay={0.5} />
                            <StatCard label="Butterflies" value={stats?.preyCounts?.butterfly || 0} Icon={Flower2} color="bg-cyan-500" delay={0.55} />
                            <StatCard label="Feathers" value={stats?.preyCounts?.feather || 0} Icon={Feather} color="bg-teal-500" delay={0.6} />
                            <StatCard label="Beetles" value={stats?.preyCounts?.beetle || 0} Icon={Bug} color="bg-lime-500" delay={0.65} />
                            <StatCard label="Fireflies" value={stats?.preyCounts?.firefly || 0} Icon={Sparkles} color="bg-yellow-500" delay={0.7} />
                            <StatCard label="Dragonflies" value={stats?.preyCounts?.dragonfly || 0} Icon={Plane} color="bg-blue-500" delay={0.75} />
                            <StatCard label="Geckos" value={stats?.preyCounts?.gecko || 0} Icon={Crosshair} color="bg-green-600" delay={0.8} />
                            <StatCard label="Spiders" value={stats?.preyCounts?.spider || 0} Icon={Bug} color="bg-slate-500" delay={0.85} />
                            <StatCard label="Lasers" value={stats?.preyCounts?.laser || 0} Icon={Target} color="bg-red-500" delay={0.9} />
                            <StatCard label="Snakes" value={stats?.preyCounts?.snake || 0} Icon={Activity} color="bg-amber-600" delay={0.95} />
                            <StatCard label="Water" value={stats?.preyCounts?.waterdrop || 0} Icon={Droplets} color="bg-blue-400" delay={1.0} />
                            <StatCard label="Koi" value={stats?.preyCounts?.fish || 0} Icon={Fish} color="bg-orange-400" delay={1.05} />
                        </div>
                    </div>

                    {/* PREMIUM LOCK OVERLAY */}
                    {!isPremium && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-x-0 bottom-0 top-[200px] z-30 flex items-center justify-center bg-gradient-to-t from-[#050508] via-[#050508]/90 to-transparent backdrop-blur-[2px]"
                        >
                            <div className="p-8 mx-6 rounded-[2rem] bg-[#1a1a2e] border border-purple-500/30 flex flex-col items-center text-center relative overflow-hidden shadow-2xl max-w-sm">
                                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                                <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />

                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="mb-4 p-4 bg-purple-500/10 rounded-full text-purple-400 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                                        <Lock size={32} />
                                    </div>
                                    <h3 className="text-2xl font-black text-white italic mb-2">UNLOCK ANALYTICS</h3>
                                    <p className="text-xs text-slate-400 mb-6 font-mono leading-relaxed">
                                        Detailed breakdown of your cat's hunting performance and prey preferences.
                                    </p>
                                    <button
                                        onClick={() => setShowUpsell(true)}
                                        className="w-full py-4 bg-white text-black rounded-xl font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2"
                                    >
                                        <span>Unlock Now</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                </div>
            </div>

            {showUpsell && (
                <UpsellModal
                    onClose={() => setShowUpsell(false)}
                    onUnlock={upgradeToPremium}
                    triggerSource="manual"
                />
            )}
        </motion.div>
    );
};
