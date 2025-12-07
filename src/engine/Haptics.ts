export class HapticEngine {
    private enabled: boolean = true;

    constructor() {
        this.enabled = 'vibrate' in navigator;
    }

    public triggerKill() {
        if (!this.enabled) return;
        // Strong, jagged vibration for a "crunch" feel
        // [vibrate, pause, vibrate, pause...]
        try {
            navigator.vibrate([50, 30, 50, 30, 100]);
        } catch (e) {
            // Ignored
        }
    }

    public triggerPounce() {
        if (!this.enabled) return;
        // Short, sharp feedback
        try {
            navigator.vibrate(20);
        } catch (e) {
            // Ignored
        }
    }

    public setEnabled(enabled: boolean) {
        this.enabled = enabled && 'vibrate' in navigator;
    }
}
