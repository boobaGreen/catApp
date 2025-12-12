import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ExitSlider } from './ExitSlider';

interface RestScreenProps {
    durationMs: number;
    onWakeUp: () => void;
    onExit: () => void;
}

export const RestScreen: React.FC<RestScreenProps> = ({ durationMs, onWakeUp, onExit }) => {
    const [timeLeft, setTimeLeft] = useState(durationMs);

    // Countdown Timer
    useEffect(() => {
        if (timeLeft <= 0) {
            onWakeUp();
            return;
        }

        const interval = setInterval(() => {
            setTimeLeft(prev => Math.max(0, prev - 1000));
        }, 1000);

        return () => clearInterval(interval);
    }, [timeLeft, onWakeUp]);

    // Format time for display (optional, maybe keep it minimal)
    const formatTime = (ms: number) => {
        const mins = Math.floor(ms / 60000);
        const secs = Math.floor((ms % 60000) / 1000);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="w-full h-full bg-black flex flex-col items-center justify-center relative touch-none select-none p-8">
            {/* Ambient Pulse */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.2, 1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-900/20 blur-[100px] rounded-full"
                />
            </div>

            {/* Central Content */}
            <div className="relative z-10 flex flex-col items-center text-center space-y-8">
                <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="flex flex-col items-center"
                >
                    <span className="text-6xl mb-4 filter drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">💤</span>
                    <h2 className="text-2xl font-black text-white uppercase tracking-widest">System Cooling</h2>
                    <p className="text-xs text-purple-300/80 font-mono uppercase tracking-widest mt-2 max-w-xs leading-relaxed">
                        Ethological Rest Protocol Active.<br />
                        Simulating natural predator recovery cycles.
                    </p>
                </motion.div>

                {/* Timer */}
                <div className="text-5xl font-black font-mono text-white/90 tabular-nums tracking-tighter">
                    {formatTime(timeLeft)}
                </div>

                {/* Action Area */}
                <div className="space-y-4 w-full max-w-xs">
                    <button
                        onClick={onWakeUp}
                        className="w-full py-4 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/50 rounded-xl transition-all group"
                    >
                        <div className="text-xs font-bold text-slate-300 uppercase tracking-widest group-hover:text-white mb-1">Override Protocol</div>
                        <div className="text-[10px] text-slate-500 group-hover:text-purple-400">Custom Rhythms Available in Settings</div>
                    </button>

                    <p className="text-[9px] text-slate-600 text-center px-4 leading-relaxed">
                        * Default rhythm (1.5m Play / 5m Rest) is scientifically optimized for feline long-term engagement.
                    </p>
                </div>
            </div>

            {/* Exit Slider - Top Fixed */}
            <ExitSlider onExit={onExit} />
        </div>
    );
};
