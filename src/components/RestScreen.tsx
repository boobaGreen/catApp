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
        <div
            className="w-full h-full bg-black flex flex-col items-center justify-center relative touch-none select-none"
        >
            {/* Dim Pulse Animation */}
            <motion.div
                animate={{ opacity: [0.1, 0.3, 0.1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="flex flex-col items-center"
            >
                <span className="text-4xl filter grayscale opacity-50">💤</span>
                <span className="text-purple-900/50 text-xs tracking-[0.5em] mt-4 font-bold uppercase">Deep Rest Mode</span>
            </motion.div>

            {/* Minimal Timer (Very Dim) */}
            <div className="absolute bottom-20 text-slate-800 text-sm font-mono opacity-20">
                {formatTime(timeLeft)}
            </div>

            {/* Exit Slider (Top) */}
            <ExitSlider onExit={onExit} />
        </div>
    );
};
