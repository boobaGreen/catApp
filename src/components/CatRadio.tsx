import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipForward, SkipBack, Repeat, Volume2, VolumeX, Heart, Mic2 } from 'lucide-react';

/* --- TRACKS CONFIG --- */
type TrackCategory = 'purr' | 'meow';

interface Track {
    id: string;
    title: string;
    category: TrackCategory;
    src: string;
}

const TRACKS: Track[] = [
    // PURRS
    { id: 'p1', title: 'Deep Rumbles', category: 'purr', src: '/audio/rumbling.mp3' },
    { id: 'p2', title: 'Calm Vibration', category: 'purr', src: '/audio/the-calm-purr-of-a-cat.mp3' },
    { id: 'p3', title: 'Sleepy Kitty', category: 'purr', src: '/audio/kitty-purrs.mp3' },
    { id: 'p4', title: 'Motorboat', category: 'purr', src: '/audio/rapid-cat-purring.mp3' },
    { id: 'p5', title: 'Soft Purr', category: 'purr', src: '/audio/the-sound-of-a-cute-cat-purring.mp3' },
    { id: 'p6', title: 'Classic Purr', category: 'purr', src: '/audio/purring-cat.mp3' },

    // MEOWS
    { id: 'm1', title: 'Attention Please', category: 'meow', src: '/audio/the-sound-of-a-domestic-cat-meowing.mp3' },
    { id: 'm2', title: 'Tiny Kittens', category: 'meow', src: '/audio/kittens-meowing-6.mp3' },
    { id: 'm3', title: 'Hungry Call', category: 'meow', src: '/audio/cat-moore.mp3' },
    { id: 'm4', title: 'Chatty Cat', category: 'meow', src: '/audio/cat-moore-2.mp3' },
    { id: 'm5', title: 'Squeaks', category: 'meow', src: '/audio/kittens-meowing.mp3' },
    { id: 'm6', title: 'Meow & Purr', category: 'meow', src: '/audio/meowing-and-purring.mp3' },
];

/* --- VISUALIZER COMPONENT --- */
const AudioVisualizer = ({ isPlaying }: { isPlaying: boolean }) => {
    return (
        <div className="flex items-end justify-center gap-1 h-12 w-full opacity-80">
            {[...Array(12)].map((_, i) => (
                <motion.div
                    key={i}
                    className="w-1.5 rounded-t-full bg-gradient-to-t from-purple-500 to-pink-400"
                    animate={{
                        height: isPlaying ? ['10%', '60%', '30%', '80%', '40%'] : '10%',
                    }}
                    transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        repeatType: 'mirror',
                        ease: "easeInOut",
                        delay: i * 0.05,
                    }}
                />
            ))}
        </div>
    );
};

/* --- MAIN COMPONENT --- */
interface CatRadioProps {
    variant?: 'full' | 'compact';
    onClose?: () => void;
}

