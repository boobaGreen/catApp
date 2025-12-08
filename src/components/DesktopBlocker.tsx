import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export const DesktopBlocker: React.FC = () => {
    return (
        <div className="h-screen w-full bg-[#0a0a12] flex flex-col items-center justify-center text-center p-8 overflow-hidden relative">
            {/* Background Animation */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/40 via-transparent to-transparent animate-pulse"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="z-10 max-w-2xl bg-[#1a1a2e]/80 backdrop-blur-xl border border-white/10 p-12 rounded-3xl shadow-2xl relative overflow-hidden"
            >
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 p-4 opacity-5 text-8xl">🐭</div>

                <div className="text-6xl mb-6 drop-shadow-lg">🐭🚫</div>
                <h1 className="text-4xl font-black text-white mb-4 uppercase tracking-tighter">
                    No Mice Allowed
                </h1>
                <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                    <span className="text-purple-400 font-bold">FELIS</span> is an ethological tool designed for touchscreen interaction.
                    <br />
                    Cats cannot hunt with a mouse cursor.
                </p>

                <div className="bg-white p-4 rounded-xl inline-block mb-8 shadow-lg">
                    <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://apex-hunter.eu`}
                        alt="Scan to Play"
                        className="w-48 h-48"
                    />
                </div>

                <p className="text-sm text-slate-500 uppercase tracking-widest font-bold mb-8">
                    Scan with your phone to hunt
                </p>

                <Link to="/" className="text-slate-500 hover:text-white underline text-sm transition-colors">
                    Back to Home
                </Link>
            </motion.div>
        </div>
    );
};
