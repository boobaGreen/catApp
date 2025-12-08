import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps {
    onClick?: () => void;
    children: React.ReactNode;
    className?: string;
    variant?: 'primary' | 'secondary' | 'danger';
    disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ onClick, children, className = '', variant = 'primary', disabled = false }) => {
    const baseStyle = "px-8 py-4 rounded-full font-bold text-xl backdrop-blur-md shadow-lg transition-all transform";

    // Conditional animation props
    const animationProps = disabled ? {} : {
        whileHover: { scale: 1.05 },
        whileTap: { scale: 0.95 }
    };

    const variants = {
        primary: "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-[0_10px_30px_-10px_rgba(168,85,247,0.6)] hover:shadow-[0_20px_40px_-10px_rgba(168,85,247,0.8)] border-none hover:scale-105",
        secondary: "bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:border-white/40",
        danger: "bg-red-500/80 text-white shadow-lg shadow-red-500/40 hover:bg-red-600"
    };

    return (
        <motion.button
            {...animationProps}
            className={`${baseStyle} ${variants[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
            onClick={disabled ? undefined : onClick}
            disabled={disabled}
        >
            {children}
        </motion.button>
    );
};