export const CatRadio: React.FC<CatRadioProps> = ({ variant = 'full' }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isLooping, setIsLooping] = useState(false);
    const [activeCategory, setActiveCategory] = useState<TrackCategory | 'all'>('all');

    // Filter tracks
    const filteredTracks = activeCategory === 'all'
        ? TRACKS
        : TRACKS.filter(t => t.category === activeCategory);

    const currentTrack = filteredTracks[currentTrackIndex] || filteredTracks[0];

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.src = currentTrack.src;
            if (isPlaying) audioRef.current.play().catch(e => console.warn("Autoplay blocked", e));
        }
    }, [currentTrack.src]); // Only re-load if src changes

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const nextTrack = () => {
        let nextIndex = currentTrackIndex + 1;
        if (nextIndex >= filteredTracks.length) nextIndex = 0;
        setCurrentTrackIndex(nextIndex);
    };

    const prevTrack = () => {
        let prevIndex = currentTrackIndex - 1;
        if (prevIndex < 0) prevIndex = filteredTracks.length - 1;
        setCurrentTrackIndex(prevIndex);
    };

    const handleEnded = () => {
        if (isLooping) {
            audioRef.current?.play();
        } else {
            nextTrack();
        }
    };

    // Auto-select first track when category changes
    useEffect(() => {
        setCurrentTrackIndex(0);
        setIsPlaying(false);
    }, [activeCategory]);

    return (
        <div className={`
            relative overflow-hidden
            ${variant === 'full'
                ? 'w-full max-w-4xl mx-auto bg-[#12121a] rounded-[3rem] border border-white/10 p-8 md:p-12 shadow-2xl'
                : 'w-full h-full flex flex-col' // Compact fits into modal
            }
        `}>
            {/* Background Glows */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/10 blur-[100px] pointer-events-none" />

            <audio
                ref={audioRef}
                onEnded={handleEnded}
                muted={isMuted}
            />

            <div className={`flex flex-col ${variant === 'full' ? 'md:flex-row gap-12' : 'h-full gap-6'}`}>

                {/* LEFT: Player Controls */}
                <div className={`flex flex-col items-center justify-center ${variant === 'full' ? 'md:w-1/2' : 'w-full flex-1'}`}>

                    {/* Album Art / Visualizer Area */}
                    <div className="relative w-48 h-48 md:w-64 md:h-64 mb-8">
                        {/* Ring Animation */}
                        {isPlaying && (
                            <div className="absolute inset-0 rounded-full border border-white/10 animate-[ping_3s_linear_infinite]" />
                        )}
                        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-gray-900 to-black border-4 border-gray-800 shadow-xl flex items-center justify-center overflow-hidden">
                            <div className={`absolute inset-0 opacity-30 bg-gradient-to-tr ${currentTrack.category === 'purr' ? 'from-purple-500 to-indigo-600' : 'from-pink-500 to-rose-600'}`} />
                            <AudioVisualizer isPlaying={isPlaying} />
                        </div>
                    </div>

                    {/* Track Info */}
                    <div className="text-center mb-6">
                        <h3 className="text-2xl font-black text-white tracking-tight mb-1">{currentTrack.title}</h3>
                        <p className="text-xs font-mono text-purple-400 uppercase tracking-widest">
                            {currentTrack.category === 'purr' ? 'Purr Therapy' : 'Kitty Chaos'}
                        </p>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-6">
                        <button onClick={prevTrack} className="text-slate-400 hover:text-white transition-colors">
                            <SkipBack size={24} />
                        </button>

                        <button
                            onClick={togglePlay}
                            className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                        >
                            {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
                        </button>

                        <button onClick={nextTrack} className="text-slate-400 hover:text-white transition-colors">
                            <SkipForward size={24} />
                        </button>
                    </div>

                    <div className="flex gap-4 mt-6">
                        <button
                            onClick={() => setIsLooping(!isLooping)}
                            className={`p-2 rounded-full transition-all ${isLooping ? 'text-purple-400 bg-purple-400/10' : 'text-slate-500 hover:text-white'}`}
                        >
                            <Repeat size={18} />
                        </button>
                        <button
                            onClick={() => setIsMuted(!isMuted)}
                            className={`p-2 rounded-full transition-all ${isMuted ? 'text-red-400 bg-red-400/10' : 'text-slate-500 hover:text-white'}`}
                        >
                            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                        </button>
                    </div>
                </div>

                {/* RIGHT: Playlist */}
                <div className={`flex flex-col ${variant === 'full' ? 'md:w-1/2' : 'w-full hidden md:flex h-64'}`}>

                    {/* Category Filter */}
                    <div className="flex gap-2 mb-4 p-1 bg-white/5 rounded-xl self-start">
                        {(['all', 'purr', 'meow'] as const).map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`
                                    px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all
                                    ${activeCategory === cat ? 'bg-white text-black shadow-lg' : 'text-slate-400 hover:text-white'}
                                `}
                            >
                                {cat === 'all' ? 'All' : cat}
                            </button>
                        ))}
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2 max-h-[300px]">
                        {filteredTracks.map((track, idx) => (
                            <div
                                key={track.id}
                                onClick={() => { setCurrentTrackIndex(idx); setIsPlaying(true); }}
                                className={`
                                    group flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all border border-transparent
                                    ${currentTrack.id === track.id ? 'bg-white/10 border-white/10' : 'hover:bg-white/5 hover:border-white/5'}
                                `}
                            >
                                <div className={`
                                    w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm
                                    ${track.category === 'purr' ? 'bg-purple-500/20 text-purple-400' : 'bg-pink-500/20 text-pink-400'}
                                `}>
                                    {currentTrack.id === track.id && isPlaying ? (
                                        <div className="flex gap-0.5 items-end h-3">
                                            <div className="w-0.5 h-full bg-current animate-pulse" />
                                            <div className="w-0.5 h-2/3 bg-current animate-pulse delay-75" />
                                            <div className="w-0.5 h-full bg-current animate-pulse delay-150" />
                                        </div>
                                    ) : (
                                        track.category === 'purr' ? <Heart size={14} /> : <Mic2 size={14} />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className={`font-bold text-sm ${currentTrack.id === track.id ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
                                        {track.title}
                                    </div>
                                </div>
                                {currentTrack.id === track.id && (
                                    <div className="text-xs font-mono text-white/50">Playing</div>
                                )}
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
};
