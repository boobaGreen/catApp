import { Prey } from './Prey';
import { Particle } from './Particle';
import { AudioEngine } from './Audio';
import { HapticEngine } from './Haptics';
import { GameDirector } from './GameDirector';

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
    private ecosystemTimer: number = 0; // For "Passive Confidence"

    // Game State
    public score: number = 0;
    private scaleFactor: number = 1.0;
    public killCounts = { mouse: 0, insect: 0, worm: 0 };

    // External listeners
    public onKill?: (type: string) => void;
    private onSessionComplete: () => void;

    // Session Management
    private sessionPlayTime: number = 0;
    private sessionLimit: number = Infinity; // Seconds


    constructor(canvas: HTMLCanvasElement, onSessionComplete: () => void) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { alpha: true })!;
        this.bounds = { x: canvas.width, y: canvas.height };
        this.audio = new AudioEngine();
        this.haptics = new HapticEngine();
        this.stats = new StatsManager();
        this.director = new GameDirector();
        this.onSessionComplete = onSessionComplete;
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
            this.director.setScreenMode(true);
        } else if (width < 1024) {
            this.scaleFactor = 0.7; // Tablet
            this.director.setScreenMode(false);
        } else {
            this.scaleFactor = 1.0; // Desktop
            this.director.setScreenMode(false);
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

        // --- ECOSYSTEM TRIGGER ---
        // Cat won -> Prey gets scared
        this.director.reportEvent('kill');

        // --- STATS RECORDING ---
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

    public setSessionLimit(limitSeconds: number) {
        this.sessionLimit = limitSeconds;
    }

    private loop(timestamp: number) {
        if (!this.isRunning) return;

        const deltaTime = (timestamp - this.lastTime) / 1000;
        const safeDelta = Math.min(deltaTime, 0.1);
        this.lastTime = timestamp;

        // --- SESSION LIMIT CHECK ---
        this.sessionPlayTime += safeDelta;
        if (this.sessionPlayTime >= this.sessionLimit) {
            this.stop();
            this.onSessionComplete();
            return;
        }

        // --- STATS PLAYTIME ---
        this.timeSinceLastSave += safeDelta;
        if (this.timeSinceLastSave > 30) {
            this.stats.updatePlaytime(30);
            this.timeSinceLastSave -= 30;
        }

        // --- ECOSYSTEM DRIFT ---
        // Every 10 seconds of "Survival", prey gains confidence
        this.ecosystemTimer += safeDelta;
        if (this.ecosystemTimer > 10) {
            this.director.reportEvent('escape');
            this.ecosystemTimer = 0;
        }

        this.update(safeDelta);
        this.draw();

        requestAnimationFrame(this.loop.bind(this));
    }

    private update(deltaTime: number) {
        this.preys.forEach(prey => prey.update(deltaTime, this.bounds));

        // ETHOLOGICAL AUDIO TRIGGER: 1% chance per frame (approx every 1.6s at 60fps) to play rustle
        // This keeps the cat attentive even if looking away.
        if (Math.random() < 0.005) {
            this.audio.playRustle();
        }

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
