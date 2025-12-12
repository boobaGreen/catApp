
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

    private currentMode: GameMode = 'mouse';
    private allowedFavorites: GameMode[] = [];
    private idleTimer: number = 0;
    private readonly IDLE_THRESHOLD: number = 15;

    // Circuit Mode State


    // ...


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

    // ETHOLOGICAL TRIGGERS
    private highFreqTimer: number = 0;

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

    public start(mode: GameMode = 'mouse', allowedFavorites: GameMode[] = []) {
        if (this.isRunning) return;
        this.currentMode = mode;
        this.allowedFavorites = allowedFavorites;
        this.isRunning = true;
        this.lastTime = performance.now();
        this.idleTimer = 0;
        this.highFreqTimer = 0;

        // Play Epic Start Sound
        this.audio.playStartGame();

        // Check for special Christmas Jingle (REMOVED)



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
        let deltaTime = (now - this.lastTime) / 1000;
        this.lastTime = now;
        if (deltaTime > 0.1) deltaTime = 0.1; // Cap dt

        const dt = deltaTime;


        this.update(dt);
        this.draw();

        requestAnimationFrame(this.loop);
    }

    private update(deltaTime: number) {
        // Stats
        this.sessionPlayTime += deltaTime;

        // --- ETHOLOGICAL IDLE LOGIC ---
        this.idleTimer += deltaTime;
        this.highFreqTimer += deltaTime;

        // 1. HIGH FREQ ATTRACTOR (Curiosity): Plays every ~8-12 seconds if semi-idle or active
        // It peaks curiosity without being annoying (inaudible/sparkly to humans)
        if (this.highFreqTimer > 10) {
            if (Math.random() > 0.5) { // 50% chance to play every 10s
                this.audio.playHighFreqAttractor();
            }
            this.highFreqTimer = 0;
        }

        // 2. RECALL (Distress): Plays if truly idle (> IDLE_THRESHOLD)
        if (this.idleTimer > this.IDLE_THRESHOLD) {
            this.audio.playRecall();
            this.idleTimer = 0; // Reset to avoid spamming immediately

            // Also force a prey movement reset or "scared" jump to attract eye
            this.preys.forEach(p => p.triggerFlee({ x: this.bounds.x / 2, y: this.bounds.y / 2 }));
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
        const escapedIds: string[] = [];
        this.preys.forEach(prey => {
            prey.update(deltaTime, this.bounds);

            // CHECK ESCAPE
            // If prey wanders too far out, it has escaped.
            if (prey.state !== 'dead') {
                const margin = 150; // Allow some buffer for "Entering" logic
                if (prey.position.x < -margin || prey.position.x > this.bounds.x + margin ||
                    prey.position.y < -margin || prey.position.y > this.bounds.y + margin) {

                    // Only count as escape if it has lived for > 2 seconds (avoid spawn-kill-self)
                    // We can check internal timeOffset or just trust the logic.
                    escapedIds.push(prey.id);
                    this.director.reportEvent('escape');
                }
            }
        });

        // Toggle removal
        if (escapedIds.length > 0) {
            this.preys = this.preys.filter(p => !escapedIds.includes(p.id));
            // Immediate replacement for flow
            if (this.preys.length < this.director.getMaxPreyCount(this.currentMode)) {
                this.spawnPreyDirector();
            }
        }

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
        this.highFreqTimer = 0; // Reset attractor timer (cat is already here)

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
                    spider: prey.type === 'spider' ? 1 : 0,
                    snake: prey.type === 'snake' ? 1 : 0,
                    waterdrop: prey.type === 'waterdrop' ? 1 : 0,
                    fish: prey.type === 'fish' ? 1 : 0,

                }
            });
        }

        if (this.onKill) {
            this.onKill(prey.type);
        }

        this.audio.playKillSound(prey.type);
        this.haptics.triggerKill();

        // Determine Particle Type based on Prey
        let pType: 'circle' | 'square' | 'star' = 'circle';
        if (['laser', 'firefly', 'star'].includes(prey.type)) pType = 'star';
        if (['beetle', 'spider'].includes(prey.type)) pType = 'square';
        if (['dragonfly'].includes(prey.type)) pType = 'square'; // Glint

        this.spawnParticles(prey.position.x, prey.position.y, prey.color, 20, pType);

        setTimeout(() => {
            this.preys = this.preys.filter(p => p.id !== prey.id);

            this.spawnPreyDirector();

            const maxPrey = this.director.getMaxPreyCount(this.currentMode);
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
            const modes: GameMode[] = ['mouse', 'insect', 'worm', 'laser', 'butterfly', 'feather', 'beetle', 'firefly', 'dragonfly', 'gecko', 'spider', 'snake', 'waterdrop', 'fish'];
            modeToSpawn = modes[Math.floor(Math.random() * modes.length)];
        }
        // Handle Arena Logic (Global Chaos)
        else if (this.currentMode === 'arena') {
            const allModes: GameMode[] = ['mouse', 'insect', 'worm', 'laser', 'butterfly', 'feather', 'beetle', 'firefly', 'dragonfly', 'gecko', 'spider', 'snake', 'waterdrop', 'fish'];
            modeToSpawn = allModes[Math.floor(Math.random() * allModes.length)];
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

    private spawnParticles(x: number, y: number, color: string, count: number, type: 'circle' | 'square' | 'star' = 'circle') {
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, color, type));
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
