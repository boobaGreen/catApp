import { Prey } from './Prey';
import { Particle } from './Particle';
import { AudioEngine } from './Audio';
import { HapticEngine } from './Haptics';
import type { Vector2D } from './types';
import { GAME_CONFIG } from './constants';

export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private preys: Prey[] = [];
    private particles: Particle[] = [];
    private audio: AudioEngine;
    private haptics: HapticEngine;
    private isRunning: boolean = false;
    private lastTime: number = 0;
    private bounds: Vector2D;

    // Game State
    public score: number = 0;
    private scaleFactor: number = 1.0;
    public killCounts = { mouse: 0, insect: 0, worm: 0 };
    // Callback for external stats management
    public onKill?: (type: string) => void;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        // Enable alpha to allow seeing background colors if needed, but we fill black
        this.ctx = canvas.getContext('2d', { alpha: true })!;
        this.bounds = { x: canvas.width, y: canvas.height };
        this.audio = new AudioEngine();
        this.haptics = new HapticEngine();
    }

    public start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTime = performance.now();

        // Initial Spawn if empty
        if (this.preys.length === 0) {
            this.spawnPrey('mouse');
            this.spawnPrey('insect');
        }

        requestAnimationFrame(this.loop.bind(this));
    }

    public stop() {
        this.isRunning = false;
    }

    public resize(width: number, height: number) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.bounds = { x: width, y: height };

        // Calculate Scale Factor
        if (width < 600) {
            this.scaleFactor = 0.5; // Mobile (User Req: Even smaller)
        } else if (width < 1024) {
            this.scaleFactor = 0.7; // Tablet
        } else {
            this.scaleFactor = 1.0; // Desktop
        }

        console.log(`Resizing: ${width}x${height} -> Scale: ${this.scaleFactor}`);

        // Resize existing entities
        this.preys.forEach(prey => prey.resize(this.scaleFactor));

        // Force a draw immediately after resize
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

        // Track specific kill
        if (prey.type in this.killCounts) {
            this.killCounts[prey.type]++;
        }

        // Notify listener - Auto-Save logic hook
        if (this.onKill) {
            this.onKill(prey.type);
        }

        this.audio.playKillSound();
        this.haptics.triggerKill();

        this.spawnParticles(prey.position.x, prey.position.y, prey.color, 20);

        setTimeout(() => {
            this.preys = this.preys.filter(p => p.id !== prey.id);
            const maxPrey = 3 + Math.floor(this.score / 10);
            this.spawnPreyRandom();

            if (this.preys.length < maxPrey && Math.random() > 0.5) {
                this.spawnPreyRandom();
            }
        }, 100);
    }

    private spawnPreyRandom() {
        const types: ('mouse' | 'insect' | 'worm')[] = ['mouse', 'insect', 'worm'];
        const randomType = types[Math.floor(Math.random() * types.length)];
        this.spawnPrey(randomType);
    }

    private spawnPrey(type: 'mouse' | 'insect' | 'worm') {
        const id = Math.random().toString(36).substr(2, 9);
        const prey = new Prey(id, type, this.bounds);
        prey.resize(this.scaleFactor); // Apply current scale
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
        // Clear - Black
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw Preys
        this.preys.forEach(prey => prey.draw(this.ctx));

        // Draw Particles
        this.particles.forEach(p => p.draw(this.ctx));
    }
}
