import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Lock, Eye, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PrivacyPolicyPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#050508] z-[60] flex flex-col overflow-hidden text-slate-300 font-sans"
        >
            {/* Background Atmosphere */}
            <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[100px] rounded-full" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-900/10 blur-[100px] rounded-full" />
            </div>

            {/* Header */}
            <div className="relative z-10 p-6 md:p-8 flex items-center justify-between border-b border-white/5 bg-[#050508]/50 backdrop-blur-xl">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter italic text-white">
                        Privacy Policy
                    </h1>
                    <p className="text-xs text-slate-500 font-mono uppercase tracking-widest mt-1">
                        Transparency & trust
                    </p>
                </div>
                <button
                    onClick={() => navigate('/')}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/10 group"
                    aria-label="Back to Game"
                >
                    <ArrowLeft className="w-6 h-6 text-slate-300 group-hover:text-white transition-colors" />
                </button>
            </div>

            {/* Content Scroll Area */}
            <div className="relative z-10 flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                <div className="max-w-3xl mx-auto space-y-12 pb-24">

                    {/* Introduction */}
                    <div className="prose prose-invert prose-slate max-w-none">
                        <p className="lead text-lg text-slate-200">
                            At <strong>Felis</strong>, we believe privacy is a fundamental right.
                            This policy outlines how we handle your data with complete transparency.
                            In short: <strong>We do not harvest your personal data.</strong>
                        </p>
                        <p className="text-sm text-slate-500">
                            Last Updated: {new Date().toLocaleDateString()}
                        </p>
                    </div>

                    {/* Section 1: Data Collection */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                <Eye size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                                1. Information We Collect
                            </h2>
                        </div>
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/5 space-y-4">
                            <div>
                                <h3 className="text-white font-bold mb-1">Personal Information</h3>
                                <p className="text-sm leading-relaxed">
                                    We <strong>do not</strong> collect, store, or share any personally identifiable information (PII) such as your name, address, phone number, or email address. You can play Felis completely anonymously.
                                </p>
                            </div>
                            <div className="h-px bg-white/5" />
                            <div>
                                <h3 className="text-white font-bold mb-1">Game Data (Local Storage)</h3>
                                <p className="text-sm leading-relaxed">
                                    To improve your gaming experience, we save certain data directly on your device using <strong>Local Storage</strong>. This includes:
                                </p>
                                <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-slate-400 ml-2">
                                    <li>High scores and game statistics.</li>
                                    <li>Unlocked profiles and achievements.</li>
                                    <li>Settings preferences (audio, haptics, etc).</li>
                                </ul>
                                <p className="text-xs text-slate-500 mt-2 italic">
                                    This data remains on your device and is not transmitted to our servers unless you explicitly choose to use cloud save features (if available).
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 2: Third Party */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                                <Lock size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                                2. Third-Party Services
                            </h2>
                        </div>
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                            <p className="text-sm leading-relaxed mb-4">
                                We may use trusted third-party services to support our application infrastructure. These providers adhere to their own strict privacy policies.
                            </p>

                            <div className="space-y-4">
                                <div className="p-4 bg-black/20 rounded-xl border border-white/5">
                                    <h4 className="font-bold text-white text-sm mb-1">Google Play Services</h4>
                                    <p className="text-xs text-slate-400">
                                        Used for application distribution, in-app billing (Premium features), and anonymous crash reporting to help us fix bugs.
                                        <br />
                                        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline mt-1 inline-block">Google Privacy Policy</a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 3: Children */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-green-500/10 rounded-lg text-green-400">
                                <Shield size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                                3. Children's Privacy
                            </h2>
                        </div>
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                            <p className="text-sm leading-relaxed">
                                Felis is designed for a general audience. However, we are committed to protecting the privacy of children.
                            </p>
                            <p className="text-sm leading-relaxed mt-4">
                                We <strong>do not</strong> knowingly collect personal information from children under the age of 13. If you believe we have inadvertently collected such information, please contact us immediately, and we will remove it.
                            </p>
                        </div>
                    </section>

                    {/* Section 4: Contact */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-pink-500/10 rounded-lg text-pink-400">
                                <Mail size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                                4. Contact Us
                            </h2>
                        </div>
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                            <p className="text-sm leading-relaxed mb-4">
                                If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us.
                            </p>
                            <a href="mailto:claudiodallaradev@gmail.com" className="flex items-center gap-2 text-white font-bold hover:text-purple-400 transition-colors">
                                <Mail size={16} />
                                claudiodallaradev@gmail.com
                            </a>
                        </div>
                    </section>

                    <div className="text-center pt-12 border-t border-white/5">
                        <p className="text-[10px] text-slate-700 font-mono uppercase tracking-widest">
                            &copy; {new Date().getFullYear()} Felis Team. All Rights Reserved.
                        </p>
                    </div>

                </div>
            </div>
        </motion.div>
    );
};
