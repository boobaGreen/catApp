import type { Vector2D } from './types';

export class Particle {
    position: Vector2D;
    velocity: Vector2D;
    life: number;
    maxLife: number;
    color: string;
    size: number;

    constructor(x: number, y: number, color: string) {
        this.position = { x, y };
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 200 + 100;
        this.velocity = {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed
        };
        this.maxLife = 0.5 + Math.random() * 0.3; // Seconds
        this.life = this.maxLife;
        this.color = color;
        this.size = Math.random() * 5 + 2;
    }

    update(deltaTime: number): boolean {
        this.life -= deltaTime;
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        return this.life > 0;
    }

    draw(ctx: CanvasRenderingContext2D) {
        const alpha = this.life / this.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }
}
