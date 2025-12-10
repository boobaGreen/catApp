import { useState, useRef, useEffect } from 'react';

export type TrackCategory = 'purr' | 'meow';

export interface Track {
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

export const useCatRadio = () => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isLooping, setIsLooping] = useState(false);
    const [activeCategory, setActiveCategory] = useState<TrackCategory | 'all'>('all');

    // Filter tracks
    const filteredTracks = activeCategory === 'all'
        ? TRACKS
        : TRACKS.filter(t => t.category === activeCategory);

    // Ensure index is valid when category changes
    const displayIndex = Math.min(currentTrackIndex, filteredTracks.length - 1);
    const currentTrack = filteredTracks[displayIndex] || filteredTracks[0];

    // Effect to update audio source
    useEffect(() => {
        if (audioRef.current) {
            // Only update src if it changed to avoid reloading same track
            if (audioRef.current.src.indexOf(currentTrack.src) === -1) {
                audioRef.current.src = currentTrack.src;
                if (isPlaying) {
                    audioRef.current.play().catch(e => console.warn("Autoplay blocked/Interrupted", e));
                }
            }
        }
    }, [currentTrack.src]);

    // Effect to handle play/pause state changes
    useEffect(() => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.play().catch(e => console.error("Play failed", e));
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying]);

    // Handle Volume/Mute
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.muted = isMuted;
        }
    }, [isMuted]);


    const togglePlay = () => {
        setIsPlaying(prev => !prev);
    };

    const nextTrack = () => {
        let nextIndex = displayIndex + 1;
        if (nextIndex >= filteredTracks.length) nextIndex = 0;
        setCurrentTrackIndex(nextIndex);
    };

    const prevTrack = () => {
        let prevIndex = displayIndex - 1;
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

    // When category changes, reset to first track of that category
    const setCategory = (cat: TrackCategory | 'all') => {
        setActiveCategory(cat);
        setCurrentTrackIndex(0);
        setIsPlaying(false);
    };

    const playTrackAtIndex = (index: number) => {
        setCurrentTrackIndex(index);
        setIsPlaying(true);
    };

    return {
        audioRef,
        isPlaying,
        currentTrack,
        filteredTracks,
        isMuted,
        isLooping,
        activeCategory,
        togglePlay,
        nextTrack,
        prevTrack,
        handleEnded,
        setIsMuted,
        setIsLooping,
        setCategory,
        playTrackAtIndex,
        // Expose setters if needed for direct control
        setIsPlaying
    };
};
