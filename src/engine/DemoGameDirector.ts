import { GameDirector } from './GameDirector';
import type { SpawnConfig } from './types';

export class DemoGameDirector extends GameDirector {
    private sessionStartTime: number;
    private readonly DEMO_DURATION = 60000; // 60 seconds Golden Minute

    constructor() {
        super();
        this.sessionStartTime = Date.now();
    }

    public decideNextSpawn(): SpawnConfig {
        const timePlayed = Date.now() - this.sessionStartTime;

        if (timePlayed < this.DEMO_DURATION) {
            // GOLDEN MINUTE: Use full parent logic
            return super.decideNextSpawn();
        } else {
            // DEMO EXPIRED: Force Level 1 (Mice only, Slow)
            return {
                type: 'mouse',
                speedMultiplier: 0.8,
                behaviorFlags: {
                    canFlee: false,
                    isEvasive: false
                }
            };
        }
    }

    // Optional: Method to check if demo is currently expired (for UI checks)
    public isDemoExpired(): boolean {
        return (Date.now() - this.sessionStartTime) > this.DEMO_DURATION;
    }
}
