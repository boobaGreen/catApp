export interface Vector2D {
    x: number;
    y: number;
}

export interface PreyEntity {
    id: string;
    position: Vector2D;
    velocity: Vector2D;
    type: 'mouse' | 'insect' | 'worm';
    state: 'search' | 'stalk' | 'pounce' | 'flee' | 'dead';
    color: string;
    size: number;
    update(deltaTime: number, bounds: Vector2D): void;
    draw(ctx: CanvasRenderingContext2D): void;
}
export interface GameStats {
    totalKills: number;
    totalPlaytime: number; // seconds
    sessions: number;
    lastPlayed: string; // ISO date
    preyPreference: {
        mouse: number;
        insect: number;
        worm: number;
    };
    highScore: number;
}
