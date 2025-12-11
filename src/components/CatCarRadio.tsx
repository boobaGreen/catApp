import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, ListMusic } from 'lucide-react';
import type { useCatRadio } from '../hooks/useCatRadio';

interface CatCarRadioProps extends ReturnType<typeof useCatRadio> {
    onOpenPlaylist: () => void;
}

export const CatCarRadio: React.FC<CatCarRadioProps> = (radio) => {
    const { isPlaying, currentTrack, togglePlay, nextTrack, prevTrack, onOpenPlaylist } = radio;

    // Scrolling text logic
    const scrollRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        // Simple CSS animation via class is usually smoother, but let's ensure reset on track change
        el.style.animation = 'none';
        void el.offsetWidth; // trigger reflow
        el.style.animation = 'scrollText 10s linear infinite';
    }, [currentTrack.title]);

    return (
        <motion.div
            className="w-full mt-4"
        >
            <div className="relative bg-[#0f0f13] rounded-xl p-1 border border-white/10 shadow-2xl overflow-hidden group">

                {/* Glossy Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none z-10 rounded-xl" />

                {/* Faceplate Texture */}
                <div className="absolute inset-0 bg-[#16161e] opacity-100 rounded-[10px]" />

                <div className="relative z-20 flex items-center gap-2 p-3">

                    {/* LEFT: Branding */}
                    <div className="shrink-0 flex items-center justify-center w-16 h-10 bg-gradient-to-br from-gray-800 to-black rounded-lg border border-white/10 shadow-inner">
                        <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase leading-none">
                            Felis<span className="text-purple-400">FM</span>
                        </span>
                    </div>

                    {/* CENTER: LCD Display */}
                    <div className="flex-1 bg-[#050508] border border-white/10 rounded-md h-10 pl-0 pr-3 flex items-center overflow-hidden relative shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
                        {/* LCD Scanline Effect */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 pointer-events-none opacity-20 bg-[length:100%_2px,3px_100%]" />

                        <div className="flex items-center gap-3 w-full z-10">
                            {/* Visualizer (Fake) */}
                            <div className="flex gap-[2px] items-end h-4 w-auto shrink-0 opacity-90">
                                {[...Array(6)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="w-1.5 bg-gradient-to-t from-purple-500 to-purple-300 rounded-t-[1px] transition-all duration-75 ease-linear"
                                        style={{
                                            // Ensure min height
                                            height: isPlaying ? `${Math.max(40, Math.random() * 100)}%` : '30%',
                                            // Randomize animation duration slightly more natural
                                            animation: isPlaying ? `equalizer ${0.3 + (i * 0.13) + (Math.random() * 0.1)}s ease-in-out infinite alternate` : 'none',
                                            animationDelay: `-${Math.random()}s` // Desync start
                                        }}
                                    />
                                ))}
                            </div>

                            {/* Scrolling Text */}
                            <div className="flex-1 overflow-hidden relative h-full flex items-center">
                                <div ref={scrollRef} className="whitespace-nowrap font-mono text-xs text-purple-300 uppercase tracking-widest" style={{ animation: 'scrollText 10s linear infinite' }}>
                                    <span className="mr-8">{currentTrack.title}</span>
                                    <span className="mr-8 text-white/30">•</span>
                                    <span className="mr-8">{currentTrack.category === 'purr' ? 'Purr Therapy' : 'Kitty Beats'}</span>
                                    <span className="mr-8 text-white/30">•</span>
                                    <span>{currentTrack.title}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Tactile Controls */}
                    <div className="flex items-center gap-1">
                        <button onClick={prevTrack} className="w-8 h-8 rounded hover:bg-white/5 active:bg-black/40 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                            <SkipBack size={16} fill="currentColor" />
                        </button>

                        <button onClick={togglePlay} className="w-10 h-8 rounded bg-gradient-to-b from-[#2a2a35] to-[#1a1a20] border-t border-white/10 shadow-lg active:translate-y-[1px] active:shadow-none flex items-center justify-center text-white transition-all group-hover:from-purple-900/50 group-hover:to-purple-900/20">
                            {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                        </button>

                        <button onClick={nextTrack} className="w-8 h-8 rounded hover:bg-white/5 active:bg-black/40 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                            <SkipForward size={16} fill="currentColor" />
                        </button>

                        <div className="w-px h-6 bg-white/10 mx-1" />

                        <button onClick={onOpenPlaylist} className="w-8 h-8 rounded hover:bg-white/5 active:bg-black/40 flex items-center justify-center text-purple-400 hover:text-purple-300 transition-colors">
                            <ListMusic size={16} />
                        </button>
                    </div>

                </div>
            </div>

            {/* Ambient Base Light underneath */}
            <div className={`absolute -bottom-4 left-4 right-4 h-8 bg-purple-500/20 blur-xl rounded-full transition-opacity duration-700 ${isPlaying ? 'opacity-50' : 'opacity-0'}`} />

            <style>{`
                @keyframes scrollText {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                @keyframes equalizer {
                    0% { height: 40%; }
                    100% { height: 100%; }
                }
            `}</style>
        </motion.div>
    );
};
