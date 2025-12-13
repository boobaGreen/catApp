import type { SpawnConfig, GameMode } from './types';

export class GameDirector {
    private isMobile: boolean = false;
    private confidence: number;

    constructor(initialConfidence: number = 0.5) {
        this.confidence = initialConfidence;
    }

    public setScreenMode(isMobile: boolean) {
        this.isMobile = isMobile;
    }

    // Called by Game loop to notify ecosystem of events
    public reportEvent(type: 'kill' | 'escape' | 'spawn') {
        if (type === 'kill') {
            // Predator Wins -> Prey gets scared (Confidence drops)
            // Easier next time.
            this.confidence = Math.max(0, this.confidence - 0.1);
        } else if (type === 'escape') {
            // Predator Fails -> Prey gets bold (Confidence rises)
            // Harder next time.
            this.confidence = Math.min(1, this.confidence + 0.05);
        }
    }

    public getConfidence(): number {
        return this.confidence;
    }

    public decideNextSpawn(currentMode: GameMode): SpawnConfig {
        // GLOBAL RULES:
        // 1. Single Entity (count = 1)
        // 2. Adaptive Difficulty (Speed scales with confidence)

        const baseMultiplier = 1.0 + (this.confidence * 0.5); // 1.0x to 1.5x speed

        let config: SpawnConfig = {
            type: 'mouse',
            count: 1,
            speedMultiplier: 1.0,
            behaviorFlags: { canFlee: true, isEvasive: true }
        };

        if (currentMode === 'laser') {
            config = {
                type: 'laser',
                count: 1,
                speedMultiplier: 1.5 + (this.confidence * 0.8), // Laser gets faster
                behaviorFlags: { canFlee: false, isEvasive: false }
            };
        }
        else if (currentMode === 'butterfly') {
            config = {
                type: 'butterfly',
                count: 1,
                speedMultiplier: 0.9 * baseMultiplier,
                behaviorFlags: { canFlee: true, isEvasive: true }
            };
        }
        else if (currentMode === 'feather') {
            config = {
                type: 'feather',
                count: 1,
                speedMultiplier: 0.5 * baseMultiplier,
                behaviorFlags: { canFlee: false, isEvasive: false }
            };
        }
        else if (currentMode === 'beetle') {
            config = {
                type: 'beetle',
                count: 1,
                speedMultiplier: 1.0 * baseMultiplier,
                behaviorFlags: { canFlee: true, isEvasive: true }
            };
        }
        else if (currentMode === 'firefly') {
            config = {
                type: 'firefly',
                count: 1,
                speedMultiplier: 0.8 * baseMultiplier,
                behaviorFlags: { canFlee: true, isEvasive: true }
            };
        }
        else if (currentMode === 'dragonfly') {
            config = {
                type: 'dragonfly',
                count: 1,
                speedMultiplier: 1.5 * baseMultiplier,
                behaviorFlags: { canFlee: true, isEvasive: true }
            };
        }
        else if (currentMode === 'gecko') {
            config = {
                type: 'gecko',
                count: 1,
                speedMultiplier: 1.2 * baseMultiplier,
                behaviorFlags: { canFlee: true, isEvasive: true }
            };
        }
        else if (currentMode === 'snake') {
            config = {
                type: 'snake',
                count: 1,
                speedMultiplier: 1.0 * baseMultiplier,
                behaviorFlags: { canFlee: true, isEvasive: true }
            };
        }
        else if (currentMode === 'waterdrop') {
            config = {
                type: 'waterdrop',
                count: 1,
                speedMultiplier: 1.2, // Gravity constant
                behaviorFlags: { canFlee: false, isEvasive: false }
            };
        }
        else if (currentMode === 'fish') {
            config = {
                type: 'fish',
                count: 1,
                speedMultiplier: 0.6 * baseMultiplier,
                behaviorFlags: { canFlee: true, isEvasive: true }
            };
        }
        else if (currentMode === 'worm') {
            config = {
                type: 'worm',
                count: 1,
                speedMultiplier: 1.0 * baseMultiplier,
                behaviorFlags: { canFlee: false, isEvasive: false }
            };
        }
        else if (currentMode === 'spider') {
            config = {
                type: 'spider',
                count: 1,
                speedMultiplier: 1.0 * baseMultiplier,
                behaviorFlags: { canFlee: true, isEvasive: true }
            };
        }
        else {
            // Default Mouse
            config = {
                type: 'mouse',
                count: 1,
                speedMultiplier: 1.0 * baseMultiplier,
                behaviorFlags: { canFlee: true, isEvasive: true }
            };
        }

        return config;
    }

    public getMaxPreyCount(mode?: GameMode): number {
        // Strict Single Predator Modes (Always 1, even on Desktop)
        // User Request: "Solo 1 topo sempre"
        if (mode === 'mouse' || mode === 'gecko' || mode === 'snake' || mode === 'dragonfly' || mode === 'laser') {
            return 1;
        }

        // Mobile constraint (Everything else is 1 on mobile)
        if (this.isMobile) return 1;

        // Desktop default (Swarm modes like insect, butterfly, etc can be > 1)
        return 2;
    }
}
