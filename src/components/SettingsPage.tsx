import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Smartphone, RotateCcw, Monitor, Clock, ShieldAlert, Sparkles, X, ShoppingBag, Check } from 'lucide-react';
import { useCatProfiles } from '../hooks/useCatProfiles';

interface SettingsPageProps {
    audioEnabled: boolean;
    hapticsEnabled: boolean;
    onToggleAudio: () => void;
    onToggleHaptics: () => void;
    onBack: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
    audioEnabled,
    hapticsEnabled,
    onToggleAudio,
    onToggleHaptics,
    onBack
}) => {
    // Global State
    const { isPremium, restorePurchases } = useCatProfiles();

    // Local UI State
    const [restoreStatus, setRestoreStatus] = useState<'idle' | 'loading' | 'success' | 'none'>('idle');

    // Pro Settings State
    const [playDuration, setPlayDuration] = React.useState(() => {
        const stored = localStorage.getItem('cat_engage_play_duration');
        return stored ? parseInt(stored) : 0;
    });

    const [cooldownDuration, setCooldownDuration] = React.useState(() => {
        const stored = localStorage.getItem('cat_engage_cooldown_duration');
        return stored ? parseInt(stored) : 0;
    });

    const saveSettings = (key: string, value: number) => {
        localStorage.setItem(key, value.toString());
    };

    const handlePlayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value);
        setPlayDuration(val);
        saveSettings('cat_engage_play_duration', val);
    };

    const handleCooldownChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value);
        setCooldownDuration(val);
        saveSettings('cat_engage_cooldown_duration', val);
    };

    const handleRestore = async () => {
        setRestoreStatus('loading');
        try {
            const success = await restorePurchases();
            setRestoreStatus(success ? 'success' : 'none');

            // Reset status after a moment
            setTimeout(() => setRestoreStatus('idle'), 3000);
        } catch (e) {
            console.error(e);
            setRestoreStatus('none');
            setTimeout(() => setRestoreStatus('idle'), 3000);
        }
    };

    const handleResetStats = () => {
        if (confirm('Are you sure you want to reset all stats?')) {
            localStorage.removeItem('cat_engage_profiles');
            localStorage.removeItem('cat_engage_active_profile_id');
            location.reload();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="fixed inset-0 bg-[#050508]/95 backdrop-blur-3xl z-[60] flex flex-col overflow-hidden text-white"
        >
            {/* Background Atmosphere */}
            <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[100px] rounded-full" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-900/10 blur-[100px] rounded-full" />
            </div>

            {/* Header */}
            <div className="relative z-10 p-6 md:p-8 flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter italic">Settings</h2>
                    <p className="text-xs text-slate-400 font-mono uppercase tracking-widest mt-1">System Configuration</p>
                </div>
                <button
                    onClick={onBack}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/10 group"
                >
                    <X className="w-6 h-6 text-slate-300 group-hover:text-white group-hover:rotate-90 transition-transform duration-300" />
                </button>
            </div>

            <div className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8 pt-0 custom-scrollbar">
                <div className="max-w-2xl mx-auto space-y-8 pb-24">

                    {/* --- SENSORY CONTROLS --- */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles size={14} className="text-purple-400" />
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Immersion</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Audio Toggle */}
                            <button
                                onClick={onToggleAudio}
                                className={`
                                    relative p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between group overflow-hidden
                                    ${audioEnabled
                                        ? 'bg-gradient-to-br from-indigo-900/40 to-indigo-900/10 border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.1)]'
                                        : 'bg-white/5 border-white/5 hover:bg-white/10'}
                                `}
                            >
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className={`p-3 rounded-full ${audioEnabled ? 'bg-indigo-500 text-white' : 'bg-white/10 text-slate-400'} transition-colors`}>
                                        {audioEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                                    </div>
                                    <div className="text-left">
                                        <div className={`text-sm font-bold uppercase tracking-wider ${audioEnabled ? 'text-white' : 'text-slate-400'}`}>Sound FX</div>
                                        <div className="text-[10px] text-slate-500">{audioEnabled ? 'Enabled' : 'Muted'}</div>
                                    </div>
                                </div>
                                {audioEnabled && <div className="absolute inset-0 bg-indigo-500/5 animate-pulse" />}
                            </button>

                            {/* Haptics Toggle */}
                            <button
                                onClick={onToggleHaptics}
                                className={`
                                    relative p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between group overflow-hidden
                                    ${hapticsEnabled
                                        ? 'bg-gradient-to-br from-purple-900/40 to-purple-900/10 border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.1)]'
                                        : 'bg-white/5 border-white/5 hover:bg-white/10'}
                                `}
                            >
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className={`p-3 rounded-full ${hapticsEnabled ? 'bg-purple-500 text-white' : 'bg-white/10 text-slate-400'} transition-colors`}>
                                        <Smartphone size={20} />
                                    </div>
                                    <div className="text-left">
                                        <div className={`text-sm font-bold uppercase tracking-wider ${hapticsEnabled ? 'text-white' : 'text-slate-400'}`}>Haptics</div>
                                        <div className="text-[10px] text-slate-500">{hapticsEnabled ? 'Enabled' : 'Disabled'}</div>
                                    </div>
                                </div>
                                {hapticsEnabled && <div className="absolute inset-0 bg-purple-500/5 animate-pulse" />}
                            </button>
                        </div>
                    </div>

                    {/* --- AUTOMATED SYSTEMS (PRO) --- */}
                    <div className={`space-y-4 relative transition-opacity duration-300 ${!isPremium ? 'opacity-60 grayscale' : 'opacity-100'}`}>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Monitor size={14} className="text-purple-400" />
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Automation</h3>
                            </div>
                            {!isPremium && <span className="text-[10px] bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded uppercase font-bold tracking-wider">Pro Locked</span>}
                        </div>

                        {/* Play Duration */}
                        <div className="bg-[#12121a] p-6 rounded-3xl border border-white/5 relative overflow-hidden group">
                            {!isPremium && <div className="absolute inset-0 z-20 bg-transparent cursor-not-allowed" />}

                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><Clock size={16} /></div>
                                    <div>
                                        <div className="text-xs font-bold text-white uppercase tracking-wider">Session Length</div>
                                        <div className="text-[10px] text-slate-500">Auto-stop active play</div>
                                    </div>
                                </div>
                                <div className="text-lg font-black font-mono text-blue-400">
                                    {playDuration === 0 ? '∞' : `${playDuration}m`}
                                </div>
                            </div>

                            <input
                                type="range"
                                min="0"
                                max="20"
                                step="1"
                                disabled={!isPremium}
                                value={playDuration}
                                onChange={handlePlayChange}
                                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
                            />
                            <div className="flex justify-between mt-2 text-[9px] text-slate-600 font-bold uppercase tracking-widest">
                                <span>Infinite</span>
                                <span>20 Mins</span>
                            </div>
                        </div>

                        {/* Cooldown Duration */}
                        <div className="bg-[#12121a] p-6 rounded-3xl border border-white/5 relative overflow-hidden group">
                            {!isPremium && <div className="absolute inset-0 z-20 bg-transparent cursor-not-allowed" />}

                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-pink-500/10 rounded-lg text-pink-400"><RotateCcw size={16} /></div>
                                    <div>
                                        <div className="text-xs font-bold text-white uppercase tracking-wider">Rest Period</div>
                                        <div className="text-[10px] text-slate-500">Minimum delay between sessions</div>
                                    </div>
                                </div>
                                <div className="text-lg font-black font-mono text-pink-400">
                                    {cooldownDuration}m
                                </div>
                            </div>

                            <input
                                type="range"
                                min="0"
                                max="30"
                                step="1"
                                disabled={!isPremium}
                                value={cooldownDuration}
                                onChange={handleCooldownChange}
                                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-500 hover:accent-pink-400 transition-all"
                            />
                            <div className="flex justify-between mt-2 text-[9px] text-slate-600 font-bold uppercase tracking-widest">
                                <span>Instant</span>
                                <span>30 Mins</span>
                            </div>
                        </div>
                    </div>

                    {/* --- ACCOUNT / BILLING --- */}
                    <div className="pt-8 border-t border-white/5">
                        <div className="flex items-center gap-2 mb-4">
                            <ShoppingBag size={14} className="text-slate-400" />
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Account</h3>
                        </div>

                        <button
                            onClick={handleRestore}
                            disabled={restoreStatus === 'loading' || isPremium}
                            className={`w-full py-4 rounded-xl border transition-all text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2
                                ${isPremium
                                    ? 'bg-green-500/10 border-green-500/30 text-green-400 cursor-default'
                                    : 'border-white/10 text-slate-300 hover:bg-white/5'
                                }
                            `}
                        >
                            {restoreStatus === 'loading' ? (
                                <span className="animate-pulse">Connecting...</span>
                            ) : isPremium ? (
                                <>
                                    <Check size={14} />
                                    Premium Active
                                </>
                            ) : restoreStatus === 'success' ? (
                                <>
                                    <Check size={14} />
                                    Restored!
                                </>
                            ) : restoreStatus === 'none' ? (
                                'No Purchases Found'
                            ) : (
                                'Restore Purchases'
                            )}
                        </button>
                    </div>

                    {/* --- DANGER ZONE --- */}
                    <div className="pt-8 border-t border-white/5">
                        <div className="flex items-center gap-2 mb-4">
                            <ShieldAlert size={14} className="text-red-900" />
                            <h3 className="text-xs font-bold text-red-900/50 uppercase tracking-widest">Danger Zone</h3>
                        </div>
                        <button
                            onClick={handleResetStats}
                            className="w-full py-4 rounded-xl border border-red-900/20 text-red-700/50 hover:bg-red-900/10 hover:text-red-500 hover:border-red-500/30 transition-all text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                            <RotateCcw size={14} />
                            Reset All Game Data
                        </button>
                    </div>

                    <div className="text-center">
                        <p className="text-[10px] text-slate-700 font-mono uppercase tracking-widest">
                            CatEngage v2.1 • Felis Apex Hunter
                        </p>
                    </div>

                </div>
            </div>
        </motion.div>
    );
};
