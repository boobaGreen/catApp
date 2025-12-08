import { StatsManager } from './StatsManager';
import type { SpawnConfig } from './types';

export class GameDirector {
    private statsManager: StatsManager;
    private isMobile: boolean = false;

    constructor() {
        this.statsManager = new StatsManager();
    }

    public setScreenMode(isMobile: boolean) {
        this.isMobile = isMobile;
    }

    // Called by Game loop to notify ecosystem of events
    public reportEvent(type: 'kill' | 'escape' | 'spawn') {
        if (type === 'kill') {
            // Predator Wins -> Prey gets scared (Confidence drops)
            // Easier next time.
            this.statsManager.adjustConfidence(-2);
        } else if (type === 'escape') {
            // Prey Wins -> Prey gets cocky (Confidence rises)
            // Harder next time.
            this.statsManager.adjustConfidence(5);
        } else if (type === 'spawn') {
            // Passive Confidence Drift: Existing pushes it slightly up?
            // Actually, keep it simple: Kills lower it, Time raises it.
            // handled in Game.ts loop? No, keeping it reactive to events is safer.
        }
    }

    public decideNextSpawn(): SpawnConfig {
        const stats = this.statsManager.getStats();
        // 0 (Terrified) -> 100 (Apex)
        const confidence = stats.preyConfidence;

        // Base Config
        let config: SpawnConfig = {
            type: 'mouse',
            speedMultiplier: 1.0,
            behaviorFlags: { canFlee: false, isEvasive: false }
        };

        // 1. Determine Speed (Linear)
        // 0 Conf = 0.6x speed (Slow)
        // 50 Conf = 1.0x speed
        // 100 Conf = 1.6x speed
        config.speedMultiplier = 0.6 + (confidence / 100);

        // 2. Determine Behavior based on "Mood"
        if (confidence < 30) {
            // FEARFUL STATE
            // Slow, dumb, just wanders.
            config.type = Math.random() > 0.8 ? 'worm' : 'mouse'; // Mostly mice
            config.behaviorFlags.canFlee = false; // Too scared to run properly
            config.behaviorFlags.isEvasive = false;
        }
        else if (confidence < 70) {
            // BALANCED STATE (The Default)
            // Mix of Mouse/Insect/Worm
            const r = Math.random();
            if (r < 0.6) config.type = 'mouse';
            else if (r < 0.9) config.type = 'insect';
            else config.type = 'worm';

            config.behaviorFlags.canFlee = true; // Can run if touched
            config.behaviorFlags.isEvasive = Math.random() > 0.5;
        }
        else {
            // APEX STATE (Cocky)
            // Fast Insects, Evasive Mice
            const r = Math.random();
            if (r < 0.4) config.type = 'insect'; // Lots of bugs
            else config.type = 'mouse';

            config.speedMultiplier *= 1.2; // Extra boost
            config.behaviorFlags.canFlee = true;
            config.behaviorFlags.isEvasive = true; // Always dodging
        }

        return config;
    }

    public getMaxPreyCount(): number {
        const confidence = this.statsManager.getStats().preyConfidence;

        if (this.isMobile) {
            // Mobile: Tighter limits (1-3)
            if (confidence < 20) return 1; // Hiding
            if (confidence < 60) return 2; // Foraging
            return 3; // Swarming
        } else {
            // Tablet/Desktop: Full limits (2-4)
            if (confidence < 20) return 2; // Hiding
            if (confidence < 60) return 3; // Foraging
            return 4; // Swarming
        }
    }
}
