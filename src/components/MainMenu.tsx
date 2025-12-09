import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { InfoModal } from './InfoModal';
import { StatsPage } from './StatsPage';
import { UpsellModal } from './UpsellModal';
import { useCatProfiles } from '../hooks/useCatProfiles';
import { ProfileSelector } from './ProfileSelector';

import type { GameMode } from '../engine/types';

interface MainMenuProps {
    onStartGame: (mode: GameMode) => void;
    onSettings: () => void;
    autoPlayActive: boolean;
    onToggleAutoPlay: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStartGame, onSettings, autoPlayActive, onToggleAutoPlay }) => {
    // Hooks
    const { activeProfile } = useCatProfiles();

    // Local State
    const [showInfo, setShowInfo] = useState(false);
    const [showStats, setShowStats] = useState(false);
    const [showUpsell, setShowUpsell] = useState(false);
    const [showProfiles, setShowProfiles] = useState(false);
    const [isPremium, setIsPremium] = useState(false);
    const [cooldownRemaining, setCooldownRemaining] = useState(0);

    const stats = activeProfile.stats;

    // --- TIMING & COOLDOWN LOGIC ---
    useEffect(() => {
        const premium = localStorage.getItem('isPremium') === 'true';
        setIsPremium(premium);

        let duration = 300;
        if (premium) {
            const stored = localStorage.getItem('cat_engage_cooldown_duration');
            duration = stored ? parseInt(stored) * 60 : 0;
        }

        if (duration > 0) {
            const checkCooldown = () => {
                const lastEnd = localStorage.getItem('lastSessionEnd');
                if (lastEnd) {
                    const elapsed = (Date.now() - parseInt(lastEnd)) / 1000;
                    if (elapsed < duration) setCooldownRemaining(Math.ceil(duration - elapsed));
                    else setCooldownRemaining(0);
                }
            };
            checkCooldown();
            const interval = setInterval(checkCooldown, 1000);
            return () => clearInterval(interval);
        } else {
            setCooldownRemaining(0);
        }
    }, []);

    const togglePremium = () => {
        const newState = !isPremium;
        setIsPremium(newState);
        localStorage.setItem('isPremium', String(newState));
        window.location.reload();
    };

    // --- MOUSE PARALLAX EFFECT ---
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const handleMouseMove = (e: React.MouseEvent) => {
        const { clientX, clientY, currentTarget } = e;
        const { width, height, left, top } = currentTarget.getBoundingClientRect();
        mouseX.set((clientX - left) / width - 0.5);
        mouseY.set((clientY - top) / height - 0.5);
    };

    // --- GAME GRID CONFIG ---
    // --- GAME GRID CONFIG ---
    const games: { id: GameMode; label: string; sub: string; icon: string; color: string; locked?: boolean; size: 'md' | 'lg' | 'wide' }[] = [
        { id: 'classic', label: 'Classic', sub: 'The Origin', icon: '🐁', color: 'from-orange-500 to-amber-600', size: 'lg' },
        { id: 'beetle', label: 'Beetle', sub: 'Ground Prey', icon: '🪲', color: 'from-lime-500 to-green-600', size: 'md' },
        { id: 'firefly', label: 'Firefly', sub: 'Night Mode', icon: '✨', color: 'from-yellow-400 to-amber-500', size: 'md' }, // High contrast yellow on dark
        { id: 'dragonfly', label: 'Dragonfly', sub: 'Aerial Ace', icon: '🚁', color: 'from-cyan-400 to-blue-500', size: 'wide' },
        { id: 'laser', label: 'Laser', sub: 'Red Dot', icon: '🔴', color: 'from-red-500 to-rose-600', size: 'md' },
        { id: 'butterfly', label: 'Zen', sub: 'Flow State', icon: '🦋', color: 'from-purple-400 to-pink-500', size: 'md' },
        { id: 'feather', label: 'Air', sub: 'Jump Tech', icon: '🪶', color: 'from-emerald-400 to-teal-600', size: 'md' },
        { id: 'gecko', label: 'Gecko', sub: 'Wall Hugger', icon: '🦎', color: 'from-green-600 to-emerald-800', size: 'md' },
        { id: 'shuffle', label: 'Mix', sub: 'Auto-Cycle', icon: '🔀', color: 'from-indigo-500 to-violet-600', locked: !isPremium, size: 'wide' },
    ];

    return (
        <div
            className="relative h-[100dvh] w-full bg-[#050508] text-white font-sans overflow-hidden flex flex-col selection:bg-purple-500/30"
            onMouseMove={handleMouseMove}
        >

            {/* SPATIAL BACKGROUND */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Deep Nebula Mesh */}
                <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#0a0a0f] to-[#050508] blur-3xl opacity-60 animate-pulse" />

                {/* Floating Orbs */}
                <motion.div
                    style={{ x: useTransform(mouseX, [-0.5, 0.5], [20, -20]), y: useTransform(mouseY, [-0.5, 0.5], [20, -20]) }}
                    className="absolute top-[10%] right-[10%] w-64 h-64 bg-purple-600/10 rounded-full blur-[80px]"
                />
                <motion.div
                    style={{ x: useTransform(mouseX, [-0.5, 0.5], [-30, 30]), y: useTransform(mouseY, [-0.5, 0.5], [-30, 30]) }}
                    className="absolute bottom-[20%] left-[5%] w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]"
                />
            </div>

            {/* BACKGROUND: Subtle Grid */}
            <div className="absolute inset-0 opacity-[0.05]"
                style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '50px 50px', maskImage: 'radial-gradient(circle at center, black, transparent)' }}
            />

            {/* --- MODALS --- */}
            <AnimatePresence>
                {showInfo && <InfoModal onClose={() => setShowInfo(false)} currentKills={stats?.preyCaught || 0} />}
                {showStats && <StatsPage onClose={() => setShowStats(false)} isPremium={isPremium} stats={activeProfile.stats} />}
                {showUpsell && <UpsellModal onClose={() => setShowUpsell(false)} onUnlock={togglePremium} />}
                {showProfiles && <ProfileSelector onClose={() => setShowProfiles(false)} />}
            </AnimatePresence>

            {/* --- HEADER --- */}
            <div className="shrink-0 p-6 pt-12 flex justify-between items-start z-10">
                <div onClick={import.meta.env.DEV ? togglePremium : undefined} className="cursor-pointer">
                    <h1 className="text-sm font-bold tracking-[0.2em] text-slate-500 uppercase">Felis<span className="text-white">OS</span> v2.0</h1>
                </div>

                {/* Minimal Upgrade / Loop Status */}
                {isPremium ? (
                    <div onClick={onToggleAutoPlay} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 backdrop-blur-md cursor-pointer hover:bg-white/10 transition-colors">
                        <div className={`w-1.5 h-1.5 rounded-full ${autoPlayActive ? 'bg-green-400' : 'bg-slate-500'}`} />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">{autoPlayActive ? 'Auto-Loop' : 'Manual'}</span>
                    </div>
                ) : (
                    <button onClick={() => setShowUpsell(true)} className="text-[10px] font-bold uppercase tracking-widest text-amber-500 px-3 py-1 rounded-full border border-amber-500/30 hover:bg-amber-500/10">
                        Pro Required
                    </button>
                )}
            </div>

            {/* --- HERO SECTION (SPATIAL CARD) --- */}
            <div className="px-6 pb-6 z-10 relative">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowProfiles(true)}
                    className="w-full aspect-[2.2/1] bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-6 relative overflow-hidden group cursor-pointer shadow-2xl"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
                >
                    {/* Glass Reflection */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                    <div className="relative z-10 flex flex-col justify-end h-full">
                        <div className="absolute top-0 right-0 p-2 opacity-50">
                            <svg className="w-5 h-5 text-white transform rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </div>

                        <div className="flex items-end justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={`w-8 h-8 rounded-full ${activeProfile.avatarColor} flex items-center justify-center text-lg shadow-lg`}>
                                        <span className="filter drop-shadow-sm">🐱</span>
                                    </div>
                                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Active System</span>
                                </div>
                                <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tighter">{activeProfile.name}</h2>
                            </div>

                            {/* Mini Stats in Hero */}
                            <div className="text-right hidden sm:block">
                                <div className="text-xs text-slate-500 uppercase font-bold tracking-widest">Efficiency</div>
                                <div className="text-2xl font-bold text-green-400">98%</div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* --- SCROLLABLE CONTENT --- */}
            <div className="flex-1 overflow-y-auto px-6 pb-32 custom-scrollbar z-10 mask-image-b">

                {/* Stats Row */}
                <div onClick={() => setShowStats(true)} className="grid grid-cols-3 gap-3 mb-8">
                    <StatPill label="Caught" value={stats?.preyCaught || 0} />
                    <StatPill label="Best" value={stats?.highScore || 0} color="text-amber-400" />
                    <StatPill label="Rank" value={(stats?.highScore || 0) > 100 ? 'S' : 'B'} color="text-purple-400" />
                </div>

                {/* Modules Header */}
                <div className="flex items-center gap-4 mb-4 opacity-60">
                    <div className="h-px bg-white/20 flex-1" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">Modules</span>
                    <div className="h-px bg-white/20 flex-1" />
                </div>

                <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
                    {games.map((mode, i) => {
                        const isLocked = mode.locked && !isPremium;
                        const colSpan = mode.size === 'lg' ? 'col-span-2' : 'col-span-1';

                        return (
                            <motion.button
                                key={mode.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 + 0.2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => isLocked ? setShowUpsell(true) : onStartGame(mode.id)}
                                className={`
                                    ${colSpan} relative rounded-[2rem] p-6 flex flex-col justify-between overflow-hidden group
                                    ${isLocked ? 'bg-[#0f0f16] opacity-60' : 'bg-[#151520] hover:bg-[#1a1a26]'}
                                    border border-white/5 shadow-lg transition-all
                                `}
                                style={{
                                    minHeight: mode.size === 'lg' ? '160px' : '140px',
                                    backdropFilter: 'blur(20px)'
                                }}
                            >
                                {/* Inner Glow */}
                                {!isLocked && (
                                    <div className={`absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-tl ${mode.color} opacity-20 blur-3xl rounded-full group-hover:opacity-30 transition-opacity`} />
                                )}

                                <div className="flex justify-between items-start z-10">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-white/5 border border-white/5 shadow-inner text-white backdrop-blur-md`}>
                                        {mode.icon}
                                    </div>
                                    {isLocked && <div className="text-[10px] font-bold bg-white/5 border border-white/10 px-2 py-1 rounded-full backdrop-blur text-slate-400">LOCKED</div>}
                                </div>

                                <div className="z-10 text-left">
                                    <div className="text-[10px] text-white/40 font-bold uppercase tracking-wider mb-1">{mode.sub}</div>
                                    <div className="text-2xl font-bold text-white tracking-tight group-hover:tracking-normal transition-all">{mode.label}</div>
                                </div>
                            </motion.button>
                        );
                    })}

                </div>

                {/* FOOTER CREDIT */}
                <div className="mt-12 mb-8 text-center opacity-40 hover:opacity-100 transition-opacity">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                        Made by Claudio with ❤️ for Salsa & Missy
                    </p>
                </div>
            </div>

            {/* --- PERSISTENT DOCK (Floating Island) --- */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center z-50 pointer-events-none">
                <div className="pointer-events-auto bg-black/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-2 pl-6 pr-6 shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex items-center gap-8 transform hover:scale-105 transition-transform duration-300">

                    <DockBtn label="Info" icon="ℹ️" onClick={() => setShowInfo(true)} />

                    <div className="h-8 w-px bg-white/10" />

                    <DockBtn label="Stats" icon="📊" active={true} onClick={() => setShowStats(true)} />

                    <div className="h-8 w-px bg-white/10" />

                    <DockBtn label="Setup" icon="⚙️" onClick={onSettings} />

                </div>
            </div>

            {/* Cooldown Overlay */}
            {cooldownRemaining > 0 && !isPremium && (
                <div className="absolute inset-0 z-50 bg-[#0a0a0f]/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center">
                    <div className="text-6xl mb-6 animate-pulse">💤</div>
                    <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">System Cooling</h2>
                    <p className="text-slate-400 mb-8 max-w-xs leading-relaxed">Optimization algorithms running. Resume shortly.</p>
                    <div className="font-mono text-5xl text-white mb-10 tracking-widest">
                        {formatTime(cooldownRemaining)}
                    </div>
                    <button onClick={() => setShowUpsell(true)} className="px-8 py-4 bg-white text-black rounded-full font-bold uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                        Bypass Protocol
                    </button>
                </div>
            )}
        </div>
    );
};

// Helper
const StatPill = ({ label, value, color = 'text-white' }: { label: string, value: string | number, color?: string }) => (
    <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col items-center justify-center backdrop-blur-sm cursor-pointer hover:bg-white/10 transition-colors">
        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-0.5">{label}</span>
        <span className={`text-lg font-bold ${color}`}>{value}</span>
    </div>
);

const DockBtn = ({ label, icon, onClick, active }: { label: string, icon: string, onClick: () => void, active?: boolean }) => (
    <button
        onClick={onClick}
        title={label}
        aria-label={label}
        className={`relative group p-2 transition-all ${active ? 'text-white' : 'text-slate-500 hover:text-white'}`}
    >
        <span className="text-2xl filter drop-shadow-lg relative z-10 transition-transform group-hover:-translate-y-1 block">{icon}</span>
        {active && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white shadow-[0_0_5px_white]" />}
    </button>
);

const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
};
