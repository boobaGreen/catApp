import React from 'react';
import { motion } from 'framer-motion';
import { Button } from './UI/Button';
import { StatsManager } from '../engine/StatsManager';

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
    const [isPremium, setIsPremium] = React.useState(false);

    // Pro Settings State
    const [playDuration, setPlayDuration] = React.useState(() => {
        const stored = localStorage.getItem('cat_engage_play_duration');
        // Default: Infinity for Pro (0 or -1), 90s for free logic handled elsewhere
        // Let's store minutes. 0 = Infinite.
        return stored ? parseInt(stored) : 0;
    });

    const [cooldownDuration, setCooldownDuration] = React.useState(() => {
        const stored = localStorage.getItem('cat_engage_cooldown_duration');
        // Default: 5 min for free users (handled elsewhere). 
        // For Pro, default to 0 (No cooldown).
        return stored ? parseInt(stored) : 0;
    });

    React.useEffect(() => {
        setIsPremium(localStorage.getItem('isPremium') === 'true');
    }, []);

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

    const handleResetStats = () => {
        if (confirm('Are you sure you want to reset all stats?')) {
            const manager = new StatsManager();
            manager.reset();
            alert('Stats reset!');
        }
    };

    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="absolute inset-0 bg-[#0a0a12]/95 backdrop-blur-xl z-20 flex flex-col items-center justify-start p-8 text-white font-sans overflow-y-auto"
        >
            <h2 className="text-4xl font-black mb-8 text-white uppercase tracking-tighter mt-12 drop-shadow-lg">
                <span className="text-purple-400">Settings</span>
            </h2>

            <div className="flex flex-col space-y-6 w-full max-w-sm mb-12 relative z-10">

                {/* --- BASIC SETTINGS (FREE) --- */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Basic Controls</h3>

                    {/* Audio Toggle */}
                    <div className="flex items-center justify-between bg-[#1a1a2e] p-4 rounded-xl border border-white/10 hover:border-purple-500/30 transition-colors">
                        <span className="font-bold uppercase tracking-widest text-sm text-slate-300">Audio</span>
                        <button
                            onClick={onToggleAudio}
                            className={`w-14 h-8 rounded-full p-1 transition-all duration-300 shadow-inner ${audioEnabled ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-slate-700'}`}
                        >
                            <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${audioEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    {/* Haptics Toggle */}
                    <div className="flex items-center justify-between bg-[#1a1a2e] p-4 rounded-xl border border-white/10 hover:border-purple-500/30 transition-colors">
                        <span className="font-bold uppercase tracking-widest text-sm text-slate-300">Vibration</span>
                        <button
                            onClick={onToggleHaptics}
                            className={`w-14 h-8 rounded-full p-1 transition-all duration-300 shadow-inner ${hapticsEnabled ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-slate-700'}`}
                        >
                            <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${hapticsEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>
                </div>

                {/* --- VETERINARY CONTROLS (PRO) --- */}
                <div className={`space-y-4 relative ${!isPremium ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                    <div className="flex justify-between items-end">
                        <h3 className="text-xs font-bold text-purple-400 uppercase tracking-widest ml-1">Veterinary Controls {isPremium ? '💎' : '🔒'}</h3>
                        {!isPremium && <span className="text-[10px] text-amber-500 font-bold uppercase">Pro Only</span>}
                    </div>

                    {/* Session Duration Slider */}
                    <div className="bg-[#1a1a2e] p-4 rounded-xl border border-white/10 hover:border-purple-500/30 transition-colors">
                        <div className="flex justify-between mb-2">
                            <span className="font-bold uppercase tracking-widest text-xs text-slate-300">Play Duration (Auto-Loop)</span>
                            <span className="font-bold text-purple-400 text-xs">{playDuration === 0 ? 'UNLIMITED' : `${playDuration} min`}</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="20"
                            step="1"
                            value={playDuration}
                            onChange={handlePlayChange}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                        />
                        <div className="flex justify-between mt-1 text-[10px] text-slate-500 font-mono">
                            <span>∞</span>
                            <span>20m</span>
                        </div>
                    </div>

                    {/* Cooldown Duration Slider */}
                    <div className="bg-[#1a1a2e] p-4 rounded-xl border border-white/10 hover:border-purple-500/30 transition-colors">
                        <div className="flex justify-between mb-2">
                            <span className="font-bold uppercase tracking-widest text-xs text-slate-300">Cool-down Timer</span>
                            <span className="font-bold text-pink-400 text-xs">{cooldownDuration} min</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="30"
                            step="1"
                            value={cooldownDuration}
                            onChange={handleCooldownChange}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                        />
                        <div className="flex justify-between mt-1 text-[10px] text-slate-500 font-mono">
                            <span>0m</span>
                            <span>30m</span>
                        </div>
                    </div>
                </div>

                {/* Reset Stats */}
                <button
                    onClick={handleResetStats}
                    className="mt-4 text-red-400/50 hover:text-red-400 text-xs uppercase tracking-[0.2em] font-bold transition-colors py-4 border-t border-white/5"
                >
                    Reset All Stats
                </button>

            </div>

            <div className="relative z-10 w-full max-w-sm">
                <Button onClick={onBack} variant="secondary" className="w-full">Back to Menu</Button>
            </div>

            <div className="absolute bottom-4 text-[10px] text-slate-600 uppercase tracking-widest">
                CatEngage v2.1
            </div>
        </motion.div>
    );
};
