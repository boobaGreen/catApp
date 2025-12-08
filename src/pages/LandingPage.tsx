
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export function LandingPage() {
    return (
        <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden selection:bg-cat-lime selection:text-black">
            {/* Hero Section */}
            <section className="relative h-screen flex flex-col items-center justify-center p-6 text-center overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 pointer-events-none opacity-20">
                    <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cat-blue/30 via-transparent to-transparent animate-spin-slow-reverse"></div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="z-10 max-w-4xl"
                >
                    <h1 className="text-6xl md:text-8xl font-black mb-4 tracking-tighter">
                        FELIS<span className="text-cat-lime">.</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-400 mb-8 font-light tracking-wide">
                        The world's first <span className="text-white font-bold">Ethological Training Tool</span> for cats.
                    </p>

                    <Link
                        to="/play"
                        className="inline-block bg-white text-black font-black text-xl px-12 py-5 rounded-full hover:bg-cat-lime hover:scale-105 hover:shadow-[0_0_40px_rgba(163,230,53,0.5)] transition-all duration-300"
                    >
                        LAUNCH APP ➔
                    </Link>

                    <p className="mt-6 text-xs text-gray-400 uppercase tracking-widest">
                        Scientifically Calibrated • No Ads • Pure Instinct
                    </p>
                </motion.div>
            </section>

            {/* Features Section */}
            <section className="py-24 px-6 md:px-20 bg-zinc-900/50">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
                    <FeatureCard
                        icon="🧬"
                        title="Ethological AI"
                        desc="Prey algorithm mimics real biological movement (Perlin Noise + Brownian Motion) to trigger hunting instincts, not just curiosity."
                    />
                    <FeatureCard
                        icon="👁️"
                        title="Tetrachromatic Vision"
                        desc="Colors and contrast ratios specifically tuned for the feline visual spectrum (peaks at 450nm and 555nm)."
                    />
                    <FeatureCard
                        icon="🔊"
                        title="Bio-Acoustics"
                        desc="Sound engine operates in the 8kHz-12kHz range, mimicking small rodent rustling imperceptible to human focus."
                    />
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 text-center text-gray-500 text-sm">
                <p>© 2025 FELIS Project. Designed for Apex Predators.</p>
                <p className="mt-2 opacity-50">Made with ❤️ by Claudio & AI</p>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, desc }: { icon: string, title: string, desc: string }) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-black border border-white/10 p-8 rounded-3xl hover:border-cat-lime/50 transition-colors"
        >
            <div className="text-4xl mb-4">{icon}</div>
            <h3 className="text-2xl font-bold mb-3 text-white">{title}</h3>
            <p className="text-gray-300 leading-relaxed font-light">{desc}</p>
        </motion.div>
    );
}
