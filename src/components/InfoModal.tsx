import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Activity, Shield, X, Trophy } from 'lucide-react';

interface InfoModalProps {
    onClose: () => void;
    currentKills: number;
}

export const InfoModal: React.FC<InfoModalProps> = ({ onClose }) => {
    // Tuple to track [page, direction] for animation
    const [[page, direction], setPage] = useState([0, 0]);

    // Close Button Component
    const CloseButton = () => (
        <button
            onClick={onClose}
            className="absolute top-6 right-6 z-50 p-3 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-white/50 hover:text-white transition-all group"
        >
            <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
        </button>
    );

    const pages = [
        {
            title: "ETHOLOGY",
            icon: Brain,
            content: (
                <div className="flex flex-col items-center w-full">
                    <p className="text-center text-slate-400 text-xs md:text-sm font-mono mb-8 leading-relaxed max-w-xs uppercase tracking-wide">
                        Engineered stimuli targeting <span className="text-white font-bold">Felis Catus</span> predatory instincts via specific light spectrums.
                    </p>

                    {/* Professional Spectrum Visualizer */}
                    <div className="w-full bg-[#1a1a2e] rounded-xl p-6 border border-white/10 mb-4 shadow-inner relative overflow-hidden group">
                        <div className="flex justify-between text-[10px] text-slate-500 font-mono font-bold tracking-widest mb-3">
                            <span>VISIBLE SPECTRUM</span>
                            <span>TARGET: 550nm</span>
                        </div>

                        <div className="w-full h-12 rounded bg-gradient-to-r from-blue-900 via-green-500 to-yellow-600 relative overflow-hidden opacity-80">
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                            {/* Scanline effect */}
                            <div className="absolute inset-0 bg-white/20 w-[2px] h-full shadow-[0_0_15px_white] animate-[fastScan_2s_linear_infinite]" />
                        </div>

                        <div className="flex justify-between mt-4 font-mono">
                            <div className="text-left">
                                <div className="text-white text-xs font-bold uppercase">Rod Cells</div>
                                <div className="text-[10px] text-slate-500 uppercase">High Contrast</div>
                            </div>
                            <div className="text-right">
                                <div className="text-white text-xs font-bold uppercase">3-40kHz</div>
                                <div className="text-[10px] text-slate-500 uppercase">Ultrasonic</div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "ADAPTIVE AI",
            icon: Activity,
            content: (
                <div className="space-y-6 w-full text-left">
                    <p className="text-center text-slate-400 text-xs font-mono mb-2 uppercase tracking-wide">
                        System adapts to subject complexity in real-time.
                    </p>
                    <div className="flex flex-col gap-3">
                        <EraRow name="Fearful" req="< 30%" prey="Slow" desc="Prey freezes to build confidence." active={true} />
                        <EraRow name="Balanced" req="30-70%" prey="Normal" desc="Standard hunting experience." active={true} />
                        <EraRow name="Apex" req="> 70%" prey="Hyper" desc="Evasive prey for experts." active={true} />
                    </div>

                    <div className="p-4 bg-[#1a1a2e]/50 rounded-xl border border-white/10 text-[10px] text-slate-400 font-mono">
                        <span className="text-purple-400 font-bold block mb-2 uppercase tracking-wider">ALGORITHM:</span>
                        <ul className="space-y-1.5 pl-2 border-l border-purple-500/30 uppercase">
                            <li>Success → <span className="text-slate-300">Confidence DROPS (Harder)</span></li>
                            <li>Failure → <span className="text-slate-300">Confidence RISES (Easier)</span></li>
                        </ul>
                    </div>
                </div>
            )
        },
        {
            title: "SAFE EXIT",
            icon: Shield,
            content: (
                <div className="flex flex-col items-center w-full">
                    <p className="mb-8 text-center text-slate-400 text-xs font-mono max-w-xs uppercase tracking-wide">
                        Cat-proof mechanism. Taps are ignored. Secure slider required for exit.
                    </p>

                    {/* Slider Demo Visualization */}
                    <div className="relative w-72 h-20 bg-[#0a0a12] rounded-full border border-white/10 flex items-center px-3 mb-6 shadow-[inset_0_2px_20px_rgba(0,0,0,0.8)] overflow-hidden">

                        {/* Track Decor */}
                        <div className="absolute inset-x-12 h-1 bg-white/5 rounded-full" />

                        {/* Text Hint */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-[10px] font-black tracking-[0.2em] text-white/10 uppercase animate-pulse">
                                Slide to Unlock
                            </span>
                        </div>

                        {/* Knob Knob */}
                        <div className="w-14 h-14 bg-gradient-to-br from-white to-slate-400 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.2)] relative z-10 flex items-center justify-center">
                            <Shield size={20} className="text-black opacity-50" />
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "RECORDS & RANK",
            icon: Trophy,
            content: (
                <div className="space-y-6 w-full text-left">
                    <p className="text-center text-slate-400 text-xs font-mono mb-2 uppercase tracking-wide">
                        Compete for apex predator status across 16 ecosystems.
                    </p>

                    <div className="p-4 bg-[#1a1a2e]/50 rounded-xl border border-white/10 flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-yellow-500/20 flex items-center justify-center text-yellow-500 font-black">S</div>
                            <div className="text-[10px] text-slate-400 uppercase">
                                <span className="text-white font-bold block tracking-wider">Legendary Hunter</span>
                                Reflex score 90+
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-slate-500/20 flex items-center justify-center text-slate-400 font-bold">A</div>
                            <div className="text-[10px] text-slate-500 uppercase">
                                <span className="text-slate-300 font-bold block tracking-wider">Master Hunter</span>
                                Reflex score 70-90
                            </div>
                        </div>
                    </div>

                    <div className="text-center">
                        <div className="text-[10px] text-purple-400 font-black tracking-widest uppercase mb-2">New Modes</div>
                        <div className="grid grid-cols-4 gap-2 text-[9px] font-mono text-slate-500 text-center uppercase font-bold">
                            <div className="bg-white/5 p-1 rounded">Mouse</div>
                            <div className="bg-white/5 p-1 rounded">Fly</div>
                            <div className="bg-white/5 p-1 rounded">Worm</div>
                            <div className="bg-white/5 p-1 rounded">Pointer</div>
                            <div className="bg-white/5 p-1 rounded">Snake</div>
                            <div className="bg-white/5 p-1 rounded">Circuit</div>
                            <div className="bg-white/5 p-1 rounded">Arena</div>
                            <div className="bg-white/5 p-1 rounded">Favorites</div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "AUTONOMOUS",
            icon: Brain,
            content: (
                <div className="flex flex-col items-center w-full">
                    <p className="text-center text-slate-400 text-xs font-mono mb-6 uppercase tracking-wide">
                        Energy management system for unattended sessions.
                    </p>

                    <div className="w-full bg-[#1a1a2e] rounded-xl p-6 border border-white/10 mb-4 shadow-xl relative overflow-hidden">
                        {/* Status Light */}
                        <div className="absolute top-4 right-4 w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]" />

                        <div className="space-y-6">
                            <div className="text-left">
                                <h4 className="text-[10px] font-bold text-white uppercase tracking-widest mb-2 font-mono">Cycle Logic</h4>
                                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono uppercase">
                                    <span className="text-purple-400">HUNT (3m)</span>
                                    <span>→</span>
                                    <span className="text-slate-500">REST (10m)</span>
                                    <span>→</span>
                                    <span className="text-purple-400">REPEAT</span>
                                </div>
                            </div>
                        </div>
                    </div>
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

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 300 : -300,
            opacity: 0,
            scale: 0.95
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 300 : -300,
            opacity: 0,
            scale: 0.95
        })
    };

    const CurrentIcon = pages[page].icon;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#050508]/95 backdrop-blur-3xl z-50 flex flex-col items-center justify-center p-6 overflow-hidden"
        >
            {/* Background Atmosphere */}
            <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full" />
            </div>

            {/* SCALING WRAPPER */}
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="w-full max-w-sm bg-[#0f0f13] border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl z-10"
            >
                <CloseButton />

                {/* Header */}
                <div className="flex justify-between items-center mb-8 pr-12">
                    <h2 className="text-white font-black text-2xl tracking-tighter uppercase flex items-center gap-3 italic">
                        <div className="p-2.5 bg-white/5 rounded-xl border border-white/5 text-purple-400">
                            <CurrentIcon className="w-6 h-6" />
                        </div>
                        {pages[page].title}
                    </h2>
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

                    {/* Indicators Centered */}
                    <div className="flex gap-2">
                        {pages.map((_, i) => (
                            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === page ? 'bg-white w-6' : 'bg-white/10 w-1.5'}`} />
                        ))}
                    </div>

                    {page < pages.length - 1 ? (
                        <button onClick={() => paginate(1)} className="text-purple-400 hover:text-white uppercase text-xs font-bold tracking-widest transition-colors">Next</button>
                    ) : (
                        <button onClick={onClose} className="text-pink-400 hover:text-white uppercase text-xs font-bold tracking-widest transition-colors">Close</button>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

const EraRow: React.FC<{ name: string, req: string, prey: string, desc: string, active: boolean }> = ({ name, req, prey, desc, active }) => (
    <div className={`flex justify-between items-center p-4 rounded-xl border border-white/5 ${active ? 'bg-[#2a2a40]/50' : 'opacity-60 grayscale'}`}>
        <div>
            <div className={`text-xs font-bold uppercase tracking-wider ${active ? 'text-white' : 'text-slate-400'}`}>{name}</div>
            <div className="text-[10px] text-purple-400 font-bold tracking-wider mt-0.5">{req}</div>
        </div>
        <div className="text-right">
            <div className="text-sm font-bold text-slate-200 uppercase">{prey}</div>
            <div className="text-[9px] text-slate-500 uppercase tracking-widest">{desc}</div>
        </div>
    </div>
);
