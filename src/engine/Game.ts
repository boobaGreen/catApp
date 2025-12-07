import { Prey } from './Prey';
import { Particle } from './Particle';
import { AudioEngine } from './Audio';
import { HapticEngine } from './Haptics';
import { GameDirector } from './GameDirector';
import { DemoGameDirector } from './DemoGameDirector';
import { StatsManager } from './StatsManager';
import type { Vector2D, SpawnConfig } from './types';
import { GAME_CONFIG } from './constants';

export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private preys: Prey[] = [];
    private particles: Particle[] = [];
    private audio: AudioEngine;
    private haptics: HapticEngine;
    private director: GameDirector;
    private stats: StatsManager;
    private isRunning: boolean = false;
    private lastTime: number = 0;
    private bounds: Vector2D;
    private timeSinceLastSave: number = 0;

    // Game State
    public score: number = 0;
    private scaleFactor: number = 1.0;
    public killCounts = { mouse: 0, insect: 0, worm: 0 };

    // External listeners (no longer for stats, but generic if needed)
    public onKill?: (type: string) => void;

    constructor(canvas: HTMLCanvasElement, mode: 'demo' | 'pro' = 'pro') {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { alpha: true })!;
        this.bounds = { x: canvas.width, y: canvas.height };
        this.audio = new AudioEngine();
        this.haptics = new HapticEngine();
        this.stats = new StatsManager();

        // Director & Stats Strategy
        if (mode === 'demo') {
            this.director = new DemoGameDirector();
            this.stats.reset(); // RESET DB at start of Demo
        } else {
            this.director = new GameDirector();
        }
    }

    public start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTime = performance.now();

        // Initial Spawn if empty
        if (this.preys.length === 0) {
            this.spawnPreyDirector();
            this.spawnPreyDirector();
        }

        requestAnimationFrame(this.loop.bind(this));
    }

    public stop() {
        this.isRunning = false;
        // Save pending playtime on exit
        if (this.timeSinceLastSave > 0) {
            this.stats.updatePlaytime(Math.floor(this.timeSinceLastSave));
            this.timeSinceLastSave = 0;
        }
    }

    public resize(width: number, height: number) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.bounds = { x: width, y: height };

        if (width < 600) {
            this.scaleFactor = 0.5; // Mobile 
        } else if (width < 1024) {
            this.scaleFactor = 0.7; // Tablet
        } else {
            this.scaleFactor = 1.0; // Desktop
        }

        this.preys.forEach(prey => prey.resize(this.scaleFactor));
        this.draw();
    }

    public getScore(): number {
        return this.score;
    }

    public getKillCounts() {
        return this.killCounts;
    }

    public handleTouch(x: number, y: number) {
        this.audio.userInput();

        // 1. Create feedback particles
        this.spawnParticles(x, y, '#FFFFFF', 5);

        // 2. Check collisions
        this.preys.forEach(prey => {
            if (prey.state === 'dead') return;

            const dx = prey.position.x - x;
            const dy = prey.position.y - y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            const hitRadius = prey.size * GAME_CONFIG.KILL_RADIUS_MULTIPLIER;

            if (dist < hitRadius) {
                this.handleKill(prey);
            } else if (dist < hitRadius * 2.5) {
                prey.state = 'flee';
                this.audio.playSqueak();
                this.haptics.triggerPounce();
            }
        });
    }

    private handleKill(prey: Prey) {
        if (prey.state === 'dead') return;

        prey.state = 'dead';
        this.score += 1;

        if (prey.type in this.killCounts) {
            this.killCounts[prey.type]++;
        }

        // --- STATS RECORDING ---
        // Record kill immediately to DB (via StatsManager)
        // This ensures saving happens on the instance that was Reset()
        this.stats.recordKill(prey.type);

        if (this.onKill) {
            this.onKill(prey.type);
        }

        this.audio.playKillSound();
        this.haptics.triggerKill();

        this.spawnParticles(prey.position.x, prey.position.y, prey.color, 20);

        setTimeout(() => {
            this.preys = this.preys.filter(p => p.id !== prey.id);

            this.spawnPreyDirector();

            const maxPrey = this.director.getMaxPreyCount();
            if (this.preys.length < maxPrey) {
                // 50% chance to add another one
                if (Math.random() > 0.5) {
                    this.spawnPreyDirector();
                }
            }
        }, 100);
    }

    private spawnPreyDirector() {
        const config = this.director.decideNextSpawn();
        this.spawnPrey(config);
    }

    private spawnPrey(config: SpawnConfig) {
        const id = Math.random().toString(36).substr(2, 9);
        const prey = new Prey(id, config, this.bounds);
        prey.resize(this.scaleFactor);
        this.preys.push(prey);
    }

    private spawnParticles(x: number, y: number, color: string, count: number) {
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, color));
        }
    }

    private loop(timestamp: number) {
        if (!this.isRunning) return;

        const deltaTime = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;
        const safeDelta = Math.min(deltaTime, 0.1);

        // --- STATS PLAYTIME ---
        this.timeSinceLastSave += safeDelta;
        if (this.timeSinceLastSave > 30) {
            this.stats.updatePlaytime(30);
            this.timeSinceLastSave -= 30;
        }

        this.update(safeDelta);
        this.draw();

        requestAnimationFrame(this.loop.bind(this));
    }

    private update(deltaTime: number) {
        this.preys.forEach(prey => prey.update(deltaTime, this.bounds));

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const alive = this.particles[i].update(deltaTime);
            if (!alive) {
                this.particles.splice(i, 1);
            }
        }
    }

    public setAudioEnabled(enabled: boolean) {
        this.audio.setEnabled(enabled);
    }

    public setHapticsEnabled(enabled: boolean) {
        this.haptics.setEnabled(enabled);
    }

    private draw() {
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.preys.forEach(prey => prey.draw(this.ctx));
        this.particles.forEach(p => p.draw(this.ctx));
    }
}
