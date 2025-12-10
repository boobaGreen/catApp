export class AudioEngine {
    private ctx: AudioContext | null = null;
    private soundEnabled: boolean = true;

    private noiseBuffer: AudioBuffer | null = null;

    constructor() {
        // Lazy init on first user interaction usually required, but we'll try to init
        try {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.createNoiseBuffer();
        } catch (e) {
            console.warn("AudioContext not supported");
        }
    }

    private createNoiseBuffer() {
        if (!this.ctx) return;
        // 2 seconds of white noise
        const bufferSize = this.ctx.sampleRate * 2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        this.noiseBuffer = buffer;
    }

    public setEnabled(enabled: boolean) {
        this.soundEnabled = enabled;
        console.log('Audio Enabled:', enabled);

        // Resume context if enabling
        if (enabled && this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    public userInput() {
        // Resume context if suspended (browser policy)
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // THE RUSTLE: 8kHz - 12kHz Bandpass Noise (Triggers "Hidden Prey" instinct)
    public playRustle() {
        if (!this.ctx || !this.soundEnabled || !this.noiseBuffer) return;

        const source = this.ctx.createBufferSource();
        source.buffer = this.noiseBuffer;
        source.loop = false;

        // Bandpass Filter
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 10000; // Center 10kHz
        filter.Q.value = 1.0; // Wide enough for 8-12kHz range

        const gain = this.ctx.createGain();
        // Faint sound
        gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.0, this.ctx.currentTime + 0.5);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        source.start();
        source.stop(this.ctx.currentTime + 0.5);
    }

    // --- BIO-ACOUSTICS (Scientific Cat Attraction) ---

    // 1. HIGH FREQUENCY ATTRACTOR (Curiosity Logic)
    // Cats can hear up to 64kHz. Most speakers cap at 20kHz.
    // We target the 12kHz - 18kHz "shimmer" range which is audible but "glittery" to humans,
    // and highly stimulating to cats (mimics rodent chatter/rustle high harmonics).
    public playHighFreqAttractor() {
        if (!this.ctx || !this.soundEnabled) return;
        this.userInput();
        const now = this.ctx.currentTime;

        // A rapid, rising sweep (chirp) in the high registers
        this.playTone(now, 12000, 16000, 0.1, 'sine', 0.05);
        this.playTone(now + 0.15, 14000, 18000, 0.1, 'sine', 0.05);
    }

    // 2. THE RECALL (Prey Distress Mimicry)
    // "Pishing" sound used by birders/ethologists to attract predators.
    // Broad spectrum noise burst + high tonal squeak.
    public playRecall() {
        if (!this.ctx || !this.soundEnabled) return;
        this.userInput();

        const now = this.ctx.currentTime;

        // Pattern: Squeak - Rustle - Squeak
        // Squeak
        this.playTone(now, 4500, 8000, 0.1, 'triangle', 0.15);

        // Rustle (Brush)
        if (this.noiseBuffer) {
            const source = this.ctx.createBufferSource();
            source.buffer = this.noiseBuffer;
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 8000;
            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.1, now + 0.1);
            gain.gain.linearRampToValueAtTime(0, now + 0.3);
            source.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);
            source.start(now + 0.1);
            source.stop(now + 0.3);
        }

        // Squeak 2
        this.playTone(now + 0.4, 5000, 7000, 0.1, 'triangle', 0.15);
    }

    // 3. FRUSTRATION (Miss Sound)
    // High-pass "Whoosh". Triggers "Try Again" dopamine loop.
    // Important: Must not be unpleasant, just "empty".
    public playMiss() {
        if (!this.ctx || !this.soundEnabled || !this.noiseBuffer) return;
        this.userInput();

        const source = this.ctx.createBufferSource();
        source.buffer = this.noiseBuffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 4000; // Air sound
        filter.Q.value = 0.5;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        source.start();
        source.stop(this.ctx.currentTime + 0.2);
    }

    // 4. SATISFACTION (Kill Sound)
    // Must provide tactile audio feedback confirming the catch.
    public playKillSound(preyType: string) {
        if (!this.ctx || !this.soundEnabled) return;
        this.userInput();

        const now = this.ctx.currentTime;

        // INSECTS/CRUNCHY (Beetle, Insect, Dragonfly) -> CRUNCH
        // Short, high-frequency noise burst
        if (['beetle', 'insect', 'dragonfly', 'firefly', 'spider'].includes(preyType)) {
            if (this.noiseBuffer) {
                const source = this.ctx.createBufferSource();
                source.buffer = this.noiseBuffer;

                const filter = this.ctx.createBiquadFilter();
                filter.type = 'highpass';
                filter.frequency.value = 2000;

                const gain = this.ctx.createGain();
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08); // Very short "Snap"

                source.connect(filter);
                filter.connect(gain);
                gain.connect(this.ctx.destination);
                source.start();
                source.stop(now + 0.08);
            }
        }

        // DIGITAL (Laser, Minilaser) -> ZAP
        else if (['laser', 'minilaser'].includes(preyType)) {
            // Synthesized Zap
            this.playTone(now, 3000, 500, 0.1, 'sawtooth', 0.1);
        }

        // SOFT/MAMMALS (Mouse, Feather, Butterfly) -> SQUEAK/PUFF
        else if (['feather', 'butterfly'].includes(preyType)) {
            // Soft puff (Low pass noise)
            if (this.noiseBuffer) {
                const source = this.ctx.createBufferSource();
                source.buffer = this.noiseBuffer;
                const filter = this.ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.value = 500;

                const gain = this.ctx.createGain();
                gain.gain.setValueAtTime(0.4, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

                source.connect(filter);
                filter.connect(gain);
                gain.connect(this.ctx.destination);
                source.start();
                source.stop(now + 0.15);
            }
        }
        // MAMMALS (Mouse, Gecko, Worm) -> Squeak + Thud
        else {
            // High Squeak (Distress)
            this.playTone(now, 2500, 4000, 0.1, 'square', 0.1);
            // Thud (Impact)
            this.playTone(now, 150, 50, 0.1, 'sine', 0.5);
        }
    }

    // 5. GAMEFLOW SOUNDS
    public playStartGame() {
        if (!this.ctx || !this.soundEnabled) return;
        this.userInput();
        const now = this.ctx.currentTime;
        // Ascending Major Triad (C5 - E5 - G5 - C6)
        this.playTone(now, 523.25, 523.25, 0.1, 'sine', 0.2);
        this.playTone(now + 0.1, 659.25, 659.25, 0.1, 'sine', 0.2);
        this.playTone(now + 0.2, 783.99, 783.99, 0.1, 'sine', 0.2);
        this.playTone(now + 0.3, 1046.50, 1046.50, 0.4, 'sine', 0.2);
    }

    public playCircuitSwitch() {
        if (!this.ctx || !this.soundEnabled) return;
        this.userInput();
        const now = this.ctx.currentTime;
        // Sci-Fi "Switch" sound: Rapid sweep
        this.playTone(now, 800, 2000, 0.2, 'square', 0.1);
    }

    // Helper for synth tones
    private playTone(startTime: number, freqStart: number, freqEnd: number, duration: number, type: OscillatorType, volume: number = 0.1) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freqStart, startTime);
        osc.frequency.exponentialRampToValueAtTime(freqEnd, startTime + duration);

        gain.gain.setValueAtTime(volume, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
    }

    // Legacy Squeak (kept for generic events)
    public playSqueak() {
        this.playTone(this.ctx?.currentTime || 0, 2000, 1000, 0.1, 'triangle');
    }
}
