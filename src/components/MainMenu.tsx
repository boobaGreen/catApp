import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

    // --- GAME GRID CONFIG ---
    const games: { id: GameMode; label: string; sub: string; icon: string; color: string; locked?: boolean; size: 'md' | 'lg' }[] = [
        { id: 'classic', label: 'Classic', sub: 'The Original', icon: '🐁', color: 'from-orange-500 to-amber-600', size: 'lg' },
        { id: 'laser', label: 'Laser', sub: 'Agility', icon: '🔴', color: 'from-red-500 to-rose-600', size: 'md' },
        { id: 'butterfly', label: 'Zen', sub: 'Focus', icon: '🦋', color: 'from-cyan-400 to-blue-500', size: 'md' },
        { id: 'shuffle', label: 'Mix', sub: 'Auto-Cycle', icon: '🔀', color: 'from-purple-500 to-indigo-600', locked: !isPremium, size: 'md' },
        { id: 'feather', label: 'Air', sub: 'Jump', icon: '🪶', color: 'from-emerald-400 to-green-600', size: 'md' },
    ];

    return (
        <div className="relative h-[100dvh] w-full bg-[#0a0a0f] text-white font-sans overflow-hidden flex flex-col selection:bg-purple-500/30">

            {/* BACKGROUND: Subtle Grid */}
            <div className="absolute inset-0 opacity-[0.03]"
                style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}
            />

            {/* --- MODALS --- */}
            <AnimatePresence>
                {showInfo && <InfoModal onClose={() => setShowInfo(false)} currentKills={stats?.preyCaught || 0} />}
                {showStats && <StatsPage onClose={() => setShowStats(false)} isPremium={isPremium} stats={activeProfile.stats} />}
                {showUpsell && <UpsellModal onClose={() => setShowUpsell(false)} onUnlock={togglePremium} />}
                {showProfiles && <ProfileSelector onClose={() => setShowProfiles(false)} />}
            </AnimatePresence>

            {/* --- HEADER: LAB STATUS --- */}
            <div className="shrink-0 p-6 flex justify-between items-center z-10 bg-[#0a0a0f]/80 backdrop-blur-sm sticky top-0">
                <div onClick={import.meta.env.DEV ? togglePremium : undefined} className="cursor-pointer">
                    <h1 className="text-xl font-bold tracking-tight text-white">FELIS<span className="text-purple-500">.</span>LAB</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">System Online</span>
                    </div>
                </div>

                {/* Auto-Play Toggle (Compact) */}
                {isPremium ? (
                    <button
                        onClick={onToggleAutoPlay}
                        className={`h-10 px-4 rounded-xl border flex items-center gap-2 transition-all ${autoPlayActive ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-white/5 border-white/10 text-slate-400'}`}
                    >
                        <span className="text-[10px] font-bold uppercase tracking-wider">{autoPlayActive ? 'Loop On' : 'Loop Off'}</span>
                        <div className={`w-2 h-2 rounded-full ${autoPlayActive ? 'bg-green-400' : 'bg-slate-600'}`} />
                    </button>
                ) : (
                    <button onClick={() => setShowUpsell(true)} className="px-4 py-2 bg-amber-500/10 text-amber-500 border border-amber-500/30 rounded-xl text-[10px] font-bold uppercase tracking-widest">
                        Upgrade
                    </button>
                )}
            </div>

            {/* --- SCROLLABLE CONTENT (BENTO GRID) --- */}
            <div className="flex-1 overflow-y-auto px-6 pb-32 custom-scrollbar">

                <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">

                    {/* 1. HERO BLOCK: Active Profile */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        onClick={() => setShowProfiles(true)}
                        className="col-span-2 aspect-[2/1] rounded-[2rem] bg-[#161622] border border-white/5 relative overflow-hidden group cursor-pointer"
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br ${activeProfile.avatarColor} opacity-10 group-hover:opacity-20 transition-opacity`} />
                        <div className="absolute top-6 right-6 p-2 rounded-full bg-white/5 text-white/40">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                        </div>

                        <div className="absolute bottom-6 left-6">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-4xl">🐈</span>
                                <div className="px-2 py-0.5 rounded bg-white/10 text-[10px] uppercase font-bold text-white/60 backdrop-blur-md">Subject 0{activeProfile.id.slice(0, 1)}</div>
                            </div>
                            <h2 className="text-3xl font-bold text-white tracking-tight">{activeProfile.name}</h2>
                            <p className="text-xs text-slate-400 mt-1">Ready for simulation.</p>
                        </div>
                    </motion.div>

                    {/* 2. STATS SNAPSHOT */}
                    <div onClick={() => setShowStats(true)} className="col-span-2 grid grid-cols-3 gap-3 p-1">
                        <div className="bg-[#1a1a26] rounded-2xl p-3 border border-white/5 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-colors">
                            <div className="text-xs text-slate-500 uppercase font-bold">Caught</div>
                            <div className="text-xl font-bold text-white">{stats?.preyCaught || 0}</div>
                        </div>
                        <div className="bg-[#1a1a26] rounded-2xl p-3 border border-white/5 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-colors">
                            <div className="text-xs text-slate-500 uppercase font-bold">Best</div>
                            <div className="text-xl font-bold text-amber-500">{stats?.highScore || 0}</div>
                        </div>
                        <div className="bg-[#1a1a26] rounded-2xl p-3 border border-white/5 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-colors">
                            <div className="text-xs text-slate-500 uppercase font-bold">Accuracy</div>
                            <div className="text-xl font-bold text-purple-400">92%</div>
                        </div>
                    </div>

                    {/* 3. GAME MODES (Bento) */}
                    <div className="col-span-2 mt-4 mb-2 flex items-center justify-between">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Simulation Modules</h3>
                    </div>

                    {games.map((mode, i) => {
                        const isLocked = mode.locked && !isPremium;
                        const colSpan = mode.size === 'lg' ? 'col-span-2' : 'col-span-1';

                        return (
                            <motion.button
                                key={mode.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => isLocked ? setShowUpsell(true) : onStartGame(mode.id)}
                                className={`
                                    ${colSpan} relative rounded-[2rem] p-5 flex flex-col justify-between overflow-hidden group
                                    ${isLocked ? 'bg-[#151520] opacity-80' : 'bg-[#1a1a2e] hover:bg-[#202035]'}
                                    border border-white/5 transition-all
                                `}
                                style={{ minHeight: mode.size === 'lg' ? '140px' : '130px' }}
                            >
                                {/* Gradient Background */}
                                {!isLocked && (
                                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${mode.color} opacity-10 blur-2xl rounded-full translate-x-10 -translate-y-10 group-hover:opacity-20 transition-opacity`} />
                                )}

                                <div className="flex justify-between items-start z-10">
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl bg-gradient-to-br ${isLocked ? 'from-slate-700 to-slate-800' : mode.color} shadow-lg text-white`}>
                                        {mode.icon}
                                    </div>
                                    {isLocked && <div className="text-xs bg-black/40 px-2 py-1 rounded backdrop-blur">🔒 PRO</div>}
                                </div>

                                <div className="z-10 text-left">
                                    <div className="text-[10px] text-white/40 font-bold uppercase tracking-wider mb-0.5">{mode.sub}</div>
                                    <div className="text-xl font-bold text-white tracking-tight">{mode.label}</div>
                                </div>
                            </motion.button>
                        );
                    })}

                </div>
            </div>

            {/* --- PERSISTENT DOCK (Mac-style / Sci-Fi) --- */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center z-50 pointer-events-none">
                <div className="pointer-events-auto bg-[#1a1a2e]/80 backdrop-blur-xl border border-white/10 rounded-full p-2 px-6 shadow-2xl flex items-center gap-6">

                    <DockBtn label="Info" icon="ℹ️" onClick={() => setShowInfo(true)} />

                    {/* Floating Start Logic could go here, but for now just utility */}
                    <div className="w-px h-8 bg-white/10" />

                    <DockBtn label="Stats" icon="📊" active={true} onClick={() => setShowStats(true)} />

                    <div className="w-px h-8 bg-white/10" />

                    <DockBtn label="Setup" icon="⚙️" onClick={onSettings} />

                </div>
            </div>

            {/* Cooldown Overlay */}
            {cooldownRemaining > 0 && !isPremium && (
                <div className="absolute inset-0 z-50 bg-[#0a0a0f]/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center">
                    <div className="text-6xl mb-6 animate-pulse">💤</div>
                    <h2 className="text-2xl font-bold text-white mb-2">Rest Phase Active</h2>
                    <p className="text-slate-400 mb-8 max-w-xs">Your cat needs to process the simulation data.</p>
                    <div className="font-mono text-4xl text-white mb-8 border border-white/10 px-6 py-2 rounded-lg bg-black/20">
                        {formatTime(cooldownRemaining)}
                    </div>
                    <button onClick={() => setShowUpsell(true)} className="w-full max-w-xs py-4 bg-amber-500 rounded-xl text-black font-bold uppercase tracking-widest hover:scale-105 transition-transform">
                        Wake Up (Pro)
                    </button>
                </div>
            )}
        </div>
    );
};

// Helper
const DockBtn = ({ label, icon, onClick, active }: { label: string, icon: string, onClick: () => void, active?: boolean }) => (
    <button
        onClick={onClick}
        title={label}
        aria-label={label}
        className={`flex flex-col items-center gap-1 group transition-all hover:-translate-y-1 ${active ? 'text-purple-400' : 'text-slate-400 hover:text-white'}`}
    >
        <span className="text-2xl filter drop-shadow-md">{icon}</span>
        {/* <span className="text-[8px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity absolute -top-4 bg-black/80 px-2 py-0.5 rounded">{label}</span> */}
    </button>
);

const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
};
