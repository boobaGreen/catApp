import type { GameStats } from './types';

const STORAGE_KEY = 'cat_engage_stats_v1';

const DEFAULT_STATS: GameStats = {
    totalKills: 0,
    totalPlaytime: 0,
    sessions: 0,
    lastPlayed: new Date().toISOString(),
    preyPreference: {
        mouse: 0,
        insect: 0,
        worm: 0,
    },
    highScore: 0,
};

export class StatsManager {
    public stats: GameStats;

    constructor() {
        this.stats = this.load();
    }

    private load(): GameStats {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                return { ...DEFAULT_STATS, ...JSON.parse(stored) };
            }
        } catch (e) {
            console.error('Failed to load stats', e);
        }
        return { ...DEFAULT_STATS };
    }

    private save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.stats));
        } catch (e) {
            console.error('Failed to save stats', e);
        }
    }

    public recordKill(type: string) {
        this.stats.totalKills += 1;

        switch (type) {
            case 'mouse': this.stats.preyPreference.mouse++; break;
            case 'insect': this.stats.preyPreference.insect++; break;
            case 'worm': this.stats.preyPreference.worm++; break;
        }

        this.stats.lastPlayed = new Date().toISOString();
        this.save();
    }

    public updatePlaytime(seconds: number) {
        this.stats.totalPlaytime += seconds;
        this.save();
    }

    public recordSession(score: number, _durationSeconds: number, _preyCounts?: { mouse: number, insect: number, worm: number }) {
        // Kept for compatibility if needed, but we now use granular methods.
        // We can just increment sessions here as an explicit "End of Session" marker
        this.stats.sessions += 1;

        // Note: we don't need to add duration/kills here if we did it incrementally,
        // BUT current CanvasStage logic does call this at the end.
        // So we should be careful not to double count.

        // Strategy: CanvasStage should ONLY call this for SESSION COUNT and maybe high score check.
        // It should NOT add kills/time if we are doing that live.

        if (score > this.stats.highScore) {
            this.stats.highScore = score;
        }

        this.save();
    }

    public getStats(): GameStats {
        return this.stats;
    }

    public reset() {
        this.stats = { ...DEFAULT_STATS };
        this.save();
    }
}
