import { createNoise2D } from 'simplex-noise';
import type { PreyEntity, Vector2D, SpawnConfig } from './types';
import { GAME_CONFIG } from './constants';

const noise2D = createNoise2D();

export class Prey implements PreyEntity {
    id: string;
    position: Vector2D;
    velocity: Vector2D;
    type: 'mouse' | 'insect' | 'worm' | 'laser';
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

    // Director injected behaviors
    private behaviorFlags: { canFlee: boolean, isEvasive: boolean };
    private fleeTarget: Vector2D | null = null;

    constructor(id: string, config: SpawnConfig, bounds: Vector2D) {
        this.id = id;
        this.type = config.type;
        this.behaviorFlags = config.behaviorFlags;
        this.state = 'search';
        this.timeOffset = Math.random() * 1000;
        this.stopGoTimer = Math.random() * 2000;
        this.isStopped = false;

        this.position = {
            x: Math.random() * bounds.x,
            y: Math.random() * bounds.y
        };

        this.velocity = { x: 0, y: 0 };

        switch (this.type) {
            case 'insect':
                this.color = '#7FFF00'; // Chartreuse (Peak Green 556nm)
                this.baseSize = GAME_CONFIG.SIZE_INSECT;
                this.baseSpeed = GAME_CONFIG.SPEED_RUN * 1.3; // Faster bursts but not uncatchable (was 1.5)
                break;
            case 'worm':
                this.color = '#FFD700'; // Gold (High contrast yellow)
                this.baseSize = GAME_CONFIG.SIZE_MOUSE * 0.8;
                this.baseSpeed = GAME_CONFIG.SPEED_STALK;
                break;
            case 'mouse':
            default:
                this.color = '#4169E1'; // Royal Blue (Peak Blue 450nm)
                this.baseSize = GAME_CONFIG.SIZE_MOUSE;
                this.baseSpeed = GAME_CONFIG.SPEED_RUN;
                this.baseSpeed = GAME_CONFIG.SPEED_RUN;
                break;
            case 'laser':
                this.color = '#FF0000'; // Pure Red
                this.baseSize = GAME_CONFIG.SIZE_MOUSE * 0.7;
                this.baseSpeed = GAME_CONFIG.SPEED_RUN * 2.0; // Super fast
                break;
        }

        // Apply size multiplier if we had one (currently scaling is separate fn)
        this.size = this.baseSize;

        // APPLY DIRECTOR SPEED MULTIPLIER
        this.baseSpeed *= config.speedMultiplier;

        this.targetSpeed = this.baseSpeed;
        this.currentSpeed = this.targetSpeed;
    }

    public resize(scale: number) {
        this.size = this.baseSize * scale;
        // Scale speed to maintain relative pace on smaller screens
        this.targetSpeed = this.baseSpeed * scale;
        if (this.currentSpeed > 0 && this.state !== 'flee') {
            this.currentSpeed = this.targetSpeed;
        }
    }

    public triggerFlee(source: Vector2D) {
        if (!this.behaviorFlags.canFlee) return;

        this.state = 'flee';
        this.fleeTarget = source;
        // Reset after 1.5s
        setTimeout(() => {
            if (this.state === 'flee') {
                this.state = 'search';
                this.fleeTarget = null;
            }
        }, 1500);
    }

    update(deltaTime: number, bounds: Vector2D): void {
        if (this.state === 'dead') return;
        this.tailPhase += deltaTime * 10;

        // 1. Behavior Logic
        if (this.state === 'flee') {
            // FLEE LOGIC v2
            if (this.behaviorFlags.canFlee) {
                // Boost speed significantly
                this.currentSpeed = this.targetSpeed * 3.0; // 3x Panic Speed
            }
            this.isStopped = false;
        } else {
            // Normal behavior: STOP & GO (Ethological Stalking Rhythm)
            this.currentSpeed = this.targetSpeed;

            this.stopGoTimer -= deltaTime * 1000;
            if (this.stopGoTimer <= 0) {
                this.isStopped = !this.isStopped;
                // Stopped: 2000-3000ms (Long pause for cat to target)
                // Moving: 1000-2000ms (Short burst)
                // Worms should stop longer. Insects stop less.
                let baseInterval = this.isStopped ? 2500 : 1500;

                if (this.type === 'worm' && this.isStopped) baseInterval += 1000; // Worms chill longer
                if (this.type === 'insect' && this.isStopped) baseInterval -= 1000; // Insects twitchy
                this.stopGoTimer = baseInterval + Math.random() * 1000;
            }
        }

        // 2. Movement
        let angle = 0;

        if (this.state === 'flee') {
            if (this.fleeTarget) {
                // Run AWAY from target
                const dx = this.position.x - this.fleeTarget.x;
                const dy = this.position.y - this.fleeTarget.y;
                angle = Math.atan2(dy, dx);

                // Add slight wobble so it's not robotic
                const wobble = noise2D(this.timeOffset * 5, 0) * 0.5;
                angle += wobble;
            } else {
                // Fallback (shouldn't happen with triggerFlee)
                const noiseValue = noise2D(this.timeOffset, 0);
                angle = noiseValue * Math.PI * 4;
            }
        } else {
            const noiseValue = noise2D(this.timeOffset, 0);
            angle = noiseValue * Math.PI * 4;
        }

        // Evasive Logic (Wiggle more)
        if (this.behaviorFlags.isEvasive) {
            this.timeOffset += deltaTime * 2; // Move through noise field faster = more wiggles
        }

        if (!this.isStopped || this.state === 'flee') {
            this.velocity.x = Math.cos(angle) * this.currentSpeed;
            this.velocity.y = Math.sin(angle) * this.currentSpeed;

            this.position.x += this.velocity.x * deltaTime;
            this.position.y += this.velocity.y * deltaTime;
        }

        // Bounds
        const margin = this.size;
        // Bounce off walls
        if (this.position.x < margin) { this.position.x = margin; this.velocity.x *= -1; this.timeOffset += 10; }
        if (this.position.x > bounds.x - margin) { this.position.x = bounds.x - margin; this.velocity.x *= -1; this.timeOffset += 10; }
        if (this.position.y < margin) { this.position.y = margin; this.velocity.y *= -1; this.timeOffset += 10; }
        if (this.position.y > bounds.y - margin) { this.position.y = bounds.y - margin; this.velocity.y *= -1; this.timeOffset += 10; }

        this.timeOffset += deltaTime;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        if (this.state === 'dead') return;

        ctx.fillStyle = this.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;

        ctx.save();
        ctx.translate(this.position.x, this.position.y);

        let rotation = Math.atan2(this.velocity.y, this.velocity.x);
        if (this.isStopped && this.state !== 'flee') rotation = 0;
        ctx.rotate(rotation);

        if (this.type === 'mouse') {
            this.drawMouse(ctx);
        } else if (this.type === 'insect') {
            this.drawInsect(ctx);
        } else if (this.type === 'laser') {
            this.drawLaser(ctx);
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
        const wiggle = Math.sin(this.tailPhase * 2) * 5;

        ctx.beginPath();
        ctx.arc(this.size / 2, wiggle, this.size / 2, 0, Math.PI * 2);
        ctx.arc(-this.size / 2, -wiggle, this.size / 2, 0, Math.PI * 2);
        ctx.rect(-this.size / 2, -this.size / 2 + (wiggle * 0.2), this.size, this.size);
        ctx.fill();
    }

    private drawLaser(ctx: CanvasRenderingContext2D) {
        // Red Dot with intense glow
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#FF0000';

        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fillStyle = '#FF4444'; // Slightly brighter center
        ctx.fill();

        // Inner white core for realism
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
    }
}
