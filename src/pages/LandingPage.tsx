import { useLayoutEffect, useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function LandingPage() {
    const mainRef = useRef<HTMLDivElement>(null);
    const laserRef = useRef<HTMLDivElement>(null);
    const [isTouch, setIsTouch] = useState(false);
    const [email, setEmail] = useState('');
    const [requestSent, setRequestSent] = useState(false);

    // Detect Touch Device
    useEffect(() => {
        setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
    }, []);

    useLayoutEffect(() => {
        let factInterval: ReturnType<typeof setInterval>;
        let laserTween: gsap.core.Tween | null = null;

        // 1. Mouse Tracking Function (Defined here to be accessible for cleanup)
        const onMouseMove = (e: MouseEvent) => {
            if (!isTouch && laserRef.current) {
                // Kill auto-animation if user moves mouse
                if (laserTween) {
                    laserTween.kill();
                    laserTween = null;
                }
                gsap.to(laserRef.current, {
                    x: e.clientX,
                    y: e.clientY,
                    opacity: 1,
                    scale: 1,
                    duration: 0.1,
                    ease: "power2.out"
                });
            }
        };

        const ctx = gsap.context(() => {
            // 🔴 LASER POINTER AUTO-PILOT (Mobile/Idle)
            const runAutoLaser = () => {
                if (!laserRef.current) return;

                // Random position within viewport
                const x = Math.random() * window.innerWidth;
                const y = Math.random() * window.innerHeight;

                // Jittery "bug" movement
                laserTween = gsap.to(laserRef.current, {
                    x: x,
                    y: y,
                    opacity: 1,
                    keyframes: {
                        scale: [1, 1.2, 0.9, 1]
                    },
                    duration: Math.random() * 0.5 + 0.2, // Fast, random speed
                    ease: "power1.inOut",
                    onComplete: runAutoLaser // Loop
                });
            };

            if (isTouch) {
                // On mobile, start auto-laser after small delay
                setTimeout(runAutoLaser, 1000);
            }

            // 🧠 DID YOU KNOW CAROUSEL
            const facts = gsap.utils.toArray('.fact-card') as HTMLElement[];
            const title = document.querySelector('.fact-title');
            const factIds = ["#392", "#12", "#88"];

            if (facts.length > 0) {
                let currentFact = 0;
                gsap.set(facts, { opacity: 0, x: 50, display: "none" });
                gsap.set(facts[0], { opacity: 1, x: 0, display: "flex" });
                if (title) title.textContent = `Cat Fact ${factIds[0]}`;

                const nextFact = () => {
                    const prev = currentFact;
                    currentFact = (currentFact + 1) % facts.length;

                    const tl = gsap.timeline();
                    tl.to(facts[prev], {
                        opacity: 0,
                        x: -50,
                        duration: 0.5,
                        onComplete: () => { gsap.set(facts[prev], { display: "none" }); }
                    })
                        .call(() => {
                            if (title) title.textContent = `Cat Fact ${factIds[currentFact]}`;
                        })
                        .set(facts[currentFact], { display: "flex", x: 50 })
                        .to(facts[currentFact], { opacity: 1, x: 0, duration: 0.5 });
                };
                factInterval = setInterval(nextFact, 5000);
            }

            // 🐱 RUNNING CAT (Scroll)
            const cat = document.querySelector('.running-cat');
            if (cat) {
                gsap.to(cat, {
                    scrollTrigger: {
                        trigger: mainRef.current,
                        start: "top top",
                        end: "bottom bottom",
                        scrub: 1,
                    },
                    x: "80vw",
                    rotation: 10,
                    ease: "none"
                });

                // Wiggle
                gsap.to(cat, {
                    y: -10,
                    duration: 0.3,
                    yoyo: true,
                    repeat: -1,
                    ease: "sine.inOut"
                });
            }

            // 🐾 PAW PRINTS
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

            // HERO INTRO
            const tl = gsap.timeline();
            tl.from(".hero-title", { y: 50, opacity: 0, duration: 1, ease: "power3.out" })
                .from(".whiskers", { scaleX: 0, opacity: 0, duration: 0.8 }, "-=0.6")
                .from(".typewriter-text", { width: 0, duration: 2, ease: "steps(40)" }, "-=0.2"); // Typing effect

        }, mainRef);

        // Event Listener Registration
        if (!isTouch) {
            window.addEventListener('mousemove', onMouseMove);
        }

        return () => {
            ctx.revert();
            window.removeEventListener('mousemove', onMouseMove);
            if (factInterval) clearInterval(factInterval);
            if (laserTween) laserTween.kill();
        };
    }, [isTouch]);

    return (
        <div ref={mainRef} className="bg-[#0a0a12] text-slate-200 font-sans min-h-screen selection:bg-purple-400 selection:text-white overflow-x-hidden cursor-none relative">

            {/* 🔴 LASER POINTER (Universal) */}
            <div ref={laserRef} className="laser-pointer fixed top-0 left-0 w-6 h-6 bg-red-500 rounded-full blur-[4px] shadow-[0_0_20px_rgba(255,0,0,0.8)] pointer-events-none z-[100] mix-blend-screen opacity-0"></div>

            {/* 🏃‍♂️ RUNNING CAT */}
            <div className="running-cat fixed bottom-6 left-6 z-50 text-6xl drop-shadow-2xl opacity-90 cursor-grab active:cursor-grabbing hover:scale-110 transition-transform">
                🐈
            </div>

            {/* HERO SECTION */}
            <header className="relative h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a1a2e] to-[#0a0a12]">

                {/* Whiskers */}
                <div className="whiskers absolute top-1/2 -translate-y-24 w-[300px] md:w-[600px] h-[1px] bg-gradient-to-r from-transparent via-purple-400/30 to-transparent"></div>
                <div className="whiskers absolute top-1/2 -translate-y-20 w-[200px] md:w-[500px] h-[1px] bg-gradient-to-r from-transparent via-purple-400/20 to-transparent"></div>

                <h1 className="hero-title text-6xl md:text-8xl font-black text-white mb-4 z-10 drop-shadow-xl relative hover:scale-[1.02] transition-transform duration-500 ease-out cursor-default">
                    Felis<span className="text-purple-400 animate-pulse">.</span>
                    <span className="absolute -top-6 left-2 text-4xl opacity-50 -rotate-12 animate-[bounce_3s_infinite]">🐱</span>
                </h1>

                {/* Typing Effect Subtitle */}
                <div className="mb-8 z-10 h-16 flex flex-col items-center">
                    <p className="hero-subtitle text-xl md:text-3xl font-light text-slate-300 max-w-2xl leading-relaxed">
                        Designed by Science.
                    </p>
                    <div className="overflow-hidden whitespace-nowrap border-r-4 border-purple-400 pr-2 typewriter-text">
                        <span className="text-purple-400 font-bold text-xl md:text-3xl">Loved by Cats.</span>
                    </div>
                </div>



                <div className="absolute bottom-12 animate-bounce cursor-pointer flex flex-col items-center gap-2 opacity-50 hover:opacity-100 transition-opacity" onClick={() => document.querySelector('.paradox-section')?.scrollIntoView({ behavior: 'smooth' })}>
                    <span className="text-xs uppercase tracking-widest text-purple-300">Discover the Science</span>
                    <div className="w-1 h-8 rounded-full bg-gradient-to-b from-purple-500 to-transparent"></div>
                </div>
            </header>



            {/* THE "WHY" SECTION */}
            <section className="paradox-section relative py-32 px-6 bg-[#0f0f1b]">
                <div className="absolute top-0 right-10 text-4xl opacity-10 rotate-12 paw-print">🐾</div>
                <div className="absolute top-40 left-10 text-4xl opacity-10 -rotate-12 paw-print">🐾</div>
                <div className="absolute bottom-20 right-20 text-4xl opacity-10 rotate-45 paw-print">🐾</div>

                <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                    <div className="relative group">
                        <div className="absolute -inset-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-[2rem] opacity-20 blur-xl group-hover:opacity-30 transition-opacity"></div>
                        <div className="relative bg-[#1a1a2e] p-10 rounded-[2rem] border border-white/5 text-center transform transition-transform group-hover:scale-[1.01]">
                            <span className="text-6xl mb-4 block">😿</span>
                            <h3 className="text-2xl font-bold text-white mb-2">The Bored House Cat</h3>
                            <p className="text-slate-400">Sleeping 16 hours isn't just laziness. It's often boredom. Without the hunt, their brilliant minds get dull.</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-4xl md:text-5xl font-bold text-white">
                            Bring the <span className="text-purple-400">Wild</span> Inside.
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

            {/* 🎮 GAME MODES */}
            <section className="py-24 px-6 bg-[#0a0a12] relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none"></div>

                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Choose Your Hunt 🎯</h2>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto">Every cat is different. Some stalk shadows, others chase light. We built modes for every predator personality.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Classic */}
                        <div className="bg-[#1a1a2e] p-8 rounded-3xl border border-blue-500/20 hover:border-blue-500/50 transition-all hover:-translate-y-2 group">
                            <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform">🐁</div>
                            <h3 className="text-2xl font-bold text-white mb-2">Classic Hunt</h3>
                            <p className="text-slate-400 mb-4">The original favorite. Mice, insects, and worms that perform realistic survival behaviors.</p>
                            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full">Strategic</span>
                        </div>

                        {/* Laser */}
                        <div className="bg-[#1a1a2e] p-8 rounded-3xl border border-red-500/20 hover:border-red-500/50 transition-all hover:-translate-y-2 group relative overflow-hidden">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/20 blur-xl rounded-full"></div>
                            <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform">🔴</div>
                            <h3 className="text-2xl font-bold text-white mb-2">Laser Frenzy</h3>
                            <p className="text-slate-400 mb-4">High-speed, glowing chaos. Perfect for high-energy bursts and burning off the "zoomies".</p>
                            <span className="text-xs font-bold text-red-400 uppercase tracking-widest bg-red-500/10 px-3 py-1 rounded-full">Intense</span>
                        </div>

                        {/* Shuffle */}
                        <div className="bg-[#1a1a2e] p-8 rounded-3xl border border-purple-500/20 hover:border-purple-500/50 transition-all hover:-translate-y-2 group">
                            <div className="text-6xl mb-6 transform group-hover:rotate-180 transition-transform duration-700">🎲</div>
                            <h3 className="text-2xl font-bold text-white mb-2">Smart Shuffle</h3>
                            <p className="text-slate-400 mb-4">The AI Director takes control. It switches modes dynamically to prevent boredom and habituation.</p>
                            <span className="text-xs font-bold text-purple-400 uppercase tracking-widest bg-purple-500/10 px-3 py-1 rounded-full">Infinite Variety</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* 📝 PROFILES */}
            <section className="py-24 px-6 bg-[#131320] border-y border-white/5">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-16">
                    <div className="md:w-1/2">
                        <div className="inline-block px-4 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs font-bold tracking-widest border border-orange-500/20 mb-6">
                            NEW: MULTI-CAT SUPPORT
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                            A Pride? <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-600">No Problem.</span>
                        </h2>
                        <p className="text-lg text-slate-300 leading-relaxed mb-8">
                            Luna likes Mice. Simbin loves the Laser. <br />
                            Create unique <strong>Profiles</strong> for each cat to track their individual stats, reaction times, and favorite game modes.
                        </p>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-4 text-slate-300">
                                <span className="bg-orange-500/20 text-orange-400 w-8 h-8 rounded-full flex items-center justify-center font-bold">1</span>
                                <span>Save custom preferences per cat</span>
                            </li>
                            <li className="flex items-center gap-4 text-slate-300">
                                <span className="bg-orange-500/20 text-orange-400 w-8 h-8 rounded-full flex items-center justify-center font-bold">2</span>
                                <span>Compare "Prey Caught" leaderboards</span>
                            </li>
                            <li className="flex items-center gap-4 text-slate-300">
                                <span className="bg-orange-500/20 text-orange-400 w-8 h-8 rounded-full flex items-center justify-center font-bold">3</span>
                                <span>Track "Reflex Score" improvements</span>
                            </li>
                        </ul>
                    </div>
                    <div className="md:w-1/2 relative group cursor-default">
                        {/* Mock UI Card */}
                        <div className="bg-[#0a0a12] p-6 rounded-3xl border border-white/10 shadow-2xl relative z-10 transform rotate-2 group-hover:rotate-0 transition-transform duration-500">
                            <div className="flex items-center gap-4 mb-6 border-b border-white/5 pb-6">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-3xl shadow-lg">🐱</div>
                                <div>
                                    <div className="text-xl font-bold text-white">Simbin</div>
                                    <div className="text-xs text-orange-400 font-mono tracking-widest">LEVEL 9 HUNTER</div>
                                </div>
                                <div className="ml-auto text-2xl">🏆</div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[#1a1a2e] p-4 rounded-2xl">
                                    <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Prey Caught</div>
                                    <div className="text-2xl font-black text-white">8,492</div>
                                </div>
                                <div className="bg-[#1a1a2e] p-4 rounded-2xl">
                                    <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Reflexes</div>
                                    <div className="text-2xl font-black text-green-400">92ms</div>
                                </div>
                            </div>
                        </div>
                        {/* Decorative card behind */}
                        <div className="absolute top-4 left-4 w-full h-full bg-white/5 rounded-3xl -z-10 transform -rotate-3 border border-white/5"></div>
                    </div>
                </div>
            </section>

            {/* 🧠 CAT LOGIC */}
            <section className="py-24 px-6 bg-[#1a1a2e] border-y border-white/5">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">Who really owns the house?</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-red-500/10 p-8 rounded-3xl border border-red-500/20 hover:bg-red-500/20 transition-colors">
                            <h3 className="text-xl font-bold text-red-300 mb-4">Human Logic 🧠</h3>
                            <ul className="space-y-4 text-slate-400 text-sm">
                                <li>• "I bought you a $50 bed."</li>
                                <li>• "This toy mouse is static and boring."</li>
                                <li>• "Don't scratch the sofa!"</li>
                            </ul>
                        </div>
                        <div className="bg-green-500/10 p-8 rounded-3xl border border-green-500/20 hover:bg-green-500/20 transition-colors transform md:translate-y-4">
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

            {/* 💡 CAROUSEL */}
            <section className="py-24 bg-[#0a0a12] text-center overflow-hidden relative min-h-[400px] flex flex-col justify-center">
                <h2 className="fact-title text-sm font-bold tracking-[0.3em] text-purple-400 mb-12 uppercase transition-all">Cat Fact #392</h2>
                <div className="relative h-40 max-w-2xl mx-auto w-full">
                    {[
                        "Cats have 32 muscles in each ear, allowing them to rotate 180 degrees.",
                        "A cat's vision is tuned to movement. They can see a fly 10 meters away.",
                        "Purring is a self-healing mechanism. It creates vibrations that repair bone."
                    ].map((fact, i) => (
                        <div key={i} className="fact-card absolute inset-0 flex items-center justify-center px-6">
                            <p className="text-2xl md:text-3xl text-white font-light leading-relaxed">"{fact}"</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* 🤖 AUTONOMOUS SITTER (New Feature Promotion) */}
            <section className="relative py-32 px-6 overflow-hidden bg-[#131320]">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-green-500/10 via-transparent to-transparent pointer-events-none"></div>

                <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-16 relative z-10">
                    <div className="md:w-1/2 space-y-8">
                        <div className="inline-block px-4 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold tracking-widest border border-green-500/20">
                            NEW: AUTONOMOUS MODE
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">
                            The First Digital <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">Cat Sitter.</span>
                        </h2>
                        <p className="text-lg text-slate-300 leading-relaxed">
                            Guilt-free outings. <strong>Felis</strong> manages your cat's energy cycles while you're away.
                            It automatically cycles between <span className="text-green-400">High-Intensity Hunting</span> and <span className="text-slate-400">Deep Rest</span>, ensuring your cat stays active without overstimulation.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex items-center gap-3 text-sm text-slate-400">
                                <span className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">✓</span>
                                <span>Screens Always On</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-400">
                                <span className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">✓</span>
                                <span>Auto-Rest Timer</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-400">
                                <span className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">✓</span>
                                <span>100% Safe</span>
                            </div>
                        </div>
                    </div>

                    {/* Visual Representation of Loop */}
                    <div className="md:w-1/2 relative">
                        <div className="relative bg-[#0a0a12] rounded-3xl p-8 border border-white/10 shadow-2xl">
                            {/* Animated Loop Path */}
                            <svg className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <path d="M10,50 Q25,10 50,10 T90,50 Q75,90 50,90 T10,50" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-green-500 animate-[pulse_3s_infinite]" />
                            </svg>

                            <div className="space-y-4 relative z-10">
                                <div className="flex items-center justify-between bg-[#1a1a2e] p-4 rounded-xl border-l-4 border-purple-500">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">🐭</span>
                                        <div>
                                            <div className="font-bold text-white text-sm">Active Hunt</div>
                                            <div className="text-[10px] text-slate-500">Stimulating bursts</div>
                                        </div>
                                    </div>
                                    <div className="text-xs font-mono text-purple-400">3-5 min</div>
                                </div>

                                <div className="flex justify-center text-slate-600 text-xs">⬇️ Automatic Transition</div>

                                <div className="flex items-center justify-between bg-[#1a1a2e] p-4 rounded-xl border-l-4 border-slate-600 opacity-70">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">💤</span>
                                        <div>
                                            <div className="font-bold text-white text-sm">Deep Rest</div>
                                            <div className="text-[10px] text-slate-500">Screen dims/waits</div>
                                        </div>
                                    </div>
                                    <div className="text-xs font-mono text-slate-400">10-20 min</div>
                                </div>
                            </div>
                        </div>
                        {/* Glow behind */}
                        <div className="absolute -inset-10 bg-green-500/10 blur-[50px] -z-10 rounded-full"></div>
                    </div>
                </div>
            </section>

            {/* SCIENCE */}
            <section className="py-32 px-6 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] bg-fixed">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-20">
                        <div className="inline-block px-4 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm font-bold tracking-widest mb-4">NERD STUFF made FUN</div>
                        <h2 className="text-4xl md:text-5xl font-bold text-white">How We Tickle Their Brains</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard icon="👁️" badge="🌈" title="Magic Colors" desc="Cats see Blue and Green best. We use these specific colors to make the prey pop!" tag="Peak: 450nm" color="blue" />
                        <FeatureCard icon="🦋" badge="⚡" title="Real Movement" desc="It doesn't just bounce. It scampers, freezes, and hides like a real mouse." tag="Brownian Math" color="green" />
                        <FeatureCard icon="🐭" badge="🔊" title="Secret Whispers" desc="We use high-pitched squeaks (8kHz+) that cats love but humans barely notice." tag="Ultrasonic-ish" color="pink" />
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 text-center px-6 bg-[#0a0a12] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 to-transparent pointer-events-none"></div>
                <div className="max-w-2xl mx-auto relative z-10">
                    <h2 className="text-5xl md:text-6xl font-black text-white mb-8">
                        Ready to <span className="text-purple-400">Purr?</span>
                    </h2>
                    <p className="text-slate-400 mb-10 text-lg">
                        Zero Ads. Zero Stress. 100% Good Vibes.
                    </p>
                    <div className="flex flex-col items-center gap-8 w-full max-w-md mx-auto">

                        {/* 1. Disabled Public Button */}
                        <div className="relative group opacity-50 grayscale hover:opacity-70 transition-all cursor-not-allowed">
                            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur opacity-25"></div>
                            <button disabled className="relative inline-flex items-center gap-3 bg-slate-900/90 text-slate-400 font-bold text-lg px-8 py-4 rounded-full border border-white/10 cursor-not-allowed">
                                <span>START GAME</span>
                                <span className="bg-white/10 text-white/50 text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">Pending Release</span>
                            </button>
                        </div>

                        {/* 2. Alpha Access Card */}
                        <div className="w-full bg-[#151525] border border-green-500/20 p-6 rounded-3xl relative overflow-hidden group hover:border-green-500/40 transition-colors shadow-2xl">
                            {/* Beta Badge */}
                            <div className="absolute top-0 right-0 bg-green-500/20 text-green-400 text-[10px] font-bold px-3 py-1 rounded-bl-xl border-l border-b border-green-500/20 backdrop-blur-sm">
                                ALPHA ACCESS
                            </div>

                            <div className="text-left mb-6">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <span className="text-green-400">⚡</span> Early Access
                                </h3>
                                <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                                    Official launch is pending. Join our <strong>Alpha Squad</strong> to play now. (Requires invitation).
                                </p>
                            </div>

                            <div className="space-y-4">
                                {/* Direct Link */}
                                <a
                                    href="https://play.google.com/apps/internaltest/4701654757073828665"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-green-900/20 text-sm tracking-wide"
                                >
                                    DOWNLOAD DEMO <span className="opacity-70 font-normal ml-1">(Testers Only)</span>
                                </a>

                                {/* Divider */}
                                <div className="relative py-2">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-white/5"></div>
                                    </div>
                                    <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
                                        <span className="bg-[#151525] px-2 text-slate-600">Request Invite</span>
                                    </div>
                                </div>

                                {/* Email Form */}
                                {!requestSent ? (
                                    <form
                                        className="flex gap-2"
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            if (!email) return;
                                            const subject = "Felis Alpha Access Request";
                                            const body = `Hi Claudio!\n\nPlease add my email (${email}) to the Alpha Testers list.\n\nI want to test Felis! 😽`;
                                            window.location.href = `mailto:claudiodallaradev@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                                            setRequestSent(true);
                                        }}
                                    >
                                        <input
                                            type="email"
                                            placeholder="your@email.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-green-500/50 transition-colors placeholder:text-slate-600"
                                        />
                                        <button
                                            type="submit"
                                            className="bg-white/5 hover:bg-white/10 text-white font-bold px-4 rounded-xl transition-all border border-white/10"
                                        >
                                            →
                                        </button>
                                    </form>
                                ) : (
                                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-center animate-in fade-in zoom-in duration-300">
                                        <p className="text-green-400 text-sm font-bold">Opening Email App...</p>
                                        <p className="text-slate-500 text-[10px] mt-1">Send the email to confirm!</p>
                                        <button onClick={() => setRequestSent(false)} className="text-[10px] text-slate-400 underline mt-2 hover:text-white">Reset</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 flex justify-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all">
                        <span className="text-xs text-slate-600">Made with ❤️ for Salsa & Missy</span>
                    </div>
                </div>
            </section>
        </div>
    );
}

const FeatureCard = ({ icon, badge, title, desc, tag, color }: any) => {
    const colors: any = {
        blue: "text-blue-400 bg-blue-500/20 border-blue-500/50 text-blue-300",
        green: "text-green-400 bg-green-500/20 border-green-500/50 text-green-300",
        pink: "text-pink-400 bg-pink-500/20 border-pink-500/50 text-pink-300"
    };

    return (
        <div className={`bg-[#1a1a2e] p-8 rounded-3xl border border-white/5 hover:border-${color}-500/50 transition-all hover:-translate-y-2 group relative overflow-hidden`}>
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-8xl">{icon}</div>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 ${colors[color].split(' ')[1]} ${colors[color].split(' ')[0]}`}>{badge}</div>
            <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
            <p className="text-slate-400 text-sm mb-4">{desc}</p>
            <div className={`text-xs bg-black/30 inline-block px-3 py-1 rounded-lg ${colors[color].split(' ')[3]}`}>{tag}</div>
        </div>
    );
};
