import { useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function LandingPage() {
    const mainRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // Hero Animation (Safer: Start visible-ish or animate from non-zero)
            const tl = gsap.timeline();
            tl.from(".hero-text", { y: 100, duration: 1, stagger: 0.2, ease: "power4.out" })
                .from(".hero-sub", { y: 20, duration: 1, opacity: 0 }, "-=0.5")
                .from(".hero-cta", { scale: 0.5, duration: 0.5, ease: "back.out(1.7)" }, "-=0.5");

            // Paradox Section Parallax
            gsap.to(".paradox-bg", {
                scrollTrigger: {
                    trigger: ".paradox-section",
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                },
                y: 100
            });

            // Science Cards Stagger
            gsap.from(".science-card", {
                scrollTrigger: {
                    trigger: ".science-grid",
                    start: "top 80%",
                },
                y: 50,
                opacity: 0,
                duration: 0.8,
                stagger: 0.2,
                ease: "power2.out"
            });

            // Footprints Path
            gsap.to(".paw-path", {
                strokeDashoffset: 0,
                scrollTrigger: {
                    trigger: ".science-section",
                    start: "top center",
                    end: "bottom center",
                    scrub: 1
                }
            });

        }, mainRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={mainRef} className="bg-black text-slate-200 font-sans min-h-screen selection:bg-lime-400 selection:text-black overflow-x-hidden">

            {/* HERO SECTION */}
            <header className="relative h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(65,105,225,0.15),transparent_60%)] pointer-events-none"></div>

                <h1 className="hero-text text-7xl md:text-9xl font-black tracking-tighter text-white mb-2 z-10">
                    FELIS<span className="text-lime-400">.</span>
                </h1>
                <p className="hero-text text-xl md:text-2xl font-light tracking-widest text-slate-400 mb-8 uppercase z-10">
                    Apex Hunter <span className="text-lime-400 font-bold mx-2">///</span> Training Tool
                </p>

                <p className="hero-sub max-w-xl text-slate-400 mb-10 leading-relaxed z-10">
                    The world's first ethologically calibrated digital prey specifically designed for the feline sensory spectrum.
                </p>

                <Link
                    to="/play"
                    className="hero-cta relative group bg-white text-black font-black text-xl px-10 py-4 rounded-full overflow-hidden hover:scale-105 transition-transform duration-300"
                >
                    <span className="relative z-10 group-hover:text-white transition-colors duration-300">DEPLOY PREY SYSTEM</span>
                    <div className="absolute inset-0 bg-lime-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                </Link>

                {/* Scroll Indicator */}
                <div
                    className="absolute bottom-10 animate-bounce text-slate-500 cursor-pointer hover:text-white transition-colors"
                    onClick={() => {
                        document.querySelector('.paradox-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                >
                    <div className="text-xs uppercase tracking-widest mb-2 opacity-50">Scroll to Explore</div>
                    <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                </div>
            </header>

            {/* THE INDOOR PARADOX */}
            <section className="paradox-section relative py-32 px-6 border-t border-white/5 bg-zinc-950">
                <div className="paradox-bg absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_bottom,transparent,rgba(65,105,225,0.05))] pointer-events-none"></div>

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h2 className="text-4xl md:text-6xl font-black mb-8 text-white">THE INDOOR <span className="text-blue-500">PARADOX</span></h2>
                    <div className="grid md:grid-cols-2 gap-12 text-left items-center">
                        <div className="space-y-6">
                            <p className="text-lg leading-relaxed text-slate-300">
                                <strong className="text-white block mb-2 text-xl">The Hunter in the Living Room.</strong>
                                Your cat is a biological machine built for the hunt. Yet, the indoor environment is static, predictable, and unchanging.
                            </p>
                            <p className="text-slate-400">
                                This misalignment leads to <span className="text-red-400">boredom</span>, <span className="text-red-400">obesity</span>, and <span className="text-red-400">behavioral stress</span>. They don't just want to play. They need to hunt.
                            </p>
                        </div>
                        <div className="bg-zinc-900 p-8 rounded-2xl border border-white/5 shadow-2xl">
                            <div className="text-5xl font-black text-white mb-2">16<span className="text-lime-400 text-2xl">hrs</span></div>
                            <div className="text-sm text-slate-500 uppercase tracking-widest mb-6">Daily Sleep Cycle</div>

                            <div className="text-5xl font-black text-white mb-2">30<span className="text-lime-400 text-2xl">%</span></div>
                            <div className="text-sm text-slate-500 uppercase tracking-widest">Hunt Success Rate (Wild)</div>

                            <div className="mt-6 pt-6 border-t border-white/10 text-xs text-slate-500">
                                *Felis allows you to replicate this natural frustration-reward cycle safely.
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* THE SCIENCE (THE TRINITY) */}
            <section className="science-section py-32 px-6 relative overflow-hidden">
                {/* Decorative Paw Path SVG */}
                <svg className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-[200px] pointer-events-none opacity-10" viewBox="0 0 100 800">
                    <path className="paw-path" d="M50,0 C20,100 80,200 50,300 C20,400 80,500 50,600" fill="none" stroke="white" strokeWidth="2" strokeDasharray="10 20" />
                </svg>

                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="text-center mb-20">
                        <span className="text-lime-400 font-mono text-sm tracking-widest">ETHOLOGICAL CALIBRATION</span>
                        <h2 className="text-4xl md:text-5xl font-bold mt-2 text-white">ENGINEERED FOR <br />THE FELINE SENSORY SYSTEM</h2>
                    </div>

                    <div className="science-grid grid md:grid-cols-3 gap-6">
                        <ScienceCard
                            icon="👁️"
                            title="Tetrachromatic Vision"
                            description="Cats see the world differently. We utilize specific wavelengths peaking at 450nm (Blue) and 555nm (Green) to maximize visual contrast and engagement."
                            stat="450nm"
                            label="Peak Sensitivity"
                        />
                        <ScienceCard
                            icon="🧬"
                            title="Brownian Motion"
                            description="Real prey never moves in a straight line. Our prey algorithm uses Perlin Noise and Brownian motion mathematics to simulate unpredictable biological movement."
                            stat="100hz"
                            label="Flicker Fusion"
                        />
                        <ScienceCard
                            icon="🔊"
                            title="Bio-Acoustics"
                            description="Sound engineering focused on the 8kHz-12kHz range, mimicking the rustling of small rodents and insects, triggering the locating instinct."
                            stat="8-12kHz"
                            label="Auditory Range"
                        />
                    </div>
                </div>
            </section>

            {/* CTA SECTION */}
            <section className="py-32 text-center bg-zinc-950 relative border-t border-white/10">
                <div className="max-w-2xl mx-auto px-6">
                    <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter">
                        WAKE THE <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-emerald-500">BEAST.</span>
                    </h2>
                    <p className="text-slate-400 mb-12 text-lg">
                        Available on Android as a Progressive Web App.<br />
                        No ads. No subscriptions. Pure instinct.
                    </p>
                    <Link
                        to="/play"
                        className="inline-flex items-center justify-center bg-white text-black font-black text-xl px-12 py-6 rounded-full hover:scale-105 hover:bg-lime-400 transition-all duration-300 shadow-[0_0_50px_rgba(255,255,255,0.2)]"
                    >
                        START HUNTING
                    </Link>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="py-12 border-t border-white/5 text-center text-slate-600 text-sm">
                <div className="mb-4 font-mono text-xs tracking-widest opacity-50">FELIS PROJECT v4.0</div>
                <p>Designed in Italy. Calibrated for Felis Catus.</p>
            </footer>
        </div>
    );
}

function ScienceCard({ icon, title, description, stat, label }: { icon: string, title: string, description: string, stat: string, label: string }) {
    return (
        <div className="science-card bg-zinc-900/50 backdrop-blur-sm border border-white/5 p-8 rounded-2xl hover:border-lime-400/30 transition-colors group">
            <div className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-300">{icon}</div>
            <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-8 min-h-[80px]">{description}</p>

            <div className="pt-6 border-t border-white/5 flex justify-between items-end">
                <div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">{label}</div>
                    <div className="text-2xl font-mono text-lime-400">{stat}</div>
                </div>
            </div>
        </div>
    );
}
