import { useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function LandingPage() {
    const mainRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        let factInterval: any;
        const onMouseMove = (e: MouseEvent) => {
            const laser = document.querySelector('.laser-pointer');
            if (laser) {
                gsap.to(laser, {
                    x: e.clientX,
                    y: e.clientY,
                    duration: 0.1,
                    ease: "power2.out"
                });
            }
        };

        const ctx = gsap.context(() => {
            // 🔴 LASER POINTER LISTENER
            window.addEventListener('mousemove', onMouseMove);

            // 🧠 DID YOU KNOW CAROUSEL
            const facts = gsap.utils.toArray('.fact-card') as HTMLElement[];
            const title = document.querySelector('.fact-title');
            const factIds = ["#392", "#12", "#88"]; // Matching IDs for the 3 facts

            if (facts.length > 0) {
                let currentFact = 0;

                // Initial state
                gsap.set(facts, { opacity: 0, x: 50, display: "none" });
                gsap.set(facts[0], { opacity: 1, x: 0, display: "flex" });
                if (title) title.textContent = `Cat Fact ${factIds[0]}`;

                const nextFact = () => {
                    const prev = currentFact;
                    currentFact = (currentFact + 1) % facts.length;

                    const tl = gsap.timeline();

                    // Exit previous
                    tl.to(facts[prev], {
                        opacity: 0,
                        x: -50,
                        duration: 0.5,
                        onComplete: () => { gsap.set(facts[prev], { display: "none" }); }
                    })
                        // Enter next & Update Title
                        .call(() => {
                            if (title) title.textContent = `Cat Fact ${factIds[currentFact]}`;
                        })
                        .set(facts[currentFact], { display: "flex", x: 50 })
                        .to(facts[currentFact], { opacity: 1, x: 0, duration: 0.5 });
                };
                factInterval = setInterval(nextFact, 5000); // 5s for readability
            }

            // 🐱 RUNNING CAT ANIMATION (Scroll-driven)
            const cat = document.querySelector('.running-cat');
            if (cat) {
                gsap.to(cat, {
                    scrollTrigger: {
                        trigger: mainRef.current,
                        start: "top top",
                        end: "bottom bottom",
                        scrub: 1,
                    },
                    x: "80vw", // Moves across screen as you scroll
                    rotation: 10, // Slight tilt
                    ease: "none"
                });

                // Wiggle effect (independent of scroll)
                gsap.to(cat, {
                    y: -10,
                    duration: 0.3,
                    yoyo: true,
                    repeat: -1,
                    ease: "sine.inOut"
                });
            }

            // 🐾 PAW PRINTS APPEARING 
            (gsap.utils.toArray('.paw-print') as HTMLElement[]).forEach((paw) => {
                gsap.from(paw, {
                    scrollTrigger: {
                        trigger: paw,
                        start: "top 80%",
                        toggleActions: "play none none reverse"
                    },
                    scale: 0,
                    opacity: 0,
                    duration: 0.5,
                    ease: "back.out(1.7)"
                });
            });

            // HERO ANIMATIONS
            const tl = gsap.timeline();
            tl.from(".hero-title", { y: 50, opacity: 0, duration: 1, ease: "power3.out" })
                .from(".hero-subtitle", { y: 20, opacity: 0, duration: 0.8 }, "-=0.6")
                .from(".whiskers", { scaleX: 0, opacity: 0, duration: 0.8 }, "-=0.6")
                .from(".hero-cta", { scale: 0.8, opacity: 0, duration: 0.5, ease: "back.out(2)" }, "-=0.4");

        }, mainRef);

        return () => {
            ctx.revert();
            window.removeEventListener('mousemove', onMouseMove);
            if (factInterval) clearInterval(factInterval);
        };
    }, []);

    return (
        <div ref={mainRef} className="bg-[#0a0a12] text-slate-200 font-sans min-h-screen selection:bg-purple-400 selection:text-white overflow-x-hidden cursor-none">

            {/* 🔴 LASER POINTER CURSOR */}
            <div className="laser-pointer fixed top-0 left-0 w-6 h-6 bg-red-500 rounded-full blur-[4px] shadow-[0_0_20px_rgba(255,0,0,0.8)] pointer-events-none z-[100] mix-blend-screen hidden md:block"></div>

            {/* 🏃‍♂️ UNIVERSAL RUNNING CAT (Sticky/Fixed Visual) */}
            <div className="running-cat fixed bottom-6 left-6 z-50 text-6xl drop-shadow-2xl opacity-90 cursor-grab active:cursor-grabbing hover:scale-110 transition-transform">
                🐈
            </div>

            {/* HERO SECTION */}
            <header className="relative h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a1a2e] to-[#0a0a12]">

                {/* Decorative Whiskers */}
                <div className="whiskers absolute top-1/2 -translate-y-24 w-[300px] md:w-[600px] h-[1px] bg-gradient-to-r from-transparent via-purple-400/30 to-transparent"></div>
                <div className="whiskers absolute top-1/2 -translate-y-20 w-[200px] md:w-[500px] h-[1px] bg-gradient-to-r from-transparent via-purple-400/20 to-transparent"></div>

                <h1 className="hero-title text-6xl md:text-8xl font-black text-white mb-4 z-10 drop-shadow-xl relative">
                    Felis<span className="text-purple-400">.</span>
                    {/* Cute Ears on Title */}
                    <span className="absolute -top-6 left-2 text-4xl opacity-50 -rotate-12">🐱</span>
                </h1>

                <p className="hero-subtitle text-xl md:text-3xl font-light text-slate-300 mb-8 z-10 max-w-2xl leading-relaxed">
                    Designed by Science.<br />
                    <span className="text-purple-400 font-bold">Loved by Cats.</span>
                </p>

                <Link
                    to="/play"
                    className="hero-cta relative group bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-xl px-12 py-5 rounded-full shadow-[0_10px_40px_-10px_rgba(168,85,247,0.5)] hover:shadow-[0_20px_60px_-15px_rgba(168,85,247,0.7)] hover:scale-105 transition-all duration-300"
                >
                    Let's Play! 🐾
                </Link>

                {/* Scroll Hint */}
                <div className="absolute bottom-12 animate-bounce cursor-pointer flex flex-col items-center gap-2 opacity-50 hover:opacity-100 transition-opacity" onClick={() => document.querySelector('.paradox-section')?.scrollIntoView({ behavior: 'smooth' })}>
                    <span className="text-xs uppercase tracking-widest text-purple-300">Discover the Science</span>
                    <div className="w-1 h-8 rounded-full bg-gradient-to-b from-purple-500 to-transparent"></div>
                </div>
            </header>

            {/* THE "WHY" SECTION */}
            <section className="paradox-section relative py-32 px-6 bg-[#0f0f1b]">
                {/* Paw Print Trail Background */}
                <div className="absolute top-0 right-10 text-4xl opacity-10 rotate-12 paw-print">🐾</div>
                <div className="absolute top-40 left-10 text-4xl opacity-10 -rotate-12 paw-print">🐾</div>
                <div className="absolute bottom-20 right-20 text-4xl opacity-10 rotate-45 paw-print">🐾</div>

                <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                    <div className="relative">
                        <div className="absolute -inset-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-[2rem] opacity-20 blur-xl"></div>
                        <div className="relative bg-[#1a1a2e] p-10 rounded-[2rem] border border-white/5 text-center">
                            <span className="text-6xl mb-4 block">😿</span>
                            <h3 className="text-2xl font-bold text-white mb-2">The Bored House Cat</h3>
                            <p className="text-slate-400">Sleeping 16 hours isn't just laziness. It's often boredom. Without the hunt, their brilliant minds get dull.</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-4xl md:text-5xl font-bold text-white">
                            Bring the <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Wild</span> Inside.
                            <br />
                            <span className="text-2xl opacity-60 font-medium">(Safely!)</span>
                        </h2>
                        <p className="text-lg text-slate-300 leading-relaxed">
                            Your sofa isn't exactly the Serengeti.
                            <strong>Felis</strong> turns your screen into an intelligent, reactive prey that speaks your cat's language.
                        </p>
                    </div>
                </div>
            </section>

            {/* 🧠 NEW SECTION: CAT LOGIC vs HUMAN LOGIC */}
            <section className="py-24 px-6 bg-[#1a1a2e] border-y border-white/5">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">Who really owns the house?</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-red-500/10 p-8 rounded-3xl border border-red-500/20">
                            <h3 className="text-xl font-bold text-red-300 mb-4">Human Logic 🧠</h3>
                            <ul className="space-y-4 text-slate-400 text-sm">
                                <li>• "I bought you a $50 bed."</li>
                                <li>• "This toy mouse is static and boring."</li>
                                <li>• "Don't scratch the sofa!"</li>
                            </ul>
                        </div>
                        <div className="bg-green-500/10 p-8 rounded-3xl border border-green-500/20">
                            <h3 className="text-xl font-bold text-green-300 mb-4">Cat Logic 😼</h3>
                            <ul className="space-y-4 text-slate-300 text-sm font-medium">
                                <li>• "I prefer the cardboard box."</li>
                                <li>• "If it doesn't move, it's dead."</li>
                                <li>• "The sofa has the best texture."</li>
                            </ul>
                        </div>
                    </div>
                    <p className="text-center mt-8 text-slate-500 italic">Felis bridges the gap. We make the screen more interesting than the sofa.</p>
                </div>
            </section>

            {/* 💡 NEW SECTION: DID YOU KNOW CAROUSEL */}
            <section className="py-24 bg-[#0a0a12] text-center overflow-hidden relative min-h-[400px] flex flex-col justify-center">
                <h2 className="fact-title text-sm font-bold tracking-[0.3em] text-purple-400 mb-12 uppercase transition-all">Cat Fact #392</h2>
                <div className="relative h-40 max-w-2xl mx-auto w-full">
                    <div className="fact-card absolute inset-0 flex items-center justify-center px-6">
                        <p className="text-2xl md:text-3xl text-white font-light leading-relaxed">"Cats have 32 muscles in each ear, allowing them to rotate 180 degrees."</p>
                    </div>
                    <div className="fact-card absolute inset-0 flex items-center justify-center px-6">
                        <p className="text-2xl md:text-3xl text-white font-light leading-relaxed">"A cat's vision is tuned to movement. They can see a fly 10 meters away."</p>
                    </div>
                    <div className="fact-card absolute inset-0 flex items-center justify-center px-6">
                        <p className="text-2xl md:text-3xl text-white font-light leading-relaxed">"Purring is a self-healing mechanism. It creates vibrations that repair bone."</p>
                    </div>
                </div>
            </section>

            {/* THE SCIENCE (Stickers & Fun) */}
            <section className="py-32 px-6 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] bg-fixed">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-20">
                        <div className="inline-block px-4 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm font-bold tracking-widest mb-4">NERD STUFF made FUN</div>
                        <h2 className="text-4xl md:text-5xl font-bold text-white">How We Tickle Their Brains</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Vision Card */}
                        <div className="bg-[#1a1a2e] p-8 rounded-3xl border border-white/5 hover:border-purple-500/50 transition-colors group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-8xl">👁️</div>
                            <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center text-3xl mb-6 text-blue-400">🌈</div>
                            <h3 className="text-xl font-bold text-white mb-3">Magic Colors</h3>
                            <p className="text-slate-400 text-sm mb-4">Cats see Blue and Green best. We use these specific colors to make the prey pop!</p>
                            <div className="text-xs bg-black/30 inline-block px-3 py-1 rounded-lg text-blue-300">Peak: 450nm</div>
                        </div>

                        {/* Motion Card */}
                        <div className="bg-[#1a1a2e] p-8 rounded-3xl border border-white/5 hover:border-green-500/50 transition-colors group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-8xl">🦋</div>
                            <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center text-3xl mb-6 text-green-400">⚡</div>
                            <h3 className="text-xl font-bold text-white mb-3">Real Movement</h3>
                            <p className="text-slate-400 text-sm mb-4">It doesn't just bounce. It scampers, freezes, and hides like a real mouse.</p>
                            <div className="text-xs bg-black/30 inline-block px-3 py-1 rounded-lg text-green-300">Brownian Math</div>
                        </div>

                        {/* Sound Card */}
                        <div className="bg-[#1a1a2e] p-8 rounded-3xl border border-white/5 hover:border-pink-500/50 transition-colors group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-8xl">🐭</div>
                            <div className="w-16 h-16 bg-pink-500/20 rounded-2xl flex items-center justify-center text-3xl mb-6 text-pink-400">🔊</div>
                            <h3 className="text-xl font-bold text-white mb-3">Secret Whispers</h3>
                            <p className="text-slate-400 text-sm mb-4">We use high-pitched squeaks (8kHz+) that cats love but humans barely notice.</p>
                            <div className="text-xs bg-black/30 inline-block px-3 py-1 rounded-lg text-pink-300">Ultrasonic-ish</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FINAL CTA */}
            <section className="py-24 text-center px-6 bg-[#0a0a12] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 to-transparent pointer-events-none"></div>
                <div className="max-w-2xl mx-auto relative z-10">
                    <h2 className="text-5xl md:text-6xl font-black text-white mb-8">
                        Ready to <span className="text-purple-400">Purr?</span>
                    </h2>
                    <p className="text-slate-400 mb-10 text-lg">
                        Zero Ads. Zero Stress. 100% Good Vibes.
                    </p>
                    <Link
                        to="/play"
                        className="inline-flex items-center gap-3 bg-white text-purple-900 font-black text-xl px-12 py-6 rounded-full hover:scale-105 hover:bg-purple-50 transition-all duration-300 shadow-2xl"
                    >
                        <span>START THE GAME</span>
                        <span>🚀</span>
                    </Link>

                    <div className="mt-12 flex justify-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all">
                        {/* Fake "As Seen On" or Badges could go here for fun */}
                        <span className="text-xs text-slate-600">Made with ❤️ for Claudio's Cats</span>
                    </div>
                </div>
            </section>
        </div>
    );
}
