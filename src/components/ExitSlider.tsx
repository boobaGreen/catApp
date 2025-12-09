
import React, { useRef } from 'react';
import { motion, useMotionValue, useTransform, useAnimation } from 'framer-motion';

interface ExitSliderProps {
    onExit: () => void;
}

export const ExitSlider: React.FC<ExitSliderProps> = ({ onExit }) => {
    const constraintsRef = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const controls = useAnimation();

    // Fade out helper text as we drag
    const textOpacity = useTransform(x, [0, 50], [1, 0]);
    const arrowOpacity = useTransform(x, [0, 30], [1, 0]);

    const handleDragEnd = async (_: any, info: any) => {
        if (!constraintsRef.current) return;

        const width = constraintsRef.current.offsetWidth;
        // If dragged more than 75% of the way
        if (info.point.x > (constraintsRef.current.getBoundingClientRect().left + width * 0.75)) {
            // Snap to end
            await controls.start({ x: width - 56 }); // 56 is roughly key width + padding
            onExit();
        } else {
            // Snap back
            controls.start({ x: 0 });
        }
    };

    return (
        <div className="fixed top-4 left-4 right-4 z-[100] h-16 flex items-center justify-center pointer-events-auto select-none touch-none">
            {/* Track Container */}
            <div
                ref={constraintsRef}
                className="relative w-full max-w-sm h-14 bg-white/10 backdrop-blur-md rounded-full border border-white/20 p-1 flex items-center shadow-lg overflow-hidden"
            >

                {/* Background Decoration */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent pointer-events-none" />

                {/* Helper Text */}
                <motion.div
                    style={{ opacity: textOpacity }}
                    className="absolute inset-0 flex items-center justify-center text-white/50 text-xs font-bold tracking-widest uppercase pointer-events-none"
                >
                    Slide to Exit <motion.span style={{ opacity: arrowOpacity }} className="ml-2">➔</motion.span>
                </motion.div>

                {/* Target Box (Right) */}
                <div className="absolute right-1 w-12 h-12 flex items-center justify-center text-2xl filter drop-shadow opacity-80 animate-pulse">
                    📦
                </div>

                {/* Draggable Key (Left) */}
                <motion.div
                    drag="x"
                    dragConstraints={constraintsRef}
                    dragElastic={0.1}
                    dragMomentum={false}
                    onDragEnd={handleDragEnd}
                    animate={controls}
                    style={{ x }}
                    className="relative w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(251,191,36,0.5)] cursor-grab active:cursor-grabbing z-10"
                >
                    <span className="text-xl filter drop-shadow-sm">🗝️</span>

                    {/* Ripple Effect hint */}
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 rounded-full border border-white/50"
                    />
                </motion.div>
            </div>
        </div>
    );
};
