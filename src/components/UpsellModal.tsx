import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { billingService } from '../services/GoogleBillingService';


interface UpsellModalProps {
    onClose: () => void;
    onUnlock: () => void;
    triggerSource?: 'cooldown' | 'manual';
}

export const UpsellModal: React.FC<UpsellModalProps> = ({ onClose, onUnlock, triggerSource = 'cooldown' }) => {
    const [loading, setLoading] = useState(false);
    const [price, setPrice] = useState<string>("Loading...");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const init = async () => {
            await billingService.initialize();
            const details = await billingService.getProductDetails();
            if (details) {
                setPrice(details.price.value + " " + details.price.currency);
            } else {
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
                onUnlock();
                onClose();
            } else {
                setLoading(false);
            }
        } catch (err) {
            console.error(err);
            setError("Connection failed. Try again.");
            setLoading(false);
        }
    };

    const isManual = triggerSource === 'manual';

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] flex items-center justify-center p-6 bg-[#050510]/95 backdrop-blur-xl" // Darker overlay
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 50 }}
                className="bg-black/80 border border-amber-500/30 rounded-3xl p-6 w-full max-w-sm shadow-[0_0_50px_rgba(245,158,11,0.2)] overflow-hidden relative"
                onClick={e => e.stopPropagation()}
            >
                {/* Visual Flair */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50" />

                <div className="relative z-10 text-center">
                    <div className="text-5xl mb-4 grayscale hover:grayscale-0 transition-all drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">👑</div>

                    <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-amber-200 to-amber-600 uppercase tracking-tighter mb-2">
                        {isManual ? 'Go Premium' : 'Limit Reached'}
                    </h2>

                    <p className="text-slate-400 text-xs mb-6 px-4">
                        {isManual
                            ? "Unlock the ultimate experience for your pet. No subscriptions, just full access forever."
                            : "To protect your cat's eyes, we limit sessions. Unlock Premium to override these limits."}
                    </p>

                    <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl p-4 mb-6 text-left space-y-3 border border-white/5">
                        <FeatureItem icon="∞" title="Unlimited Playtime" desc="No more cooldowns or waiting." />
                        <FeatureItem icon="🔄" title="Auto-Loop Mode" desc="Keep the screen active all day." />
                        <FeatureItem icon="📊" title="Lifetime Stats" desc="Track your cat's hunting skills." />
                        <FeatureItem icon="🩺" title="Vet Control" desc="Customize play/rest cycles." />
                    </div>

                    {error && (
                        <div className="text-red-400 text-xs font-bold mb-4 bg-red-900/20 p-2 rounded border border-red-500/30">
                            ⚠️ {error}
                        </div>
                    )}

                    <div className="space-y-3">
                        <button
                            onClick={handlePurchase}
                            disabled={loading}
                            className={`group w-full bg-gradient-to-r from-amber-300 via-amber-500 to-amber-600 text-black font-black py-4 rounded-xl uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(251,191,36,0.4)] hover:shadow-[0_0_30px_rgba(251,191,36,0.6)] hover:scale-[1.02] transition-all flex justify-center items-center gap-2 ${loading ? 'opacity-50 cursor-wait' : ''}`}
                        >
                            {loading ? (
                                <span>CONNECTING...</span>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <span className="text-xs font-bold">UNLOCK LIFETIME ACCESS</span>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[10px] line-through opacity-60">€9.99</span>
                                        <span className="bg-black/30 px-1.5 py-0.5 rounded text-xs text-white border border-black/10 font-black">{price}</span>
                                    </div>
                                </div>
                            )}
                        </button>

                        <div className="text-[10px] text-amber-500/50 font-bold uppercase tracking-widest">
                            One-time payment • No Monthly Fees
                        </div>

                        {!isManual && (
                            <button
                                onClick={onClose}
                                className="text-slate-600 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors mt-4 border-b border-transparent hover:border-white/50 pb-0.5"
                            >
                                I'll Wait for Cooldown
                            </button>
                        )}
                        {isManual && (
                            <button
                                onClick={onClose}
                                className="text-slate-600 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors mt-4"
                            >
                                Not Now
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

const FeatureItem = ({ icon, title, desc }: { icon: string, title: string, desc: string }) => (
    <div className="flex items-center gap-3">
        <span className="text-lg w-6 text-center text-amber-400">{icon}</span>
        <div>
            <h4 className="font-bold text-gray-200 text-xs uppercase">{title}</h4>
            <p className="text-[9px] text-gray-500">{desc}</p>
        </div>
    </div>
);
