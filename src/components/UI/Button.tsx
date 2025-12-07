import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps {
    onClick: () => void;
    children: React.ReactNode;
    className?: string;
    variant?: 'primary' | 'secondary' | 'danger';
}

export const Button: React.FC<ButtonProps> = ({ onClick, children, className = '', variant = 'primary' }) => {
    const baseStyle = "px-8 py-4 rounded-full font-bold text-xl backdrop-blur-md shadow-lg transition-all transform hover:scale-105 active:scale-95";

    const variants = {
        primary: "bg-cat-blue/80 text-white border-2 border-cat-blue hover:bg-cat-blue hover:shadow-cat-blue/50",
        secondary: "bg-white/10 text-white border-2 border-white/20 hover:bg-white/20",
        danger: "bg-red-500/80 text-white border-red-500 hover:bg-red-600"
    };

    return (
        <motion.button
            whileTap={{ scale: 0.95 }}
            className={`${baseStyle} ${variants[variant]} ${className}`}
            onClick={onClick}
        >
            {children}
        </motion.button>
    );
};
