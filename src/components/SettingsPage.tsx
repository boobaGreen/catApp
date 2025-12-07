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
    const handleResetStats = () => {
        if (confirm('Sei sicuro di voler resettare tutte le statistiche?')) {
            const manager = new StatsManager();
            manager.reset();
            alert('Statistiche resettate!');
        }
    };

    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="absolute inset-0 bg-black/90 backdrop-blur-xl z-20 flex flex-col items-center justify-center p-8 text-white font-sans"
        >
            <h2 className="text-4xl font-black mb-12 text-white uppercase tracking-tighter">Settings</h2>

            <div className="flex flex-col space-y-6 w-full max-w-xs mb-12">

                {/* Audio Toggle */}
                <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10">
                    <span className="font-bold uppercase tracking-widest text-sm text-gray-300">Audio</span>
                    <button
                        onClick={onToggleAudio}
                        className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${audioEnabled ? 'bg-cat-blue' : 'bg-gray-700'}`}
                    >
                        <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${audioEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                </div>

                {/* Haptics Toggle */}
                <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10">
                    <span className="font-bold uppercase tracking-widest text-sm text-gray-300">Vibration</span>
                    <button
                        onClick={onToggleHaptics}
                        className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${hapticsEnabled ? 'bg-cat-blue' : 'bg-gray-700'}`}
                    >
                        <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${hapticsEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                </div>

                {/* Reset Stats */}
                <button
                    onClick={handleResetStats}
                    className="mt-8 text-red-500/50 hover:text-red-500 text-xs uppercase tracking-[0.2em] font-bold transition-colors py-4"
                >
                    Reset All Stats
                </button>

            </div>

            <Button onClick={onBack} variant="secondary">Back to Menu</Button>

            <div className="absolute bottom-4 text-[10px] text-white/20 uppercase tracking-widest">
                CatEngage v1.0
            </div>
        </motion.div>
    );
};
