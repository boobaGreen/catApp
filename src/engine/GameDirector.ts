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
                count: 1, // Single Gecko (User Requirement)
                speedMultiplier: 1.2,
                behaviorFlags: {
                    canFlee: true,
                    isEvasive: true
                }
            };
        }

        if (currentMode === 'snake') {
            return {
                type: 'snake',
                count: 1, // Single Snake (User Requirement)
                speedMultiplier: 1.0,
                behaviorFlags: {
                    canFlee: true,
                    isEvasive: true
                }
            };
        }

        if (currentMode === 'waterstream') {
            return {
                type: 'waterstream',
                count: 1, // Single Waterfall Emitter
                speedMultiplier: 1.0,
                behaviorFlags: { canFlee: false, isEvasive: false }
            };
        }

        if (currentMode === 'waterdrop') {
            return {
                type: 'waterdrop',
                count: Math.random() > 0.5 ? 3 : 2, // Raindrops come in groups
                speedMultiplier: 1.2, // Falling speed
                behaviorFlags: { canFlee: false, isEvasive: false }
            };
        }

        if (currentMode === 'fish') {
            return {
                type: 'fish',
                count: 1, // Solitary usually
                speedMultiplier: 0.6, // Slow swimming
                behaviorFlags: { canFlee: true, isEvasive: true }
            };
        }



        // SPIDER: Solitary. 


        // Specific Classic Types
        if (currentMode === 'mouse') {
            return {
                type: 'mouse',
                count: 1, // Solitary
                speedMultiplier: 1.0,
                behaviorFlags: { canFlee: true, isEvasive: true } // Mice form cognitive maps -> evasive
            };
        }
        if (currentMode === 'worm') {
            return {
                type: 'worm',
                count: 3, // Cluster
                speedMultiplier: 0.5,
                behaviorFlags: { canFlee: false, isEvasive: false }
            };
        }
        if (currentMode === 'insect') {
            return {
                type: 'insect',
                count: Math.random() > 0.5 ? 2 : 1, // 1-2
                speedMultiplier: 1.6, // Very Fast
                behaviorFlags: { canFlee: true, isEvasive: true }
            };
        }

        const types: ('mouse' | 'insect' | 'worm')[] = ['mouse', 'insect', 'worm'];
        const type = types[Math.floor(Math.random() * types.length)];
        const maxPrey = this.getMaxPreyCount();

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
