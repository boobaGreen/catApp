
import React from 'react';
import { motion } from 'framer-motion';

export const MobileWebBlocker: React.FC = () => {
    const handleInstall = () => {
        // Redirect to Play Store (or internal deep link if we had one ready)
        // Ideally this opens the store listing
        window.location.href = "https://play.google.com/store/apps/details?id=com.felix.apexhunter";
    };

    return (
        <div className="h-screen w-full bg-black flex flex-col items-center justify-center text-center p-6 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 opacity-30 pointer-events-none">
                <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-cat-lime/20 to-transparent"></div>
            </div>

            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="z-10 w-full max-w-sm"
            >
                <div className="text-6xl mb-6">📲</div>
                <h1 className="text-3xl font-black text-white mb-2 uppercase">
                    App Required
                </h1>
                <p className="text-gray-400 mb-8 leading-relaxed text-sm">
                    To ensure the highest quality ethological experience (Wake Lock, Haptics, Fullscreen),
                    <span className="text-cat-lime font-bold"> FELIS</span> must be installed.
                </p>

                <button
                    onClick={handleInstall}
                    className="relative z-50 w-full bg-cat-lime text-black font-black py-5 rounded-xl text-xl uppercase tracking-widest shadow-[0_0_20px_rgba(50,205,50,0.8)] border-2 border-white/20 hover:scale-105 active:scale-95 transition-all"
                >
                    Install / Open App
                </button>

                <p className="mt-6 text-[10px] text-gray-600 uppercase">
                    Available on Google Play
                </p>
            </motion.div>
        </div>
    );
};
