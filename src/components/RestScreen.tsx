
import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface RestScreenProps {
    durationMs: number;
    onWakeUp: () => void;
    onExit: () => void;
}

export const RestScreen: React.FC<RestScreenProps> = ({ durationMs, onWakeUp, onExit }) => {
    const [timeLeft, setTimeLeft] = useState(durationMs);
    const [isHolding, setIsHolding] = useState(false);
    const holdStartTime = useRef<number | null>(null);
    const holdDuration = 2000; // 2 seconds to exit

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

    // Hold to Exit Logic
    useEffect(() => {
        let animationFrame: number;

        const checkHold = () => {
            if (isHolding && holdStartTime.current) {
                const elapsed = Date.now() - holdStartTime.current;
                if (elapsed >= holdDuration) {
                    onExit();
                    return; // Stop checking
                }
                animationFrame = requestAnimationFrame(checkHold);
            }
        };

        if (isHolding) {
            holdStartTime.current = Date.now();
            animationFrame = requestAnimationFrame(checkHold);
        } else {
            holdStartTime.current = null;
        }

        return () => cancelAnimationFrame(animationFrame);
    }, [isHolding, onExit]);

    return (
        <div
            className="w-full h-full bg-black flex flex-col items-center justify-center relative touch-none select-none"
            onPointerDown={() => setIsHolding(true)}
            onPointerUp={() => setIsHolding(false)}
            onPointerLeave={() => setIsHolding(false)}
        >
            {/* Dim Pulse Animation */}
            <motion.div
                animate={{ opacity: [0.1, 0.3, 0.1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="flex flex-col items-center"
            >
                <span className="text-4xl">💤</span>
                <span className="text-purple-900/50 text-xs tracking-[0.5em] mt-4 font-bold uppercase">Deep Rest Mode</span>
            </motion.div>

            {/* Minimal Timer (Very Dim) */}
            <div className="absolute bottom-20 text-slate-800 text-sm font-mono opacity-20">
                {formatTime(timeLeft)}
            </div>

            {/* Hold Indicator */}
            {isHolding && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1.5, opacity: 0.5 }}
                        transition={{ duration: 2, ease: "linear" }}
                        className="w-32 h-32 rounded-full border-4 border-red-500/50 bg-red-900/20"
                    />
                    <div className="absolute mt-40 text-red-500/50 text-xs font-bold uppercase tracking-widest">
                        Hold to Wake
                    </div>
                </div>
            )}
        </div>
    );
};
