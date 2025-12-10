
import { Prey } from './Prey';
import { Particle } from './Particle';
import { AudioEngine } from './Audio';
import { HapticEngine } from './Haptics';
import { GameDirector } from './GameDirector';

import type { Vector2D, SpawnConfig, GameStats, GameMode } from './types';
import { GAME_CONFIG } from './constants';

export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private preys: Prey[] = [];
    private particles: Particle[] = [];
    private audio: AudioEngine;
    private haptics: HapticEngine;
    private director: GameDirector;
    private isRunning: boolean = false;
    private lastTime: number = 0;
    private bounds: Vector2D;
    private timeSinceLastSave: number = 0;

    private currentMode: GameMode = 'classic';
    private allowedFavorites: GameMode[] = [];
    private idleTimer: number = 0;
    private readonly IDLE_THRESHOLD: number = 15;

    // Game State
    public score: number = 0;
    public sessionPlayTime: number = 0;
    public sessionLimit: number = Infinity;
    public onSessionComplete: () => void;

    // Callbacks for React State
    public onStatUpdate?: (delta: Partial<GameStats>) => void;
    public onKill?: (type: string) => void;

    private killCounts: { [key: string]: number } = { mouse: 0, insect: 0, worm: 0 };
    private scaleFactor: number = 1.0;

    constructor(
        canvas: HTMLCanvasElement,
        onSessionComplete: () => void,
        initialConfidence: number = 0.5
    ) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { alpha: true })!;
        this.bounds = { x: canvas.width, y: canvas.height };
        this.audio = new AudioEngine();
        this.haptics = new HapticEngine();
        this.director = new GameDirector(initialConfidence);
        this.onSessionComplete = onSessionComplete;
    }

    public start(mode: GameMode = 'classic', allowedFavorites: GameMode[] = []) {
        if (this.isRunning) return;
        this.currentMode = mode;
        this.allowedFavorites = allowedFavorites;
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
            this.reportPlaytime(Math.floor(this.timeSinceLastSave));
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

    private reportPlaytime(seconds: number) {
        if (this.onStatUpdate) {
            this.onStatUpdate({
                totalPlayTime: seconds,
            });
        }
    }

    private loop = () => {
        if (!this.isRunning) return;

        const now = performance.now();
        const deltaTime = (now - this.lastTime) / 1000;
        this.lastTime = now;

        this.update(deltaTime);
        this.draw();

        requestAnimationFrame(this.loop);
    }

    private update(deltaTime: number) {
        // Stats
        this.sessionPlayTime += deltaTime;

        // Idle Timer (Recall Logic)
        this.idleTimer += deltaTime;
        if (this.idleTimer > this.IDLE_THRESHOLD) {
            this.audio.playRecall();
            this.idleTimer = 0; // Reset to avoid spamming immediately (loop every 15s if ignored)
        }

        // Session Limit Check
        if (this.sessionPlayTime >= this.sessionLimit) {
            this.stop();
            if (this.onSessionComplete) this.onSessionComplete();
            return;
        }

        this.timeSinceLastSave += deltaTime;
        if (this.timeSinceLastSave > 5) {
            this.timeSinceLastSave = 0;
            // Intermediate save (optional)
        }

        // Ecosystem Timer (Passive confidence decay/gain?)
        // For now, simple.

        // Update Preys
        this.preys.forEach(prey => prey.update(deltaTime, this.bounds));

        // Update Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const alive = this.particles[i].update(deltaTime);
            if (!alive) {
                this.particles.splice(i, 1);
            }
        }
    }

    public handleTouch(x: number, y: number) {
        this.audio.userInput();
        this.idleTimer = 0; // Reset idle on interaction

        // 1. Create feedback particles
        this.spawnParticles(x, y, '#FFFFFF', 5);

        let hitAny = false;

        // 2. Check collisions
        this.preys.forEach(prey => {
            if (prey.state === 'dead') return;

            const dx = prey.position.x - x;
            const dy = prey.position.y - y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            const hitRadius = prey.size * GAME_CONFIG.KILL_RADIUS_MULTIPLIER;

            if (dist < hitRadius) {
                this.handleKill(prey);
                hitAny = true;
            } else if (dist < hitRadius * 2.5) {
                prey.triggerFlee({ x, y });
                this.audio.playSqueak(); // Keep generic squeak on flee/miss-close
                this.haptics.triggerPounce();
                hitAny = true;
            }
        });

        // 3. Audio Feedback for Miss
        if (!hitAny) {
            this.audio.playMiss();
        }
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
        if (this.onStatUpdate) {
            this.onStatUpdate({
                preyCaught: 1,
                catReflexesScore: 1, // Simplified increment
                preyCounts: {
                    mouse: prey.type === 'mouse' ? 1 : 0,
                    insect: prey.type === 'insect' ? 1 : 0,
                    worm: prey.type === 'worm' ? 1 : 0,
                    laser: prey.type === 'laser' ? 1 : 0,
                    butterfly: prey.type === 'butterfly' ? 1 : 0,
                    feather: prey.type === 'feather' ? 1 : 0,
                    beetle: prey.type === 'beetle' ? 1 : 0,
                    firefly: prey.type === 'firefly' ? 1 : 0,
                    dragonfly: prey.type === 'dragonfly' ? 1 : 0,
                    gecko: prey.type === 'gecko' ? 1 : 0,
                    spider: prey.type === 'spider' ? 1 : 0
                }
            });
        }

        if (this.onKill) {
            this.onKill(prey.type);
        }

        this.audio.playKillSound(prey.type);
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
        let modeToSpawn = this.currentMode;

        // Handle Favorites Logic
        if (this.currentMode === 'favorites' && this.allowedFavorites.length > 0) {
            const randomFav = this.allowedFavorites[Math.floor(Math.random() * this.allowedFavorites.length)];
            modeToSpawn = randomFav;
        }
        // Handle Shuffle Logic (if passed directly)
        else if (this.currentMode === 'shuffle') {
            const modes: GameMode[] = ['classic', 'laser', 'butterfly', 'feather', 'beetle', 'firefly', 'dragonfly', 'gecko', 'spider'];
            modeToSpawn = modes[Math.floor(Math.random() * modes.length)];
        }

        const config = this.director.decideNextSpawn(modeToSpawn);
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

    private draw() {
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.preys.forEach(prey => prey.draw(this.ctx));
        this.particles.forEach(p => p.draw(this.ctx));
    }

    public getScore(): number {
        return this.score;
    }

    public getKillCounts() {
        return this.killCounts;
    }

    public setAudioEnabled(enabled: boolean) {
        this.audio.setEnabled(enabled);
    }

    public setHapticsEnabled(enabled: boolean) {
        this.haptics.setEnabled(enabled);
    }
}
