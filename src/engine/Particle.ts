import type { Vector2D } from './types';

export class Particle {
    position: Vector2D;
    velocity: Vector2D;
    life: number;
    maxLife: number;
    type: 'circle' | 'square' | 'star';
    rotation: number;
    rotationSpeed: number;

    constructor(x: number, y: number, color: string, type: 'circle' | 'square' | 'star' = 'circle') {
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
        this.size = Math.random() * 8 + 3; // Slightly bigger
        this.type = type;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() - 0.5) * 10;
    }

    update(deltaTime: number): boolean {
        this.life -= deltaTime;
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        this.rotation += this.rotationSpeed;
        return this.life > 0;
    }

    draw(ctx: CanvasRenderingContext2D) {
        const alpha = this.life / this.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;

        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.rotation);

        if (this.type === 'square') {
            ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        } else if (this.type === 'star') {
            // Draw simple star or cross
            ctx.beginPath();
            ctx.moveTo(-this.size, 0); ctx.lineTo(this.size, 0);
            ctx.moveTo(0, -this.size); ctx.lineTo(0, this.size);
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;
            ctx.stroke();
        } else {
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
        ctx.globalAlpha = 1.0;
    }
}
