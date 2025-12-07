import { createNoise2D } from 'simplex-noise';
import type { PreyEntity, Vector2D } from './types';
import { GAME_CONFIG } from './constants';

const noise2D = createNoise2D();

export class Prey implements PreyEntity {
    id: string;
    position: Vector2D;
    velocity: Vector2D;
    type: 'mouse' | 'insect' | 'worm';
    state: 'search' | 'stalk' | 'flee' | 'dead';
    color: string;
    size: number;

    // Internal state
    private baseSize: number;
    private baseSpeed: number;
    private timeOffset: number;
    private currentSpeed: number;
    private targetSpeed: number;
    private stopGoTimer: number;
    private isStopped: boolean;
    private tailPhase: number = 0;

    constructor(id: string, type: 'mouse' | 'insect' | 'worm', bounds: Vector2D) {
        this.id = id;
        this.type = type;
        this.state = 'search';
        this.timeOffset = Math.random() * 1000;
        this.stopGoTimer = Math.random() * 2000;
        this.isStopped = false;

        this.position = {
            x: Math.random() * bounds.x,
            y: Math.random() * bounds.y
        };

        this.velocity = { x: 0, y: 0 };

        switch (type) {
            case 'insect':
                this.color = '#32CD32'; // Lime Green
                this.baseSize = GAME_CONFIG.SIZE_INSECT;
                this.baseSpeed = GAME_CONFIG.SPEED_RUN * 1.2;
                break;
            case 'worm':
                this.color = '#FFFF00'; // Yellow
                this.baseSize = GAME_CONFIG.SIZE_MOUSE * 0.8;
                this.baseSpeed = GAME_CONFIG.SPEED_STALK;
                break;
            case 'mouse':
            default:
                this.color = '#00BFFF'; // Deep Sky Blue
                this.baseSize = GAME_CONFIG.SIZE_MOUSE;
                this.baseSpeed = GAME_CONFIG.SPEED_RUN;
                break;
        }

        // Initial set (safeguard)
        this.size = this.baseSize;
        this.targetSpeed = this.baseSpeed;
        this.currentSpeed = this.targetSpeed;
    }

    public resize(scale: number) {
        this.size = this.baseSize * scale;
        // Scale speed to maintain relative pace on smaller screens
        this.targetSpeed = this.baseSpeed * scale;
        if (this.currentSpeed > 0) {
            this.currentSpeed = this.targetSpeed;
        }
    }

    update(deltaTime: number, bounds: Vector2D): void {
        if (this.state === 'dead') return;

        // 1. Behavior Logic
        this.stopGoTimer -= deltaTime * 1000;
        if (this.stopGoTimer <= 0) {
            this.isStopped = !this.isStopped;
            const baseInterval = this.isStopped ? 1000 : 2500;
            this.stopGoTimer = baseInterval + Math.random() * 1000;

            if (this.state === 'flee') this.isStopped = false;
        }

        // 2. Movement
        const noiseValue = noise2D(this.timeOffset, 0);
        const angle = noiseValue * Math.PI * 4;

        this.velocity.x = Math.cos(angle) * this.currentSpeed;
        this.velocity.y = Math.sin(angle) * this.currentSpeed;

        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;

        // Bounds
        const margin = this.size;
        if (this.position.x < margin) { this.position.x = margin; this.velocity.x *= -1; this.timeOffset += 10; }
        if (this.position.x > bounds.x - margin) { this.position.x = bounds.x - margin; this.velocity.x *= -1; this.timeOffset += 10; }
        if (this.position.y < margin) { this.position.y = margin; this.velocity.y *= -1; this.timeOffset += 10; }
        if (this.position.y > bounds.y - margin) { this.position.y = bounds.y - margin; this.velocity.y *= -1; this.timeOffset += 10; }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        if (this.state === 'dead') return;

        ctx.fillStyle = this.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;

        ctx.save();
        ctx.translate(this.position.x, this.position.y);

        let rotation = Math.atan2(this.velocity.y, this.velocity.x);
        if (this.isStopped) rotation = 0;
        ctx.rotate(rotation);

        if (this.type === 'mouse') {
            this.drawMouse(ctx);
        } else if (this.type === 'insect') {
            this.drawInsect(ctx);
        } else {
            this.drawWorm(ctx);
        }

        ctx.restore();
        ctx.shadowBlur = 0;
    }

    private drawMouse(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.strokeStyle = this.color;
        ctx.moveTo(-this.size, 0);

        const tailLen = this.size * 1.5;
        const tailWag = Math.sin(this.tailPhase) * 10;

        ctx.quadraticCurveTo(
            -this.size - tailLen / 2, tailWag,
            -this.size - tailLen, tailWag * 0.5
        );
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(this.size * 0.5, -this.size * 0.4, this.size * 0.2, this.size * 0.2, 0, 0, Math.PI * 2);
        ctx.ellipse(this.size * 0.5, this.size * 0.4, this.size * 0.2, this.size * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    private drawInsect(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();

        const wingFlap = Math.sin(this.tailPhase * 5) * 10;

        ctx.fillStyle = this.color + 'AA';
        ctx.beginPath();
        ctx.ellipse(0, -this.size, this.size * 1.2, this.size * 0.4, Math.PI / 4 + wingFlap * 0.05, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(0, this.size, this.size * 1.2, this.size * 0.4, -Math.PI / 4 - wingFlap * 0.05, 0, Math.PI * 2);
        ctx.fill();
    }

    private drawWorm(ctx: CanvasRenderingContext2D) {
        const wiggle = Math.sin(this.tailPhase) * 5;

        ctx.beginPath();
        ctx.arc(this.size / 2, wiggle, this.size / 2, 0, Math.PI * 2);
        ctx.arc(-this.size / 2, -wiggle, this.size / 2, 0, Math.PI * 2);
        ctx.rect(-this.size / 2, -this.size / 2 + (wiggle * 0.2), this.size, this.size);
        ctx.fill();
    }
}
