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

    // --- BIO-ACOUSTICS (Ethological Sound Design) ---

    // 1. THE CALL (Recall): Rhythmic Pishing (High frequency bursts)
    // Triggers "Search" instinct in idle cats.
    public playRecall() {
        if (!this.ctx || !this.soundEnabled) return;
        this.userInput();

        const now = this.ctx.currentTime;

        // Pattern: Squeak - Squeak - Pause - Squeak
        this.playTone(now, 4000, 8000, 0.1, 'sine');
        this.playTone(now + 0.15, 4500, 8500, 0.1, 'sine');
        this.playTone(now + 0.5, 4200, 8200, 0.15, 'sine');
    }

    // 2. MISS (Frustration): High-pass "Whoosh"
    // Triggers "Try Again" / Frustration (Dopamine loop)
    public playMiss() {
        if (!this.ctx || !this.soundEnabled || !this.noiseBuffer) return;
        this.userInput();

        const source = this.ctx.createBufferSource();
        source.buffer = this.noiseBuffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 8000; // Only high "air" sounds
        filter.Q.value = 1.0;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        source.start();
        source.stop(this.ctx.currentTime + 0.2);
    }

    // 3. ADAPTIVE KILL (Completion): Specific to prey type
    public playKillSound(preyType: string) {
        if (!this.ctx || !this.soundEnabled) return;
        this.userInput();

        const now = this.ctx.currentTime;

        // INSECTS (Beetle, Insect, Dragonfly) -> CRUNCH
        if (['beetle', 'insect', 'dragonfly', 'firefly'].includes(preyType)) {
            // Noise burst (Crunch)
            if (this.noiseBuffer) {
                const source = this.ctx.createBufferSource();
                source.buffer = this.noiseBuffer;

                const filter = this.ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.value = 1000;

                const gain = this.ctx.createGain();
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

                source.connect(filter);
                filter.connect(gain);
                gain.connect(this.ctx.destination);
                source.start();
                source.stop(now + 0.05);
            }
        }

        // DIGITAL (Laser, Firefly Alt) -> ZAP
        else if (['laser'].includes(preyType)) {
            this.playTone(now, 2000, 10000, 0.1, 'sawtooth', 0.1);
        }

        // SOFT (Feather, Butterfly, Mouse) -> SQUEAK/PUFF
        else if (['feather', 'butterfly', 'mouse'].includes(preyType)) {
            this.playTone(now, 1500, 500, 0.1, 'sine', 0.2);
            // Add a noise puff
            if (this.noiseBuffer) {
                const source = this.ctx.createBufferSource();
                source.buffer = this.noiseBuffer;
                const gain = this.ctx.createGain();
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
                source.connect(gain);
                gain.connect(this.ctx.destination);
                source.start();
                source.stop(now + 0.1);
            }
        }
        // MAMMALS (Worm, etc.) -> Original High Squeak + Thud
        else {
            // High Squeak (Distress)
            this.playTone(now, 1500, 500, 0.1, 'triangle', 0.2);
            // Thud (Impact)
            this.playTone(now, 100, 50, 0.15, 'square', 0.15);
        }
    }

    // 4. GAMEFLOW SOUNDS
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
