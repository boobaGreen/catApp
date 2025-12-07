export class AudioEngine {
    private ctx: AudioContext | null = null;
    private soundEnabled: boolean = true;

    constructor() {
        // Lazy init on first user interaction usually required, but we'll try to init
        try {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (e) {
            console.warn("AudioContext not supported");
        }
    }

    public setEnabled(enabled: boolean) {
        this.soundEnabled = enabled;
        console.log('Audio Enabled:', enabled);
    }

    public userInput() {
        // Resume context if suspended (browser policy)
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    public playSqueak() {
        if (!this.ctx || !this.soundEnabled) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        // Ethological tuning: 3kHz - 8kHz bursts
        // Random pitch high range
        const pitch = 3000 + Math.random() * 5000;
        osc.frequency.setValueAtTime(pitch, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(pitch * 0.5, this.ctx.currentTime + 0.1); // Pitch drop (chirp)

        // Short burst
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.2);
    }

    public playKillSound() {
        if (!this.ctx || !this.soundEnabled) return;

        // Crunch/Pop sound using noise buffer roughly or low osc
        // Simple version: Low frequency sweep
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, this.ctx.currentTime); // Low "thud"
        osc.frequency.linearRampToValueAtTime(50, this.ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }
}
