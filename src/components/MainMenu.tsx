import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
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
    const mainRef = useRef<HTMLDivElement>(null);
    const orbitRef = useRef<HTMLDivElement>(null);
    const nucleusRef = useRef<HTMLDivElement>(null);

    // Local State
    const [showInfo, setShowInfo] = useState(false);
    const [showStats, setShowStats] = useState(false);
    const [showUpsell, setShowUpsell] = useState(false);
    const [showProfiles, setShowProfiles] = useState(false);
    const [isPremium, setIsPremium] = useState(false);
    const [cooldownRemaining, setCooldownRemaining] = useState(0);

    const stats = activeProfile.stats;

    // --- GSAP ORBIT SYSTEM ---
    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // 1. NEBULA BACKGROUND
            gsap.to('.nebula-particle', {
                y: "random(-50, 50)",
                x: "random(-50, 50)",
                opacity: "random(0.3, 0.6)",
                duration: "random(5, 10)",
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });

            // 2. NUCLEUS PULSE
            if (nucleusRef.current) {
                gsap.to(nucleusRef.current, {
                    scale: 1.05,
                    boxShadow: "0 0 60px rgba(168, 85, 247, 0.4)",
                    duration: 3,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut"
                });
            }

            // 3. ORBITAL ROTATION
            if (orbitRef.current) {
                gsap.to(orbitRef.current, {
                    rotation: 360,
                    duration: 60,
                    repeat: -1,
                    ease: "none"
                });

                // Keep planets upright while orbit rotates
                gsap.utils.toArray<HTMLElement>('.planet-node').forEach(node => {
                    gsap.to(node, {
                        rotation: -360,
                        duration: 60,
                        repeat: -1,
                        ease: "none"
                    });
                });
            }

        }, mainRef);
        return () => ctx.revert();
    }, []);

    useEffect(() => {
        const premium = localStorage.getItem('isPremium') === 'true';
        setIsPremium(premium);

        // Cooldown Check
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
    }

    // --- GAME NODES CONFIG ---
    // Positioned in a circle (Orbit)
    const gameModes: { id: GameMode; icon: string; label: string; color: string; locked?: boolean }[] = [
        { id: 'classic', icon: '🐁', label: 'Classic', color: 'bg-orange-500' },
        { id: 'laser', icon: '🔴', label: 'Laser', color: 'bg-red-500' },
        { id: 'butterfly', icon: '🦋', label: 'Zen', color: 'bg-cyan-400' },
        { id: 'shuffle', icon: '🔀', label: 'Mix', color: 'bg-purple-600', locked: !isPremium },
        { id: 'feather', icon: '🪶', label: 'Air', color: 'bg-emerald-400' },
    ];

    const radius = 130; // Orbit radius

    return (
        <div ref={mainRef} className="relative h-full w-full overflow-hidden bg-[#030305] text-white font-sans selection:bg-purple-500/30">

            {/* --- DEEP SPACE BACKGROUND --- */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#050508] to-black" />
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

                {/* Nebula Particles */}
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="nebula-particle absolute rounded-full blur-[80px]"
                        style={{
                            width: `${Math.random() * 300 + 100}px`,
                            height: `${Math.random() * 300 + 100}px`,
                            background: i % 2 === 0 ? 'rgba(76, 29, 149, 0.15)' : 'rgba(219, 39, 119, 0.1)',
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`
                        }}
                    />
                ))}
            </div>

            {/* --- MODALS --- */}
            <AnimatePresence>
                {showInfo && <InfoModal onClose={() => setShowInfo(false)} currentKills={stats?.preyCaught || 0} />}
                {showStats && <StatsPage onClose={() => setShowStats(false)} isPremium={isPremium} stats={stats} />}
                {showUpsell && <UpsellModal onClose={() => setShowUpsell(false)} onUnlock={togglePremium} />}
                {showProfiles && <ProfileSelector onClose={() => setShowProfiles(false)} />}
            </AnimatePresence>

            {/* --- MAIN INTERFACE: NEURAL ORBIT --- */}
            <div className="relative z-10 w-full h-full flex flex-col justify-between pointer-events-none">

                {/* 1. TOP STATUS BAR */}
                <div className="w-full p-6 flex justify-between items-start pointer-events-auto">
                    <div onClick={import.meta.env.DEV ? togglePremium : undefined} className="cursor-pointer">
                        <h1 className="text-xl font-black tracking-tighter text-white/40">FELIS<span className="text-purple-500">.</span></h1>
                    </div>
                    <div className="flex gap-2">
                        {isPremium ? (
                            <motion.button
                                onClick={onToggleAutoPlay}
                                whileTap={{ scale: 0.95 }}
                                className={`px-4 py-2 rounded-full border border-white/10 backdrop-blur-md flex items-center gap-2 ${autoPlayActive ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                            >
                                <div className={`w-2 h-2 rounded-full ${autoPlayActive ? 'bg-green-400 animate-pulse' : 'bg-slate-500'}`} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">{autoPlayActive ? 'LOOP ACTIVE' : 'AUTO-LOOP'}</span>
                            </motion.button>
                        ) : (
                            <motion.button
                                onClick={() => setShowUpsell(true)}
                                whileTap={{ scale: 0.95 }}
                                className="px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center gap-2"
                            >
                                <span className="text-[10px] font-bold uppercase tracking-widest">GET PRO</span>
                            </motion.button>
                        )}
                    </div>
                </div>

                {/* 2. CENTRAL NUCLEUS (PROFILE) & ORBIT (GAMES) */}
                <div className="flex-1 relative flex items-center justify-center pointer-events-auto perspective-1000">

                    {/* ORBIT TRACKS */}
                    <div className="absolute w-[260px] h-[260px] rounded-full border border-white/5" />
                    <div className="absolute w-[350px] h-[350px] rounded-full border border-white/5 opacity-50 border-dashed" />

                    {/* NUCLEUS: Active Cat */}
                    <motion.div
                        ref={nucleusRef}
                        onClick={() => setShowProfiles(true)}
                        className="relative z-20 w-32 h-32 rounded-full bg-[#16162a] border-4 border-[#252540] flex items-center justify-center cursor-pointer group hover:border-purple-500 transition-colors shadow-2xl"
                        whileTap={{ scale: 0.9 }}
                    >
                        <div className={`text-5xl drop-shadow-lg ${activeProfile.avatarColor}`}>🐱</div>
                        <div className="absolute -bottom-10 flex flex-col items-center w-48">
                            <span className="text-lg font-bold text-white tracking-tight">{activeProfile.name}</span>
                            <span className="text-[9px] text-purple-400 uppercase tracking-[0.2em] font-bold">Touch to Switch</span>
                        </div>
                    </motion.div>

                    {/* ORBITING SYSTEM */}
                    <div ref={orbitRef} className="absolute w-[260px] h-[260px] rounded-full animate-spin-slow origin-center z-10 pointer-events-none">
                        {gameModes.map((mode, i) => {
                            const angle = (i * (360 / gameModes.length)) * (Math.PI / 180);
                            const x = Math.cos(angle) * radius; // 130px radius
                            const y = Math.sin(angle) * radius;

                            // Adjust position to be centered on the orbit line (width/2)
                            const style = {
                                top: '50%',
                                left: '50%',
                                transform: `translate(${x}px, ${y}px) translate(-50%, -50%)`
                            };

                            const isLocked = mode.locked && !isPremium;

                            return (
                                <motion.button
                                    key={mode.id}
                                    style={style}
                                    className={`planet-node absolute w-16 h-16 rounded-2xl flex flex-col items-center justify-center shadow-lg pointer-events-auto transition-all duration-300 group
                                        ${isLocked ? 'bg-slate-900 border border-slate-700 grayscale' : `bg-white/10 backdrop-blur-md border border-white/20 hover:scale-110 hover:bg-white/20 hover:border-${mode.color.split('-')[1]}-400`}
                                    `}
                                    onClick={() => isLocked ? setShowUpsell(true) : onStartGame(mode.id)}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <span className="text-2xl filter drop-shadow-md mb-1">{mode.icon}</span>
                                    <span className={`text-[8px] font-bold uppercase tracking-wider ${isLocked ? 'text-slate-500' : 'text-white/80'}`}>
                                        {mode.label}
                                    </span>
                                    {isLocked && <div className="absolute -top-1 -right-1 text-xs">🔒</div>}

                                    {/* Selection Glow */}
                                    {!isLocked && (
                                        <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${mode.color} -z-10 blur-md`} />
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>
                </div>

                {/* 3. CONTROL DOCK (PERSISTENT) */}
                <div className="w-full flex justify-center pb-8 pt-4 pointer-events-auto">
                    <div className="flex items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-2 px-6 shadow-2xl hover:shadow-purple-900/20 transition-shadow">

                        {/* 1. INFO */}
                        <DockItem label="Info" icon="ℹ️" onClick={() => setShowInfo(true)} />

                        <div className="w-px h-8 bg-white/10 mx-2" />

                        {/* 2. STATS (HERO) */}
                        <motion.button
                            onClick={() => setShowStats(true)}
                            className="group flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white shadow-lg hover:shadow-purple-500/50 hover:-translate-y-2 transition-all"
                            whileTap={{ scale: 0.9 }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" viewBox="0 0 20 20" fill="currentColor"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" /><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" /></svg>
                            <span className="text-[9px] font-bold uppercase tracking-wider">Stats</span>
                        </motion.button>

                        <div className="w-px h-8 bg-white/10 mx-2" />

                        {/* 3. SETTINGS */}
                        <DockItem label="Setup" icon="⚙️" onClick={onSettings} />

                    </div>
                </div>

                {/* Cooldown Overlay */}
                {cooldownRemaining > 0 && !isPremium && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center pointer-events-auto"
                        onClick={() => setShowUpsell(true)}
                    >
                        <div className="text-6xl animate-bounce mb-4">💤</div>
                        <h2 className="text-2xl font-bold text-white mb-2">Cat is Resting</h2>
                        <p className="text-slate-400 font-mono text-xl">{formatTime(cooldownRemaining)}</p>
                        <button className="mt-8 px-6 py-3 bg-amber-500 text-black font-bold rounded-full hover:scale-105 transition-transform">
                            Wake Up Now (Pro)
                        </button>
                    </motion.div>
                )}

            </div>
        </div>
    );
};

// Helper Component for Dock
const DockItem = ({ label, icon, onClick }: { label: string, icon: string, onClick: () => void }) => (
    <button
        onClick={onClick}
        className="group flex flex-col items-center justify-center w-12 h-12 rounded-xl hover:bg-white/10 text-white/50 hover:text-white transition-all hover:-translate-y-1"
    >
        <span className="text-xl mb-0.5 group-hover:scale-110 transition-transform">{icon}</span>
        <span className="text-[8px] font-bold uppercase tracking-widest">{label}</span>
    </button>
);

const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
};
