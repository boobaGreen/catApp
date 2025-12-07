import { StatsManager } from './StatsManager';
import type { SpawnConfig } from './types';

export class GameDirector {
    private statsManager: StatsManager;

    constructor() {
        this.statsManager = new StatsManager();
    }

    public getEra(totalKills: number): string {
        if (totalKills < 50) return "Awakening";
        if (totalKills < 250) return "Precision";
        if (totalKills < 1000) return "The Hunt";
        return "Apex Predator";
    }

    public decideNextSpawn(): SpawnConfig {
        const stats = this.statsManager.getStats();
        const kills = stats.totalKills;

        // Base Config
        let config: SpawnConfig = {
            type: 'mouse',
            speedMultiplier: 1.0,
            behaviorFlags: { canFlee: false, isEvasive: false }
        };

        // ERA I: Awakening (0-50)
        // Focus: Learn to track. Simple movement.
        if (kills < 50) {
            config.type = Math.random() > 0.9 ? 'worm' : 'mouse'; // 10% Worm (Teaser)
            config.speedMultiplier = 0.8 + (kills / 250);
        }

        // ERA II: Precision (50-250)
        // Focus: Small targets (Worms). Precision tap required.
        else if (kills < 250) {
            const roll = Math.random();
            if (roll < 0.5) config.type = 'mouse';
            else config.type = 'worm'; // 50% Worms

            config.speedMultiplier = 1.0 + ((kills - 50) / 1000);
            // Worms wiggle (evasive) but don't flee fast.
            config.behaviorFlags.isEvasive = true;
        }

        // ERA III: The Hunt (250-1000)
        // Focus: High Speed Chaos (Insects). Reflexes required.
        else if (kills < 1000) {
            const roll = Math.random();
            if (roll < 0.3) config.type = 'mouse';
            else if (roll < 0.6) config.type = 'worm';
            else config.type = 'insect'; // 40% Insects

            config.speedMultiplier = 1.2 + ((kills - 250) / 3000);
            config.behaviorFlags.canFlee = true; // Insects flee fast!
            config.behaviorFlags.isEvasive = true;
        }

        // ERA IV: Apex Predator (1000+)
        else {
            // Adaptive Logic: Spawn what they kill LEAST 
            const prefs = stats.preyPreference;
            const total = prefs.mouse + prefs.insect + prefs.worm + 1;

            const wMouse = 1 - (prefs.mouse / total);
            const wInsect = 1 - (prefs.insect / total);
            const wWorm = 1 - (prefs.worm / total);

            const sum = wMouse + wInsect + wWorm;
            const r = Math.random() * sum;

            if (r < wMouse) config.type = 'mouse';
            else if (r < wMouse + wInsect) config.type = 'insect';
            else config.type = 'worm';

            const logScale = Math.log(kills);
            config.speedMultiplier = Math.min(2.5, 1.5 + (logScale - 6.9) * 0.2);

            config.behaviorFlags.canFlee = true;
            config.behaviorFlags.isEvasive = true;
        }

        return config;
    }

    public getMaxPreyCount(): number {
        const kills = this.statsManager.getStats().totalKills;
        if (kills < 10) return 2;
        if (kills < 50) return 3;
        return 4; // Hard Cap for clarity
    }
}
