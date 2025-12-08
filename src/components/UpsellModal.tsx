import React from 'react';
import { motion } from 'framer-motion';


interface UpsellModalProps {
    onClose: () => void;
    onUnlock: () => void;
}

export const UpsellModal: React.FC<UpsellModalProps> = ({ onClose, onUnlock }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 50 }}
                className="bg-gray-900 border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl overflow-hidden relative"
                onClick={e => e.stopPropagation()}
            >
                {/* Background Glow */}
                <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-br from-yellow-400/10 to-transparent animate-spin-slow pointer-events-none" />

                <div className="relative z-10 text-center">
                    <div className="text-4xl mb-4">🧬</div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">
                        Ethological Limit Reached
                    </h2>
                    <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                        To prevent overstimulation, we act like nature: <br />
                        <span className="text-cat-lime font-bold">Hunt ➔ Rest ➔ Repeat.</span>
                    </p>

                    <div className="bg-white/5 rounded-xl p-4 mb-6 text-left space-y-3">
                        <div className="flex items-center gap-3">
                            <span className="text-xl">🩺</span>
                            <div>
                                <h4 className="font-bold text-white text-xs uppercase">Veterinary Control</h4>
                                <p className="text-[10px] text-gray-500">Override session structure manually.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xl">🏃</span>
                            <div>
                                <h4 className="font-bold text-white text-xs uppercase">Endless Stamina</h4>
                                <p className="text-[10px] text-gray-500">Play without mandatory cooldowns.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xl">📊</span>
                            <div>
                                <h4 className="font-bold text-white text-xs uppercase">Lifetime Stats</h4>
                                <p className="text-[10px] text-gray-500">Track prey preference and skill.</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={onUnlock}
                            className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-black py-4 rounded-xl uppercase tracking-widest text-sm shadow-lg hover:scale-105 transition-transform"
                        >
                            Unlock Pro Controls 💎
                        </button>
                        <button
                            onClick={onClose}
                            className="text-gray-500 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors"
                        >
                            Wait for Cooldown
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};
