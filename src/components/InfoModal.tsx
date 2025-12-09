import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface InfoModalProps {
    onClose: () => void;
    currentKills: number;
}

const variants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 300 : -300,
        opacity: 0
    }),
    center: {
        zIndex: 1,
        x: 0,
        opacity: 1
    },
    exit: (direction: number) => ({
        zIndex: 0,
        x: direction < 0 ? 300 : -300,
        opacity: 0
    })
};

export const InfoModal: React.FC<InfoModalProps> = ({ onClose }) => {
    // Tuple to track [page, direction] for animation
    const [[page, direction], setPage] = useState([0, 0]);

    const pages = [
        {
            title: "ETHOLOGY",
            icon: "🧠",
            content: (
                <div className="flex flex-col items-center w-full">
                    <p className="text-center text-slate-400 text-xs md:text-base leading-relaxed italic mb-6">
                        "Engineered to stimulate Felis Catus predatory instincts using specific light spectrums and ultrasonic triggers."
                    </p>

                    {/* Professional Spectrum Visualizer */}
                    <div className="w-full bg-[#1a1a2e] rounded-xl p-4 border border-white/10 mb-2 shadow-inner">
                        <div className="flex justify-between text-[10px] md:text-xs text-slate-500 font-bold tracking-widest mb-2">
                            <span>VISIBLE SPECTRUM</span>
                            <span>TARGET: 450-550nm</span>
                        </div>
                        <div className="w-full h-8 md:h-12 rounded-lg bg-gradient-to-r from-blue-600 via-green-500 to-yellow-400 relative overflow-hidden ring-1 ring-white/10">
                            {/* Scanline effect */}
                            <div className="absolute inset-0 bg-white/10 w-[10%] skew-x-12 animate-[spin_2s_linear_infinite]" style={{ animation: 'scan 2s linear infinite' }} />
                        </div>
                        <div className="flex justify-between mt-2">
                            <div className="text-center">
                                <div className="text-purple-400 text-xs md:text-sm font-bold">Rod Cells</div>
                                <div className="text-[9px] md:text-xs text-slate-500">High Contrast</div>
                            </div>
                            <div className="text-center">
                                <div className="text-pink-400 text-xs md:text-sm font-bold">3-8kHz</div>
                                <div className="text-[9px] md:text-xs text-slate-500">Ultrasonic Pulse</div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "LIVING AI",
            icon: "🧬",
            content: (
                <div className="space-y-4 w-full text-left">
                    <p className="text-center text-slate-400 text-xs italic mb-2">
                        "The ecosystem adapts to your cat's skill level in real-time."
                    </p>
                    <EraRow name="😨 Fearful" req="Confidence < 30" prey="Slow" desc="Prey freezes to help kittens." active={true} />
                    <EraRow name="😐 Balanced" req="Confidence 30-70" prey="Normal" desc="Standard hunting experience." active={true} />
                    <EraRow name="😈 Apex" req="Confidence > 70" prey="Hyper" desc="Evasive prey for experts." active={true} />

                    <div className="mt-4 p-3 bg-[#1a1a2e] rounded-lg border border-white/10 text-[10px] text-slate-400">
                        <span className="text-purple-400 font-bold">HOW IT WORKS:</span>
                        <ul className="list-disc pl-4 mt-1 space-y-1">
                            <li>Cat Kills → Confidence DROPS (Easier)</li>
                            <li>Prey Escapes → Confidence RISES (Harder)</li>
                        </ul>
                    </div>
                </div>
            )
        },
        {
            title: "SAFE EXIT",
            icon: "🔒",
            content: (
                <div className="flex flex-col items-center w-full">
                    <p className="mb-8 text-center text-slate-300 text-sm md:text-base italic">
                        "Your cat can tap, but they can't slide."
                    </p>

                    {/* Slider Demo Visualization */}
                    <div className="relative w-64 h-16 bg-[#0a0a12] rounded-full border border-white/10 flex items-center px-2 mb-4 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] overflow-hidden">

                        {/* Track Decor */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-20">
                            <div className="w-full h-px bg-white/30" />
                        </div>

                        {/* Text Hint */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-white/20 animate-pulse">
                                Slide to Home
                            </span>
                        </div>

                        {/* Animated Handle */}
                        <motion.div
                            animate={{
                                x: [0, 180, 180, 0],
                                scale: [1, 0.9, 0.9, 1]
                            }}
                            transition={{
                                duration: 2.5,
                                repeat: Infinity,
                                ease: "easeInOut",
                                times: [0, 0.4, 0.6, 1]
                            }}
                            className="relative z-10 w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.5)] flex items-center justify-center border border-white/20"
                        >
                            <span className="text-lg">🐱</span>
                        </motion.div>

                        {/* Target Zone */}
                        <div className="absolute right-2 w-12 h-12 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center">
                            <span className="text-lg opacity-40 grayscale">🏠</span>
                        </div>
                    </div>

                    <div className="text-center space-y-1">
                        <p className="font-bold text-orange-400 uppercase tracking-widest text-xs md:text-sm">
                            Drag & Release
                        </p>
                        <p className="text-[10px] text-slate-500">
                            Located at top of screen during gameplay
                        </p>
                    </div>
                </div>
            )
        },
        {
            title: "AUTONOMOUS",
            icon: "🤖",
            content: (
                <div className="flex flex-col items-center w-full">
                    <p className="text-center text-slate-400 text-xs md:text-base leading-relaxed italic mb-6">
                        "The first digital cat sitter that manages energy levels while you're away."
                    </p>

                    <div className="w-full bg-[#1a1a2e] rounded-xl p-6 border border-white/10 mb-4 shadow-xl relative overflow-hidden">
                        {/* Status Light */}
                        <div className="absolute top-4 right-4 w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]" />

                        <div className="space-y-6">
                            <div className="text-left">
                                <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-1">Cycle Logic</h4>
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <span className="text-purple-400 font-bold">HUNT (3m)</span>
                                    <span>➔</span>
                                    <span className="text-slate-500 font-bold">REST (10m)</span>
                                    <span>➔</span>
                                    <span className="text-purple-400 font-bold">REPEAT</span>
                                </div>
                            </div>

                            <div className="text-left">
                                <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-1">Always On</h4>
                                <p className="text-xs text-slate-400">
                                    Global Wake Lock keeps the screen active forever. No sleep mode interruptions.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="text-[10px] text-center text-slate-500 mt-2 uppercase tracking-widest font-bold">
                        Requires Pro Configuration
                    </div>
                </div>
            )
        },
        {
            title: "PRO CONTROL",
            icon: "💎",
            content: (
                <div className="flex flex-col w-full space-y-6">
                    <div className="bg-[#1a1a2e] p-5 rounded-xl border border-white/10">
                        <h3 className="text-center text-white font-black uppercase tracking-widest mb-6 text-sm md:text-base">Veterinary Grade Control</h3>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-xs md:text-sm">
                                <span className="text-slate-400">Session Duration</span>
                                <div className="text-right">
                                    <span className="block text-purple-400 font-bold">Manual / Auto-AI</span>
                                    <span className="block text-slate-500 text-[9px]">Free: 90s Limit</span>
                                </div>
                            </div>
                            <div className="w-full h-px bg-white/10" />

                            <div className="flex justify-between items-center text-xs md:text-sm">
                                <span className="text-slate-400">Rest Cooldown</span>
                                <div className="text-right">
                                    <span className="block text-white font-bold">Adjustable (0-30m)</span>
                                    <span className="block text-slate-500 text-[9px]">Free: 5m Mandatory</span>
                                </div>
                            </div>
                            <div className="w-full h-px bg-white/10" />

                            <div className="flex justify-between items-center text-xs md:text-sm">
                                <span className="text-slate-400">Bio-Rhythm</span>
                                <div className="text-right">
                                    <span className="block text-pink-400 font-bold">Stress Prevention</span>
                                    <span className="block text-slate-500 text-[9px]">Auto-Stop on Fatigue</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black py-4 rounded-xl uppercase tracking-widest text-xs md:text-sm shadow-[0_10px_30px_-10px_rgba(168,85,247,0.5)] hover:scale-105 transition-transform">
                        Unlock Pro Controls
                    </button>
                </div>
            )
        }
    ];

    const paginate = (newDirection: number) => {
        const newPage = page + newDirection;
        if (newPage >= 0 && newPage < pages.length) {
            setPage([newPage, newDirection]);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#0a0a12]/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6"
        >
            {/* SCALING WRAPPER */}
            <div className="w-full max-w-sm bg-[#1e1e2d] border border-white/10 rounded-3xl p-6 relative overflow-hidden transform transition-transform duration-300 md:scale-[1.7] lg:scale-[1.0] shadow-2xl">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-white font-black text-2xl tracking-tighter uppercase flex items-center gap-2">
                        <span>{pages[page].icon}</span>
                        {pages[page].title}
                    </h2>
                    <div className="flex gap-1">
                        {pages.map((_, i) => (
                            <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === page ? 'bg-white' : 'bg-white/10'}`} />
                        ))}
                    </div>
                </div>

                {/* Content Area with Swipe */}
                <div className="h-96 flex items-center justify-center relative">
                    <AnimatePresence initial={false} custom={direction} mode='wait'>
                        <motion.div
                            key={page}
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                x: { type: "spring", stiffness: 300, damping: 30 },
                                opacity: { duration: 0.2 }
                            }}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={1}
                            onDragEnd={(_, { offset }) => {
                                // Simple swipe detection threshold
                                if (offset.x < -50) {
                                    paginate(1);
                                } else if (offset.x > 50) {
                                    paginate(-1);
                                }
                            }}
                            className="w-full h-full flex flex-col justify-center absolute top-0 left-0"
                        >
                            {pages[page].content}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Controls */}
                <div className="flex justify-between items-center mt-6">
                    {page > 0 ? (
                        <button onClick={() => paginate(-1)} className="text-slate-500 hover:text-white uppercase text-xs font-bold tracking-widest transition-colors">Prev</button>
                    ) : (
                        <div />
                    )}

                    <div className="text-slate-600 text-[9px] uppercase tracking-widest font-bold">Swipe or Tap</div>

                    {page < pages.length - 1 ? (
                        <button onClick={() => paginate(1)} className="text-purple-400 hover:text-white uppercase text-xs font-bold tracking-widest transition-colors">Next</button>
                    ) : (
                        <button onClick={onClose} className="text-pink-400 hover:text-white uppercase text-xs font-bold tracking-widest transition-colors">Close</button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const EraRow: React.FC<{ name: string, req: string, prey: string, desc: string, active: boolean }> = ({ name, req, prey, desc, active }) => (
    <div className={`flex justify-between items-center p-3 rounded-lg border border-white/5 ${active ? 'bg-[#2a2a40]' : 'opacity-60 grayscale'}`}>
        <div>
            <div className={`text-xs font-bold uppercase ${active ? 'text-white' : 'text-slate-400'}`}>{name}</div>
            <div className="text-[10px] text-purple-400 font-bold tracking-wider">{req}</div>
        </div>
        <div className="text-right">
            <div className="text-lg text-slate-200">{prey}</div>
            <div className="text-[9px] text-slate-500 uppercase">{desc}</div>
        </div>
    </div>
);
