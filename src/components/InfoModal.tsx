import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface InfoModalProps {
    onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ onClose }) => {
    const [page, setPage] = useState(0);

    const pages = [
        {
            title: "ETHOLOGY",
            icon: "🧠",
            content: (
                <div className="flex flex-col items-center w-full">
                    <p className="text-center text-gray-400 text-xs md:text-base leading-relaxed italic mb-6">
                        "Engineered to stimulate Felis Catus predatory instincts using specific light spectrums and ultrasonic triggers."
                    </p>

                    {/* Professional Spectrum Visualizer */}
                    <div className="w-full bg-white/5 rounded-xl p-4 border border-white/10 mb-2">
                        <div className="flex justify-between text-[10px] md:text-xs text-gray-500 font-bold tracking-widest mb-2">
                            <span>VISIBLE SPECTRUM</span>
                            <span>TARGET: 450-550nm</span>
                        </div>
                        <div className="w-full h-8 md:h-12 rounded-lg bg-gradient-to-r from-blue-600 via-green-500 to-yellow-400 relative overflow-hidden">
                            {/* Scanline effect */}
                            <div className="absolute inset-0 bg-white/10 w-[10%] skew-x-12 animate-[spin_2s_linear_infinite]" style={{ animation: 'scan 2s linear infinite' }} />
                        </div>
                        <div className="flex justify-between mt-2">
                            <div className="text-center">
                                <div className="text-cat-blue text-xs md:text-sm font-bold">Rod Cells</div>
                                <div className="text-[9px] md:text-xs text-gray-500">High Contrast</div>
                            </div>
                            <div className="text-center">
                                <div className="text-cat-lime text-xs md:text-sm font-bold">3-8kHz</div>
                                <div className="text-[9px] md:text-xs text-gray-500">Ultrasonic Pulse</div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "THE ERAS",
            icon: "🧬",
            content: (
                <div className="space-y-3 w-full text-left">
                    <EraRow name="I. Awakening" req="0 Kills" prey="🐭" desc="Slow & Simple" active={true} />
                    <EraRow name="II. Precision" req="50 Kills" prey="🐭 🪱" desc="Small Targets" active={true} />
                    <EraRow name="III. The Hunt" req="250 Kills" prey="🦟 🪱 🐭" desc="Fast & Erratic" active={true} />
                    <EraRow name="IV. Apex" req="1000 Kills" prey="🦁" desc="Adaptive AI" active={false} />
                </div>
            )
        },
        {
            title: "CAT-PROOF",
            icon: "🛡️",
            content: (
                <div className="flex flex-col items-center">
                    <p className="mb-4 text-center text-gray-300 text-sm md:text-base">To exit a game session, you must perform a deliberate action:</p>
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white/20 relative flex items-center justify-center mb-2 animate-pulse">
                        <div className="absolute inset-0 border-4 border-t-cat-lime rounded-full animate-spin"></div>
                        <span className="text-2xl md:text-4xl font-bold text-white">2s</span>
                    </div>
                    <p className="font-bold text-cat-lime uppercase tracking-widest text-xs md:text-sm">Hold Exit Button</p>
                </div>
            )
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6"
        >
            {/* SCALING WRAPPER: Matches MainMenu scaling strategy */}
            <div className="w-full max-w-sm bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden transform transition-transform duration-300 md:scale-[1.7] lg:scale-[1.0]">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-white font-black text-2xl tracking-tighter uppercase flex items-center gap-2">
                        <span>{pages[page].icon}</span>
                        {pages[page].title}
                    </h2>
                    <div className="flex gap-1">
                        {pages.map((_, i) => (
                            <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === page ? 'bg-white' : 'bg-white/20'}`} />
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="h-64 flex items-center justify-center"> {/* Increased height for graphics */}
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={page}
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -50, opacity: 0 }}
                            className="w-full"
                        >
                            {pages[page].content}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Controls */}
                <div className="flex justify-between items-center mt-6">
                    {page > 0 ? (
                        <button onClick={() => setPage(p => p - 1)} className="text-gray-400 hover:text-white uppercase text-xs font-bold tracking-widest">Prev</button>
                    ) : (
                        <div />
                    )}

                    {page < pages.length - 1 ? (
                        <button onClick={() => setPage(p => p + 1)} className="text-cat-blue hover:text-white uppercase text-xs font-bold tracking-widest">Next</button>
                    ) : (
                        <button onClick={onClose} className="text-cat-lime hover:text-white uppercase text-xs font-bold tracking-widest">Close</button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const EraRow: React.FC<{ name: string, req: string, prey: string, desc: string, active: boolean }> = ({ name, req, prey, desc, active }) => (
    <div className={`flex justify-between items-center p-3 rounded-lg border border-white/5 ${active ? 'bg-white/5' : 'opacity-30 grayscale'}`}>
        <div>
            <div className={`text-xs font-bold uppercase ${active ? 'text-white' : 'text-gray-500'}`}>{name}</div>
            <div className="text-[10px] text-cat-blue font-bold tracking-wider">{req}</div>
        </div>
        <div className="text-right">
            <div className="text-lg">{prey}</div>
            <div className="text-[9px] text-gray-400 uppercase">{desc}</div>
        </div>
    </div>
);
