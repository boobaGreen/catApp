import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { billingService } from '../services/GoogleBillingService';


interface UpsellModalProps {
    onClose: () => void;
    onUnlock: () => void;
}

export const UpsellModal: React.FC<UpsellModalProps> = ({ onClose, onUnlock }) => {
    const [loading, setLoading] = useState(false);
    const [price, setPrice] = useState<string>("Loading...");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Init service and fetch price
        const init = async () => {
            await billingService.initialize();
            const details = await billingService.getProductDetails();
            if (details) {
                setPrice(details.price.value + " " + details.price.currency);
            } else {
                // Determine price based on strategy (Anchor vs Promo)
                // Fallback for UI if API fails
                setPrice("€1.99");
            }
        };
        init();
    }, []);

    const handlePurchase = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await billingService.purchasePremium();
            if (result.success) {
                // Success!
                onUnlock();
                onClose();
            } else {
                // Cancelled or Failed
                // Don't show error if just cancelled
                setLoading(false);
            }
        } catch (err) {
            console.error(err);
            setError("Connection failed. Try again.");
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] flex items-center justify-center p-6 bg-[#0a0a12]/90 backdrop-blur-md"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 50 }}
                className="bg-[#1a1a2e] border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl overflow-hidden relative"
                onClick={e => e.stopPropagation()}
            >
                {/* Background Glow */}
                <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-br from-purple-500/10 to-transparent animate-spin-slow pointer-events-none" />

                <div className="relative z-10 text-center">
                    <div className="text-4xl mb-4 grayscale hover:grayscale-0 transition-all">🧬</div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">
                        Ethological Limit Reached
                    </h2>
                    <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                        To prevent overstimulation, we act like nature: <br />
                        <span className="text-purple-400 font-bold">Hunt ➔ Rest ➔ Repeat.</span>
                    </p>

                    <div className="bg-[#0a0a12]/50 rounded-xl p-4 mb-6 text-left space-y-3 border border-white/5 shadow-inner">
                        <div className="flex items-center gap-3">
                            <span className="text-xl">🩺</span>
                            <div>
                                <h4 className="font-bold text-white text-xs uppercase">Veterinary Control</h4>
                                <p className="text-[10px] text-slate-500">Override session structure manually.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xl">🏃</span>
                            <div>
                                <h4 className="font-bold text-white text-xs uppercase">Endless Stamina</h4>
                                <p className="text-[10px] text-slate-500">Play without mandatory cooldowns.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xl">📊</span>
                            <div>
                                <h4 className="font-bold text-white text-xs uppercase">Lifetime Stats</h4>
                                <p className="text-[10px] text-slate-500">Track prey preference and skill.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xl">🔄</span>
                            <div>
                                <h4 className="font-bold text-white text-xs uppercase">Auto-Play Loop</h4>
                                <p className="text-[10px] text-slate-500">Continuous Play/Rest cycle. Screen stays on.</p>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-400 text-xs font-bold mb-4 bg-red-900/20 p-2 rounded">
                            ⚠️ {error}
                        </div>
                    )}

                    <div className="space-y-3">
                        <button
                            onClick={handlePurchase}
                            disabled={loading}
                            className={`w-full bg-gradient-to-r from-amber-400 to-orange-500 text-black font-black py-4 rounded-xl uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(251,191,36,0.4)] hover:scale-105 transition-transform flex justify-center items-center gap-2 ${loading ? 'opacity-50 cursor-wait' : ''}`}
                        >
                            {loading ? (
                                <span>CONNECTING...</span>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <span className="text-[10px] leading-tight text-center max-w-[200px] normal-case font-bold">Unlock Unlimited Bio-Rhythm & Auto-Loop for All-Day Pet Care</span>
                                    <span className="bg-black/20 px-2 py-0.5 rounded text-[10px] text-white/90 mt-1">{price}</span>
                                </div>
                            )}
                        </button>

                        {/* Anchor Pricing Display */}
                        {!loading && (
                            <div className="text-[10px] text-slate-600 line-through decoration-red-500/50 decoration-2">
                                Regular Price: €9.99
                            </div>
                        )}

                        <button
                            onClick={onClose}
                            className="text-slate-500 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors mt-2"
                        >
                            Wait for Cooldown
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};
