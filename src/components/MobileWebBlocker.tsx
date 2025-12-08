
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
                    className="relative z-50 w-full bg-[#32CD32] text-black font-black py-6 rounded-2xl text-2xl uppercase tracking-widest shadow-[0_0_30px_rgba(50,205,50,0.6)] border-4 border-white active:scale-95 transition-all mt-4"
                >
                    INSTALL APP
                </button>

                <p className="mt-8 text-xs text-gray-500 uppercase tracking-widest font-bold">
                    Redirects to Google Play Store
                </p>
            </motion.div>
        </div>
    );
};
