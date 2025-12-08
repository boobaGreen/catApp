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
        primary: "bg-cat-blue/80 text-white border-2 border-cat-blue hover:bg-cat-blue hover:shadow-cat-blue/50",
        secondary: "bg-white/10 text-white border-2 border-white/20 hover:bg-white/20",
        danger: "bg-red-500/80 text-white border-red-500 hover:bg-red-600"
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
