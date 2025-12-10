export interface Vector2D {
    x: number;
    y: number;
}

export interface PreyEntity {
    id: string;
    position: Vector2D;
    velocity: Vector2D;
    type: 'mouse' | 'insect' | 'worm' | 'laser' | 'butterfly' | 'feather' | 'beetle' | 'firefly' | 'dragonfly' | 'gecko' | 'spider' | 'minilaser' | 'snake' | 'ornament' | 'gingerbread';
    state: 'search' | 'stalk' | 'pounce' | 'flee' | 'dead';
    color: string;
    size: number;
    update(deltaTime: number, bounds: Vector2D): void;
    draw(ctx: CanvasRenderingContext2D): void;
}
export type GameMode = 'mouse' | 'insect' | 'worm' | 'laser' | 'minilaser' | 'shuffle' | 'butterfly' | 'feather' | 'beetle' | 'firefly' | 'dragonfly' | 'gecko' | 'spider' | 'snake' | 'favorites' | 'arena' | 'circuit' | 'ornament' | 'gingerbread';

export interface CatProfile {
    id: string;
    name: string;
    avatarColor: string; // Hex code or tailwind class
    avatarIcon?: string; // Icon name from Lucide (index or id)
    favorites: GameMode[];
    stats: GameStats;
}

export interface GameStats {
    totalPlayTime: number; // Seconds
    sessionsCompleted: number;
    catReflexesScore: number; // 0-100 based on reaction time
    preyCaught: number;
    distanceTraveled: number; // approx pixel distance / PCM
    preyConfidence: number; // 0-1 (dynamic difficulty) - made required

    // Detailed Stats (restored for UI)
    preyCounts?: {
        mouse: number;
        insect: number;
        worm: number;
        laser: number;
        butterfly: number;
        feather: number;
        beetle: number;
        firefly: number;
        dragonfly: number;
        gecko: number;
        spider: number;
        minilaser: number;
        snake: number;
        ornament: number;
        gingerbread: number;
    };
    highScore: number;
    lastPlayed?: string; // ISO Date

    // Per-Game Stats
    favoriteMode?: GameMode;
}

export interface SpawnConfig {
    type: 'mouse' | 'insect' | 'worm' | 'laser' | 'butterfly' | 'feather' | 'beetle' | 'firefly' | 'dragonfly' | 'gecko' | 'spider' | 'minilaser' | 'snake' | 'ornament' | 'gingerbread';
    count: number;
    speedMultiplier: number;
    behaviorFlags: {
        canFlee: boolean;
        isEvasive: boolean;
    };
}
