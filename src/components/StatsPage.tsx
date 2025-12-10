import React from 'react';
import { motion, animate } from 'framer-motion';
import { useRef, useEffect } from 'react';
import { useCatProfiles } from '../hooks/useCatProfiles';

import type { GameStats } from '../engine/types';
import { Target, Trophy, Mouse, Bug, Sprout, Flower2, Feather, Sparkles, Plane, Activity, X, Lock, Wind, Crosshair, Droplets, Fish } from 'lucide-react';

interface StatsPageProps {
    onClose: () => void;
    isPremium: boolean;
    stats: GameStats | null;
}

export const StatsPage: React.FC<StatsPageProps> = ({ onClose, isPremium }) => {
    const { activeProfile } = useCatProfiles();
    const { stats } = activeProfile;

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
                <div className="max-w-5xl mx-auto space-y-8">

                    {/* Hero Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard label="Total Hunted" value={stats?.preyCaught || 0} Icon={Crosshair} color="bg-red-500" delay={0.1} colSpan="col-span-2 lg:col-span-1" />
                        <StatCard label="High Score" value={stats?.highScore || 0} Icon={Trophy} color="bg-amber-500" delay={0.2} colSpan="col-span-2 lg:col-span-1" />

                        {/* Big Accuracy Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="col-span-2 rounded-[2.5rem] bg-gradient-to-br from-[#1a1a24] to-[#0f0f13] border border-white/10 p-8 relative overflow-hidden group"
                        >
                            <div className="absolute right-0 top-0 w-64 h-64 bg-green-500/10 blur-[80px] rounded-full group-hover:bg-green-500/20 transition-colors" />
                            <div className="relative z-10 flex flex-col justify-between h-full">
                                <div className="flex justify-between items-start">
                                    <div className="p-3 bg-green-500/20 rounded-2xl text-green-400">
                                        <Activity size={24} />
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Laser Accuracy</div>
                                        <div className="text-4xl font-black text-white">
                                            {((stats?.preyCounts?.laser || 0) * 1.5).toFixed(0)}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-8">
                                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: '85%' }}
                                            transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                                            className="h-full bg-gradient-to-r from-green-600 to-emerald-400"
                                        />
                                    </div>
                                    <div className="flex justify-between mt-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                        <span>Efficiency Rating</span>
                                        <span className="text-green-400">Class S</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Prey Breakdown Grid */}
                    <div>
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
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="p-8 rounded-[2rem] bg-gradient-to-r from-purple-900/20 to-indigo-900/20 border border-purple-500/20 flex flex-col items-center text-center relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

                            <div className="relative z-10 flex flex-col items-center">
                                <div className="mb-4 p-4 bg-purple-500/10 rounded-full text-purple-400 border border-purple-500/20">
                                    <Lock size={32} />
                                </div>
                                <h3 className="text-2xl font-black text-white italic mb-2">UNLOCK PRO ANALYTICS</h3>
                                <p className="text-sm text-slate-400 mb-6 max-w-md font-mono">
                                    Gain access to historical trends, multi-subject comparison, and detailed predator efficiency metrics.
                                </p>
                                <button className="px-8 py-4 bg-white text-black rounded-xl font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                                    Upgrade to Pro
                                </button>
                            </div>
                        </motion.div>
                    )}

                </div>
            </div>
        </motion.div>
    );
};
