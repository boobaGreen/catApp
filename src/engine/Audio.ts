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

    // THE SQUEAK: Sharp, high pitch (Frequency Modulation)
    public playSqueak() {
        if (!this.ctx || !this.soundEnabled) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        // Ethological tuning: 6kHz start -> drop fast
        // Simulates mouse distress
        const now = this.ctx.currentTime;
        osc.frequency.setValueAtTime(6000, now);
        osc.frequency.exponentialRampToValueAtTime(3000, now + 0.1);

        // Short burst
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.start();
        osc.stop(now + 0.2);
    }

    public playKillSound() {
        if (!this.ctx || !this.soundEnabled) return;

        // 1. High Pitch "Crit" (The Break)
        const oscHigh = this.ctx.createOscillator();
        const gainHigh = this.ctx.createGain();
        oscHigh.connect(gainHigh);
        gainHigh.connect(this.ctx.destination);

        oscHigh.type = 'square'; // Harsh sound
        oscHigh.frequency.setValueAtTime(800, this.ctx.currentTime);
        oscHigh.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.1);

        gainHigh.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gainHigh.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

        oscHigh.start();
        oscHigh.stop(this.ctx.currentTime + 0.1);

        // 2. Low Thud (The Impact)
        const oscLow = this.ctx.createOscillator();
        const gainLow = this.ctx.createGain();
        oscLow.connect(gainLow);
        gainLow.connect(this.ctx.destination);

        oscLow.type = 'triangle';
        oscLow.frequency.setValueAtTime(150, this.ctx.currentTime);
        oscLow.frequency.linearRampToValueAtTime(50, this.ctx.currentTime + 0.2);

        gainLow.gain.setValueAtTime(0.4, this.ctx.currentTime);
        gainLow.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

        oscLow.start();
        oscLow.stop(this.ctx.currentTime + 0.2);
    }
}
