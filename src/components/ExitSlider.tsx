
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
        // If dragged more than 80% of the way
        if (info.point.x > (constraintsRef.current.getBoundingClientRect().left + width * 0.8)) {
            // Snap to end
            await controls.start({ x: width - 40 }); // 40 is key width
            onExit();
        } else {
            // Snap back
            controls.start({ x: 0 });
        }
    };

    return (
        <div className="fixed top-2 left-10 right-10 z-[100] h-12 flex items-center justify-center pointer-events-auto select-none touch-none opacity-40 hover:opacity-100 transition-opacity duration-500">
            {/* Track Container - Thinner and more transparent */}
            <div
                ref={constraintsRef}
                className="relative w-full max-w-xs h-8 bg-white/5 backdrop-blur-sm rounded-full border border-white/10 p-0.5 flex items-center shadow-none overflow-hidden"
            >
                {/* Background Decoration */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent pointer-events-none" />

                {/* Helper Text - Minimal */}
                <motion.div
                    style={{ opacity: textOpacity }}
                    className="absolute inset-0 flex items-center justify-center text-white/30 text-[10px] font-bold tracking-[0.2em] uppercase pointer-events-none"
                >
                    Slide <motion.span style={{ opacity: arrowOpacity }} className="ml-1">➔</motion.span>
                </motion.div>

                {/* Target: Basket (Right) */}
                <div className="absolute right-1 w-8 h-8 flex items-center justify-center text-lg opacity-60 grayscale brightness-150">
                    🧺
                </div>

                {/* Draggable: Yarn Ball (Left) */}
                <motion.div
                    drag="x"
                    dragConstraints={constraintsRef}
                    dragElastic={0.1}
                    dragMomentum={false}
                    onDragEnd={handleDragEnd}
                    animate={controls}
                    style={{ x }}
                    className="relative w-7 h-7 bg-pink-500/80 rounded-full flex items-center justify-center shadow-sm cursor-grab active:cursor-grabbing z-10"
                >
                    <span className="text-sm">🧶</span>

                    {/* Subtle "Unrolling" trail effect hint could go here, for now just a glow */}
                    <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse" />
                </motion.div>
            </div>
        </div>
    );
};
