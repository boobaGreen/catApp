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
        // Force laser if mode is laser
        if (currentMode === 'laser') {
            return {
                type: 'laser',
                count: 1, // Only 1 laser pointer usually
                speedMultiplier: 1.5 + (this.confidence * 0.5), // Faster if confident
                behaviorFlags: {
                    canFlee: false,
                    isEvasive: false
                }
            };
        }

        if (currentMode === 'butterfly') {
            return {
                type: 'butterfly',
                count: Math.random() > 0.7 ? 2 : 1, // Occasionally 2
                speedMultiplier: 0.9, // Fluttery
                behaviorFlags: {
                    canFlee: true,
                    isEvasive: true // Always evasive (flight path)
                }
            };
        }

        if (currentMode === 'feather') {
            return {
                type: 'feather',
                count: 1,
                speedMultiplier: 0.5, // Slow drift
                behaviorFlags: {
                    canFlee: false, // Feathers don't flee
                    isEvasive: false
                }
            };
        }

        if (currentMode === 'beetle') {
            return {
                type: 'beetle',
                count: 2, // Beetles are social/numerous
                speedMultiplier: 1.0,
                behaviorFlags: {
                    canFlee: true,
                    isEvasive: true
                }
            };
        }

        if (currentMode === 'firefly') {
            return {
                type: 'firefly',
                count: 3, // Swarm
                speedMultiplier: 0.8,
                behaviorFlags: {
                    canFlee: true,
                    isEvasive: true
                }
            };
        }

        if (currentMode === 'dragonfly') {
            return {
                type: 'dragonfly',
                count: 1, // Solitary hunter
                speedMultiplier: 1.5,
                behaviorFlags: {
                    canFlee: true,
                    isEvasive: true
                }
            };
        }

        if (currentMode === 'gecko') {
            return {
                type: 'gecko',
                count: 1, // Solitary
                speedMultiplier: 1.2,
                behaviorFlags: {
                    canFlee: true,
                    isEvasive: true
                }
            };
        }

        if (currentMode === 'spider') {
            return {
                type: 'spider',
                count: 1,
                speedMultiplier: 0.7, // Slower abseiling
                behaviorFlags: {
                    canFlee: true,
                    isEvasive: false // Relies on stillness/web
                }
            };
        }




        // Classic Logic
        const maxPrey = this.getMaxPreyCount();

        // High confidence (bold prey) -> More prey? Or faster prey?
        // Let's say high confidence = faster, slightly more freq spawn

        if (currentMode === 'minilaser') {
            return {
                type: 'minilaser',
                count: 1,
                speedMultiplier: 2.0 + (this.confidence * 0.5),
                behaviorFlags: { canFlee: false, isEvasive: false }
            };
        }

        if (currentMode === 'ornament') {
            return {
                type: 'ornament',
                count: 3 + Math.floor(this.confidence * 4), // Lots of ornaments!
                speedMultiplier: 0.5, // Sway speed
                behaviorFlags: { canFlee: false, isEvasive: false }
            };
        }

        if (currentMode === 'gingerbread') {
            return {
                type: 'gingerbread',
                count: 1 + Math.floor(Math.random() * 3), // Waves of cookies
                speedMultiplier: 1.5 + (this.confidence * 0.5), // Fast runners
                behaviorFlags: { canFlee: true, isEvasive: false } // Run straight but panic
            };
        }

        if (currentMode === 'snake') {
            return {
                type: 'snake',
                count: 1,
                speedMultiplier: 0.8,
                behaviorFlags: { canFlee: true, isEvasive: true }
            };
        }

        // Specific Classic Types
        if (currentMode === 'mouse') {
            return {
                type: 'mouse',
                count: 1,
                speedMultiplier: 1.0,
                behaviorFlags: { canFlee: true, isEvasive: Math.random() < 0.3 }
            };
        }
        if (currentMode === 'worm') {
            return {
                type: 'worm',
                count: 2, // Multiple worms
                speedMultiplier: 0.6,
                behaviorFlags: { canFlee: false, isEvasive: false }
            };
        }
        if (currentMode === 'insect') {
            return {
                type: 'insect',
                count: 2, // Flies
                speedMultiplier: 1.4, // Fast
                behaviorFlags: { canFlee: true, isEvasive: true }
            };
        }

        const types: ('mouse' | 'insect' | 'worm')[] = ['mouse', 'insect', 'worm'];
        const type = types[Math.floor(Math.random() * types.length)];

        return {
            type,
            count: Math.ceil(Math.random() * maxPrey),
            speedMultiplier: 0.8 + (this.confidence * 0.4),
            behaviorFlags: {
                canFlee: true,
                isEvasive: Math.random() < 0.3
            }
        };
    }

    public getMaxPreyCount(): number {
        // Mobile constraint
        if (this.isMobile) return 1;

        // Desktop: 1-2 based on confidence. 
        // If confidence is low (scared), maybe fewer? 
        // Actually, simple is fine.
        return 2;
    }
}
