import { createNoise2D } from 'simplex-noise';
import type { PreyEntity, Vector2D, SpawnConfig } from './types';
import { GAME_CONFIG } from './constants';

const noise2D = createNoise2D();

export class Prey implements PreyEntity {
    id: string;
    position: Vector2D;
    velocity: Vector2D;
    type: 'mouse' | 'insect' | 'worm' | 'laser' | 'butterfly' | 'feather' | 'beetle' | 'firefly' | 'dragonfly' | 'gecko';
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

    // ... (Imports and Class def remain)

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
            case 'beetle':
                this.color = '#32CD32'; // High-vis lime
                this.baseSize = GAME_CONFIG.SIZE_INSECT * 1.2;
                this.baseSpeed = GAME_CONFIG.SPEED_RUN * 1.4;
                break;
            case 'firefly':
                this.color = '#FFFF00'; // Glowing yellow
                this.baseSize = GAME_CONFIG.SIZE_INSECT * 0.8;
                this.baseSpeed = GAME_CONFIG.SPEED_STALK * 1.2;
                break;
            case 'dragonfly':
                this.color = '#00FFFF'; // Electric Cyan
                this.baseSize = GAME_CONFIG.SIZE_INSECT * 1.5;
                this.baseSpeed = GAME_CONFIG.SPEED_RUN * 1.8;
                break;
            case 'insect':
                this.color = '#7FFF00'; // Chartreuse
                this.baseSize = GAME_CONFIG.SIZE_INSECT;
                this.baseSpeed = GAME_CONFIG.SPEED_RUN * 1.3;
                break;
            case 'worm':
                this.color = '#FFD700'; // Gold
                this.baseSize = GAME_CONFIG.SIZE_MOUSE * 0.8;
                this.baseSpeed = GAME_CONFIG.SPEED_STALK;
                break;
            case 'laser':
                // ETHOLOGICAL UPDATE: Cats see Green/Blue better than Red.
                // Using a high-vis Cyan/Green.
                this.color = '#00FFCC';
                this.baseSize = GAME_CONFIG.SIZE_MOUSE * 0.6; // Smaller dot
                this.baseSpeed = GAME_CONFIG.SPEED_RUN * 2.5; // Very fast bursts
                break;
            case 'butterfly':
                this.color = '#FF69B4'; // Hot Pink / Varied (Logic can override)
                this.baseSize = GAME_CONFIG.SIZE_INSECT * 1.5;
                this.baseSpeed = GAME_CONFIG.SPEED_RUN * 0.8;
                break;
            case 'feather':
                this.color = '#E0E0E0'; // White/Grey
                this.baseSize = GAME_CONFIG.SIZE_MOUSE * 1.2;
                this.baseSpeed = GAME_CONFIG.SPEED_STALK * 0.5;
                break;
            case 'mouse':
            default:
                this.color = '#4169E1'; // Royal Blue
                this.baseSize = GAME_CONFIG.SIZE_MOUSE;
                this.baseSpeed = GAME_CONFIG.SPEED_RUN;
                break;
        }

        // Apply size multiplier if we had one
        this.size = this.baseSize;

        // APPLY DIRECTOR SPEED MULTIPLIER
        this.baseSpeed *= config.speedMultiplier;

        this.targetSpeed = this.baseSpeed;
        this.currentSpeed = this.targetSpeed;
    }

    public resize(scale: number) {
        this.size = this.baseSize * scale;
        this.targetSpeed = this.baseSpeed * scale;
        if (this.currentSpeed > 0 && this.state !== 'flee') {
            this.currentSpeed = this.targetSpeed;
        }
    }

    public triggerFlee(source: Vector2D) {
        if (!this.behaviorFlags.canFlee) return;
        this.state = 'flee';
        this.fleeTarget = source;
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

        // --- SPECIFIC MOVEMENT LOGIC PER TYPE ---

        // 1. FEATHER: Drifting Physics (Gravity + Noise)
        if (this.type === 'feather') {
            const driftX = noise2D(this.timeOffset * 0.5, 0) * this.targetSpeed;
            const driftY = (noise2D(0, this.timeOffset * 0.5) + 0.5) * this.targetSpeed * 0.5; // Slight downward trend or float

            this.position.x += driftX * deltaTime;
            this.position.y += driftY * deltaTime;

            this.timeOffset += deltaTime;
            // Bounds Wrap for Feather (continuous float)
            if (this.position.x < -50) this.position.x = bounds.x + 50;
            if (this.position.x > bounds.x + 50) this.position.x = -50;
            if (this.position.y < -50) this.position.y = bounds.y + 50;
            if (this.position.y > bounds.y + 50) this.position.y = -50;

            return; // Skip standard physics
        }

        // 2. BUTTERFLY: Chaotic Flight (Sinusoidal)
        else if (this.type === 'butterfly') {
            // BUTTERFLY: Chaotic sinusoidal flight
            // Flap logic
            this.timeOffset += deltaTime * 5;
            const flap = Math.sin(this.timeOffset * 10);

            // Movement: Forward + Perpendicular Sine Wave + Noise
            // Initialize velocity if it's zero (e.g., first frame)
            if (this.velocity.x === 0 && this.velocity.y === 0) {
                const initialAngle = Math.random() * Math.PI * 2;
                this.velocity.x = Math.cos(initialAngle) * this.targetSpeed;
                this.velocity.y = Math.sin(initialAngle) * this.targetSpeed;
            }

            const currentAngle = Math.atan2(this.velocity.y, this.velocity.x);
            const speed = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);

            const forwardX = Math.cos(currentAngle) * speed * deltaTime;
            const forwardY = Math.sin(currentAngle) * speed * deltaTime;

            const perpX = -Math.sin(currentAngle);
            const perpY = Math.cos(currentAngle);

            // Increase chaos factor
            const chaos = noise2D(this.timeOffset, 100) * 150 * deltaTime;

            this.position.x += forwardX + (perpX * flap * 2) + chaos;
            this.position.y += forwardY + (perpY * flap * 2) + chaos;

            // Random direction changes
            if (Math.random() < 0.05) {
                const turn = (Math.random() - 0.5) * Math.PI;
                this.velocity.x = Math.cos(currentAngle + turn) * speed;
                this.velocity.y = Math.sin(currentAngle + turn) * speed;
            }

            // Bounce bounds
            const m = this.size;
            if (this.position.x < m) { this.position.x = m; this.velocity.x *= -1; this.timeOffset += 10; }
            if (this.position.x > bounds.x - m) { this.position.x = bounds.x - m; this.velocity.x *= -1; this.timeOffset += 10; }
            if (this.position.y < m) { this.position.y = m; this.velocity.y *= -1; this.timeOffset += 10; }
            if (this.position.y > bounds.y - m) { this.position.y = bounds.y - m; this.velocity.y *= -1; this.timeOffset += 10; }
            return;
        }

        // 3. LASER / MOUSE / INSECT / WORM (Standard behavior with variants)

        // Behavior Logic (Stop/Go)
        if (this.state === 'flee') {
            this.currentSpeed = this.targetSpeed * (this.type === 'laser' ? 1.5 : 3.0);
            this.isStopped = false;
        } else {
            // STOP & GO Logic
            this.stopGoTimer -= deltaTime * 1000;
            if (this.stopGoTimer <= 0) {
                this.isStopped = !this.isStopped;

                // Default Intervals
                let baseInterval = this.isStopped ? 2500 : 1500;

                // --- ETHOLOGICAL TIMINGS ---

                // BEETLE: Erratic Scuttle
                if (this.type === 'beetle') {
                    // Quick runs (0.5s), Short stops (0.3s) -> highly twitchy
                    baseInterval = this.isStopped ? 300 : 600;
                }

                // GECKO LOGIC: Wall Hugging
                if (this.type === 'gecko') {
                    const margin = 50;
                    const nearLeft = this.position.x < margin;
                    const nearRight = this.position.x > bounds.x - margin;
                    const nearTop = this.position.y < margin;
                    const nearBottom = this.position.y > bounds.y - margin;
                    const isNearWall = nearLeft || nearRight || nearTop || nearBottom;

                    this.stopGoTimer -= deltaTime * 1000;
                    if (this.stopGoTimer <= 0) {
                        this.isStopped = !this.isStopped;
                        // Sprints are fast and short, stops are vigilant
                        this.stopGoTimer = this.isStopped ? 1000 + Math.random() * 500 : 400 + Math.random() * 400;
                    }

                    if (this.isStopped) {
                        this.velocity.x = 0;
                        this.velocity.y = 0;
                        return;
                    }

                    const sprintSpeed = this.currentSpeed * 1.5;

                    if (!isNearWall) {
                        // Seek nearest wall
                        const distLeft = this.position.x;
                        const distRight = bounds.x - this.position.x;
                        const distTop = this.position.y;
                        const distBottom = bounds.y - this.position.y;

                        const minDist = Math.min(distLeft, distRight, distTop, distBottom);

                        this.velocity.x = 0;
                        this.velocity.y = 0;

                        if (minDist === distLeft) this.velocity.x = -sprintSpeed;
                        else if (minDist === distRight) this.velocity.x = sprintSpeed;
                        else if (minDist === distTop) this.velocity.y = -sprintSpeed;
                        else this.velocity.y = sprintSpeed;
                    } else {
                        // Move ALONG the wall
                        // We keep the velocity we had, or pick a random direction along the wall if static
                        // Since this runs every frame, we need persistence.

                        // Simple logic: If moving towards wall, turn 90 degrees.
                        // If stopped, pick a direction along wall.

                        if (this.velocity.x === 0 && this.velocity.y === 0) {
                            // Kickstart movement along wall
                            if (nearLeft || nearRight) this.velocity.y = Math.random() > 0.5 ? sprintSpeed : -sprintSpeed;
                            else this.velocity.x = Math.random() > 0.5 ? sprintSpeed : -sprintSpeed;
                        }

                        // Constrain to wall
                        if (nearLeft) { this.position.x = 10; this.velocity.x = 0; if (this.velocity.y === 0) this.velocity.y = sprintSpeed; }
                        if (nearRight) { this.position.x = bounds.x - 10; this.velocity.x = 0; if (this.velocity.y === 0) this.velocity.y = sprintSpeed; }
                        if (nearTop) { this.position.y = 10; this.velocity.y = 0; if (this.velocity.x === 0) this.velocity.x = sprintSpeed; }
                        if (nearBottom) { this.position.y = bounds.y - 10; this.velocity.y = 0; if (this.velocity.x === 0) this.velocity.x = sprintSpeed; }

                        // Corner logic: Turn corner
                        if (nearLeft && nearTop) { this.velocity.y = 0; this.velocity.x = sprintSpeed; } // TL -> Go Right
                        if (nearRight && nearTop) { this.velocity.x = 0; this.velocity.y = sprintSpeed; } // TR -> Go Down
                        if (nearRight && nearBottom) { this.velocity.y = 0; this.velocity.x = -sprintSpeed; } // BR -> Go Left
                        if (nearLeft && nearBottom) { this.velocity.x = 0; this.velocity.y = -sprintSpeed; } // BL -> Go Up
                    }
                    return; // Gecko ignores standard wander
                }

                // DRAGONFLY: Hover & Dart
                if (this.type === 'dragonfly') {
                    // Long hover (2s), Fast dart (0.2s)
                    baseInterval = this.isStopped ? 2000 : 250;
                }

                // INSECT / WORM
                if (this.type === 'worm' && this.isStopped) baseInterval += 1000;
                if (this.type === 'insect' && this.isStopped) baseInterval -= 1500;

                // LASER CHECK
                if (this.type === 'laser') {
                    baseInterval = this.isStopped ? 800 : 600;
                }

                this.stopGoTimer = baseInterval + Math.random() * 1000;

                // Beetle/Dragonfly Direction Change on Move Start
                if (!this.isStopped && (this.type === 'beetle' || this.type === 'dragonfly')) {
                    // Force a new direction immediately when starting to move
                    this.timeOffset += 100;
                }
            }

            // Laser/Dragonfly moves at FULL speed during outbreaks
            if (!this.isStopped) {
                this.currentSpeed = this.targetSpeed;

                // Dragonfly Darts are faster than base speed
                if (this.type === 'dragonfly') this.currentSpeed *= 3.0;
            }
        }

        // Angle Calculation
        let angle = 0;
        if (this.state === 'flee' && this.fleeTarget) {
            const dx = this.position.x - this.fleeTarget.x;
            const dy = this.position.y - this.fleeTarget.y;
            angle = Math.atan2(dy, dx) + (noise2D(this.timeOffset * 5, 0) * 0.5);
        } else {
            // Random wander
            angle = noise2D(this.timeOffset, 0) * Math.PI * 4;
        }

        // Apply Velocity
        if (!this.isStopped || this.state === 'flee') {
            this.velocity.x = Math.cos(angle) * this.currentSpeed;
            this.velocity.y = Math.sin(angle) * this.currentSpeed;
            this.position.x += this.velocity.x * deltaTime;
            this.position.y += this.velocity.y * deltaTime;
        } else if (this.type === 'laser') {
            // JITTER when stopped (Hand shake effect)
            this.position.x += (Math.random() - 0.5) * 5;
            this.position.y += (Math.random() - 0.5) * 5;
        }

        // Bounds Checking (Bounce)
        const margin = this.size;
        if (this.position.x < margin) { this.position.x = margin; this.velocity.x *= -1; this.timeOffset += 10; }
        if (this.position.x > bounds.x - margin) { this.position.x = bounds.x - margin; this.velocity.x *= -1; this.timeOffset += 10; }
        if (this.position.y < margin) { this.position.y = margin; this.velocity.y *= -1; this.timeOffset += 10; }
        if (this.position.y > bounds.y - margin) { this.position.y = bounds.y - margin; this.velocity.y *= -1; this.timeOffset += 10; }

        this.timeOffset += deltaTime;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        if (this.state === 'dead') return;

        ctx.fillStyle = this.color;

        // ETHOLOGICAL: Firefly Pulsing Glow
        if (this.type === 'firefly') {
            // Sine wave pulse based on time
            const pulse = (Math.sin(Date.now() * 0.005 + this.timeOffset) + 1) / 2; // 0 to 1
            const alpha = 0.3 + (pulse * 0.7); // Min 0.3, Max 1.0
            ctx.globalAlpha = alpha;
        } else {
            ctx.globalAlpha = 1.0;
        }

        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Glow effect for firefly/laser
        if (this.type === 'firefly' || this.type === 'laser') {
            ctx.shadowBlur = this.type === 'firefly' ? 20 : 10;
            ctx.shadowColor = this.color;
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        ctx.globalAlpha = 1.0; // Reset

        // Draw details (legs, tail) based on type...
        // ... (Keep existing detailed drawing logic if any, or simplified)
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;

        ctx.save();
        ctx.translate(this.position.x, this.position.y);

        let rotation = Math.atan2(this.velocity.y, this.velocity.x);
        if (this.isStopped && this.state !== 'flee' && this.type !== 'butterfly' && this.type !== 'feather') rotation = 0;

        ctx.rotate(rotation);

        switch (this.type) {
            case 'mouse': this.drawMouse(ctx); break;
            case 'insect': this.drawInsect(ctx); break;
            case 'laser': this.drawLaser(ctx); break;
            case 'butterfly': this.drawButterfly(ctx); break;
            case 'feather': this.drawFeather(ctx); break;
            case 'worm': default: this.drawWorm(ctx); break;
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

        const wingFlap = Math.sin(this.tailPhase * 20) * 15; // Faster flap

        ctx.fillStyle = this.color + 'AA';
        ctx.beginPath();
        ctx.ellipse(0, -this.size, this.size * 1.2, this.size * 0.4, Math.PI / 4 + wingFlap * 0.05, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(0, this.size, this.size * 1.2, this.size * 0.4, -Math.PI / 4 - wingFlap * 0.05, 0, Math.PI * 2);
        ctx.fill();
    }

    private drawWorm(ctx: CanvasRenderingContext2D) {
        const wiggle = Math.sin(this.tailPhase * 5) * 5; // Faster wiggle

        ctx.beginPath();
        ctx.arc(this.size / 2, wiggle, this.size / 2, 0, Math.PI * 2);
        ctx.arc(-this.size / 2, -wiggle, this.size / 2, 0, Math.PI * 2);
        ctx.rect(-this.size / 2, -this.size / 2 + (wiggle * 0.2), this.size, this.size);
        ctx.fill();
    }

    private drawLaser(ctx: CanvasRenderingContext2D) {
        // Cyan/Green Dot with intense glow
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color; // Usage of bright Cyan

        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();

        // Inner white core
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
    }

    private drawButterfly(ctx: CanvasRenderingContext2D) {
        const flap = Math.abs(Math.sin(this.tailPhase * 10)); // Slow graceful flap

        // Body
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size * 0.3, this.size, 0, 0, Math.PI * 2);
        ctx.fill();

        // Wings
        ctx.fillStyle = this.color;
        // Left Wing
        ctx.save();
        ctx.scale(1, 0.5 + flap); // Flap scaling effect
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-this.size * 2, -this.size * 2, -this.size * 2, this.size * 2, 0, this.size * 0.5);
        ctx.fill();
        // Right Wing
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(this.size * 2, -this.size * 2, this.size * 2, this.size * 2, 0, this.size * 0.5);
        ctx.fill();
        ctx.restore();
    }

    private drawFeather(ctx: CanvasRenderingContext2D) {
        // Rotation already handled by direction, but feather falls sideways often.
        // We'll trust the rotation from velocity for now or oscillate it.
        ctx.rotate(Math.sin(this.tailPhase * 2) * 0.5);

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        // Rachis (spine)
        ctx.strokeStyle = '#DDD';
        ctx.lineWidth = 2;
        ctx.moveTo(-this.size, 0);
        ctx.lineTo(this.size, 0);
        ctx.stroke();

        // Vanes (Barbs)
        ctx.fillStyle = '#FFFFFFdd';
        ctx.beginPath();
        ctx.moveTo(-this.size, 0);
        ctx.quadraticCurveTo(0, -this.size, this.size, 0); // Top
        ctx.quadraticCurveTo(0, this.size, -this.size, 0); // Bottom
        ctx.fill();
    }
}
