import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { InfoModal } from './InfoModal';
import { StatsPage } from './StatsPage';
import { UpsellModal } from './UpsellModal';
import { useCatProfiles } from '../hooks/useCatProfiles';
import { ProfileSelector } from './ProfileSelector';
import { GameModeSelector } from './GameModeSelector';

import type { GameMode } from '../engine/types';

interface MainMenuProps {
    onStartGame: (mode: GameMode) => void;
    onSettings: () => void;
    autoPlayActive: boolean;
    onToggleAutoPlay: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStartGame, onSettings, autoPlayActive, onToggleAutoPlay }) => {
    // Hooks
    const { activeProfile, updateProfile } = useCatProfiles();
    const mainRef = useRef<HTMLDivElement>(null);
    const bgRef = useRef<HTMLDivElement>(null);
    const heroRef = useRef<HTMLDivElement>(null);

    // Local State
    const [showInfo, setShowInfo] = useState(false);
    const [showStats, setShowStats] = useState(false);
    const [showUpsell, setShowUpsell] = useState(false);
    const [showProfiles, setShowProfiles] = useState(false);
    const [isPremium, setIsPremium] = useState(false);
    const [cooldownRemaining, setCooldownRemaining] = useState(0);

    const stats = activeProfile.stats;

    // GSAP Ambient Animations
    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // Floating Blobs
            gsap.to('.floating-blob', {
                y: "random(-30, 30)",
                x: "random(-30, 30)",
                rotation: "random(-15, 15)",
                duration: "random(4, 7)",
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                stagger: { amount: 2, from: "random" }
            });

            // Hero Float
            if (heroRef.current) {
                gsap.to(heroRef.current, {
                    y: -10,
                    duration: 3,
                    repeat: -1,
                    yoyo: true,
                    ease: "power1.inOut"
                });
            }

        }, mainRef);

        return () => ctx.revert();
    }, []);

    useEffect(() => {
        // Load Premium State
        const premium = localStorage.getItem('isPremium') === 'true';
        setIsPremium(premium);

        // COOLDOWN LOGIC
        let duration = 300;
        if (premium) {
            const stored = localStorage.getItem('cat_engage_cooldown_duration');
            const mins = stored ? parseInt(stored) : 0;
            duration = mins * 60;
        }

        if (duration > 0) {
            const checkCooldown = () => {
                const lastEnd = localStorage.getItem('lastSessionEnd');
                if (lastEnd) {
                    const elapsed = (Date.now() - parseInt(lastEnd)) / 1000;
                    if (elapsed < duration) {
                        setCooldownRemaining(Math.ceil(duration - elapsed));
                    } else {
                        setCooldownRemaining(0);
                    }
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

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        if (hours > 0) return `${hours}h ${mins}m`;
        if (seconds < 3600) return `${mins}m ${secs}s`;
        return `${mins}m`;
    };

    return (
        <div ref={mainRef} className="relative h-full w-full overflow-hidden bg-[#0a0a12] text-white font-sans selection:bg-purple-500/30">

            {/* --- IMMERSIVE BACKGROUND --- */}
            <div
                ref={bgRef}
                className="absolute inset-0 z-0 opacity-40"
                style={{
                    backgroundImage: 'linear-gradient(135deg, #050505 0%, #1a1025 50%, #0f0518 100%)',
                }}
            />

            {/* Shapes */}
            <div className="absolute top-[-20%] right-[-20%] w-[80vw] h-[80vw] bg-purple-600/10 rounded-full blur-[120px] floating-blob mix-blend-screen" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-pink-600/10 rounded-full blur-[100px] floating-blob mix-blend-screen" />

            {/* --- MODALS --- */}
            <AnimatePresence>
                {showInfo && <InfoModal onClose={() => setShowInfo(false)} currentKills={stats?.preyCaught || 0} />}
                {showStats && <StatsPage onClose={() => setShowStats(false)} isPremium={isPremium} stats={stats} />}
                {showUpsell && <UpsellModal onClose={() => setShowUpsell(false)} onUnlock={togglePremium} />}
                {showProfiles && <ProfileSelector onClose={() => setShowProfiles(false)} />}
            </AnimatePresence>

            {/* --- LAYOUT GRID --- */}
            <div className="relative z-10 grid grid-rows-[auto_1fr_auto] h-full w-full p-6 md:p-12 max-w-7xl mx-auto">

                {/* 1. TOP BAR (Minimalist) */}
                <header className="flex justify-between items-center w-full">
                    <button
                        onClick={() => setShowInfo(true)}
                        className="group flex items-center gap-2 p-3 rounded-2xl bg-white/5 border border-white/5 text-white/40 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all backdrop-blur-md"
                    >
                        <span className="text-xl">ℹ️</span>
                        <span className="hidden md:inline text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Info</span>
                    </button>

                    <div onClick={import.meta.env.DEV ? togglePremium : undefined} className="text-center cursor-pointer select-none">
                        <h1 className="text-2xl md:text-3xl font-black tracking-[-0.05em] text-white/90">
                            FELIS<span className="text-purple-500">.</span>
                        </h1>
                    </div>

                    <button
                        onClick={onSettings}
                        className="group flex items-center gap-2 p-3 rounded-2xl bg-white/5 border border-white/5 text-white/40 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all backdrop-blur-md"
                    >
                        <span className="hidden md:inline text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Settings</span>
                        <span className="text-xl">⚙️</span>
                    </button>
                </header>

                {/* 2. HERO SECTION (Active Profile) */}
                <div className="flex flex-col items-center justify-center relative w-full perspective-1000">

                    <div ref={heroRef} className="relative z-20" onClick={() => setShowProfiles(true)}>
                        {/* HERO CARD */}
                        <motion.div
                            className="relative w-64 h-64 md:w-80 md:h-80 bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-[3rem] shadow-2xl border border-white/10 cursor-pointer group hover:border-purple-500/40 transition-colors"
                            whileHover={{ scale: 1.02, rotateX: 5, rotateY: 5 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                            {/* Inner Glow */}
                            <div className={`absolute inset-0 rounded-[3rem] opacity-20 bg-gradient-to-tr ${activeProfile.avatarColor} blur-2xl group-hover:opacity-40 transition-opacity`} />

                            {/* Content Container */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                                {/* Avatar */}
                                <motion.div
                                    layoutId={`avatar-${activeProfile.id}`}
                                    className={`w-24 h-24 md:w-32 md:h-32 rounded-full shadow-2xl flex items-center justify-center text-5xl md:text-6xl mb-6 relative z-10 bg-[#0a0a12] border-4 border-[#1a1a2e] group-hover:scale-110 transition-transform duration-500`}
                                >
                                    🐱
                                    <div className={`absolute inset-0 rounded-full border-2 border-dashed border-white/20 animate-spin-slow`} />
                                </motion.div>

                                {/* Name */}
                                <motion.h2
                                    className="text-3xl md:text-4xl font-black text-white tracking-tight mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-purple-200 transition-all"
                                >
                                    {activeProfile.name}
                                </motion.h2>

                                {/* Level / Title */}
                                <div className="text-xs font-bold uppercase tracking-[0.2em] text-purple-400/80 mb-4">
                                    Apex Predator
                                </div>

                                {/* Edit Hint */}
                                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity text-white/40 bg-white/5 p-2 rounded-full backdrop-blur-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Stats Summary under Hero */}
                    <div className="mt-8 flex gap-8 md:gap-16 opacity-60 hover:opacity-100 transition-opacity cursor-pointer" onClick={() => setShowStats(true)}>
                        <div className="text-center group">
                            <div className="text-2xl font-black text-white group-hover:text-purple-300 transition-colors">{stats.preyCaught || 0}</div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">Caught</div>
                        </div>
                        <div className="w-px h-10 bg-white/10" />
                        <div className="text-center group">
                            <div className="text-2xl font-black text-white group-hover:text-pink-300 transition-colors">{stats.highScore || 0}</div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">Best Score</div>
                        </div>
                    </div>

                </div>

                {/* 3. GAME SELECTOR & FOOTER */}
                <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">

                    {/* Game Mode Carousel */}
                    <div className="w-full relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a12] via-transparent to-[#0a0a12] z-10 pointer-events-none" />
                        {cooldownRemaining > 0 && !isPremium ? (
                            <motion.button
                                onClick={() => setShowUpsell(true)}
                                className="w-full h-40 rounded-3xl bg-slate-800/50 border border-white/5 flex flex-col items-center justify-center gap-3 cursor-pointer overflow-hidden relative group"
                            >
                                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-10" />
                                <div className="relative z-20 text-center animate-pulse">
                                    <div className="text-4xl mb-2">💤</div>
                                    <div className="text-xl font-bold text-slate-300">Cat is Resting</div>
                                    <div className="text-sm font-mono text-slate-500 mt-1">{formatTime(cooldownRemaining)} remaining</div>
                                </div>
                            </motion.button>
                        ) : (
                            <GameModeSelector
                                onStart={onStartGame}
                                activeProfile={activeProfile}
                                updateProfile={updateProfile}
                                isPremium={isPremium}
                                onShowUpsell={() => setShowUpsell(true)}
                                stats={stats}
                            />
                        )}
                    </div>

                    {/* Pro Actions */}
                    <div className="flex justify-center border-t border-white/5 pt-6">
                        {isPremium ? (
                            <div className="flex items-center gap-4 bg-white/5 px-6 py-3 rounded-full border border-white/10 backdrop-blur-md">
                                <span className="text-xs font-bold text-white/60 uppercase tracking-widest">Auto-Loop</span>
                                <button
                                    onClick={onToggleAutoPlay}
                                    className={`w-10 h-5 rounded-full p-0.5 transition-colors ${autoPlayActive ? 'bg-green-500' : 'bg-white/20'}`}
                                >
                                    <motion.div
                                        className="w-4 h-4 bg-white rounded-full shadow-sm"
                                        animate={{ x: autoPlayActive ? 20 : 0 }}
                                    />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowUpsell(true)}
                                className="text-xs font-bold text-amber-500 uppercase tracking-[0.2em] hover:text-amber-400 transition-colors flex items-center gap-2"
                            >
                                <span>💎</span> Unlock Pro Features
                            </button>
                        )}
                    </div>

                </div>

            </div>
        </div>
    );
};
