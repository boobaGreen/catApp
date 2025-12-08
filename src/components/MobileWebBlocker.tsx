
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
                </p>
            </motion.div>
        </div>
    );
};
