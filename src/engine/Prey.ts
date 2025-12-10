import { createNoise2D } from 'simplex-noise';
import type { PreyEntity, Vector2D, SpawnConfig } from './types';
import { GAME_CONFIG } from './constants';

const noise2D = createNoise2D();

export class Prey implements PreyEntity {
    id: string;
    position: Vector2D;
    velocity: Vector2D;
    type: 'mouse' | 'insect' | 'worm' | 'laser' | 'butterfly' | 'feather' | 'beetle' | 'firefly' | 'dragonfly' | 'gecko' | 'spider' | 'minilaser' | 'snake';
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
    private trail: Vector2D[] = [];

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
                this.baseSize = GAME_CONFIG.SIZE_INSECT * 1.1; // Reduced from 1.5
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
                this.baseSize = GAME_CONFIG.SIZE_MOUSE * 0.5; // Smaller dot
                this.baseSpeed = GAME_CONFIG.SPEED_RUN * 2.5; // Very fast bursts
                break;
            case 'butterfly':
                this.color = '#FF69B4'; // Hot Pink / Varied (Logic can override)
                this.baseSize = GAME_CONFIG.SIZE_INSECT * 1.5;
                this.baseSpeed = GAME_CONFIG.SPEED_RUN * 0.8;
                break;
            case 'feather':
                this.color = '#E0E0E0'; // White/Grey
                this.baseSize = GAME_CONFIG.SIZE_MOUSE * 0.9; // Reduced from 1.2
                this.baseSpeed = GAME_CONFIG.SPEED_STALK * 0.5;
                break;
            case 'spider':
                this.color = '#FFFFFF'; // White (web) / Dark body
                this.baseSize = GAME_CONFIG.SIZE_INSECT * 0.9;
                this.baseSpeed = GAME_CONFIG.SPEED_STALK * 0.8;
                break;
            case 'minilaser':
                this.color = '#FF0000'; // Pure Red
                this.baseSize = GAME_CONFIG.SIZE_MOUSE * 0.15; // Tiny!
                this.baseSpeed = GAME_CONFIG.SPEED_RUN * 3.0; // Extremely fast
                break;
            case 'snake':
                this.color = '#32CD32'; // Green
                this.baseSize = GAME_CONFIG.SIZE_MOUSE * 0.4; // Smaller head/segments
                this.baseSpeed = GAME_CONFIG.SPEED_RUN * 0.9;
                break;
            case 'ornament':
                this.color = '#ff0000'; // Red base (can vary)
                this.baseSize = GAME_CONFIG.SIZE_MOUSE * 0.8;
                this.baseSpeed = GAME_CONFIG.SPEED_RUN * 1.5; // Rolls fast
                break;
            case 'gingerbread':
                this.color = '#8B4513'; // SaddleBrown
                this.baseSize = GAME_CONFIG.SIZE_MOUSE * 0.9;
                this.baseSpeed = GAME_CONFIG.SPEED_RUN * 1.6; // Running away!
                break;
            case 'mouse':
            default:
                this.color = '#4169E1';
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

                if (this.type === 'insect' && this.isStopped) baseInterval -= 1500;

                // SPIDER: Web hanging (Vertical preference)
                if (this.type === 'spider') {
                    baseInterval = this.isStopped ? 3000 : 1000; // Hang longer
                }

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

            if (this.isStopped) {
                this.velocity.x = 0;
                this.velocity.y = 0;
                return;
            }

            // --- MOVEMENT VECTORS ---
            const wanderAngle = noise2D(this.timeOffset, 0) * Math.PI * 2;
            let vx = Math.cos(wanderAngle) * this.currentSpeed;
            let vy = Math.sin(wanderAngle) * this.currentSpeed;

            // SPIDER: Primary Vertical Movement (Abseiling)
            if (this.type === 'spider') {
                // Mostly up/down
                vx *= 0.2;
                // If near top, go down. If near bottom, go up.
                if (this.position.y < 50) vy = Math.abs(vy);
                if (this.position.y > bounds.y - 50) vy = -Math.abs(vy);
            }

            // BEETLE: Jittery
            if (this.type === 'beetle') {
                if (Math.random() < 0.1) {
                    this.currentSpeed = this.behaviorFlags.isEvasive ? this.baseSpeed * 3 : this.baseSpeed * 0;
                }
            }

            this.velocity.x = vx;
            this.velocity.y = vy;

            // Wall avoidance (generic) - Skip for Gecko/Spider
            if (this.type !== 'gecko' && this.type !== 'spider') {
                const margin = 50;
                if (this.position.x < margin) this.velocity.x += this.currentSpeed;
                if (this.position.x > bounds.x - margin) this.velocity.x -= this.currentSpeed;
                if (this.position.y < margin) this.velocity.y += this.currentSpeed;
                if (this.position.y > bounds.y - margin) this.velocity.y -= this.currentSpeed;
            }
        }
        // Logic moved up

        // --- CHRISTMAS PHYSICS ---
        // ORNAMENT: Continuous Roll
        if (this.type === 'ornament') {
            // It always rolls if moving
            if (!this.isStopped) {
                // Rotation handled in draw via velocity, but we can add spin here if we want independent spin
                // Let's rely on velocity direction for now, but maybe add "spin" phase
                this.tailPhase += deltaTime * this.currentSpeed * 0.05;
            }
        }

        // GINGERBREAD: Run Away (Flee behavior override)
        if (this.type === 'gingerbread') {
            // Panic behavior: almost always moving fast
            if (!this.isStopped) this.tailPhase += deltaTime * 20; // Fast legs
        }


        // Laser/Dragonfly moves at FULL speed during outbreaks


        // Laser/Dragonfly moves at FULL speed during outbreaks
        if (!this.isStopped) {
            this.currentSpeed = this.targetSpeed;

            // Dragonfly Darts are faster than base speed
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

            // TRACK TRAIL for Snake
            if (this.type === 'snake') {
                this.trail.unshift({ x: this.position.x, y: this.position.y });
                if (this.trail.length > 20) this.trail.pop(); // Limit trail length
            }
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



        // Glow effect handled in specific draw methods now


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
            case 'beetle': this.drawBeetle(ctx); break;
            case 'firefly': this.drawFirefly(ctx); break;
            case 'dragonfly': this.drawDragonfly(ctx); break;
            case 'gecko': this.drawGecko(ctx); break;
            case 'spider':
                this.drawSpider(ctx);
                break;
            case 'minilaser':
                this.drawMiniLaser(ctx);
                break;
            case 'snake':
                this.drawSnake(ctx);
                break;
            case 'worm':
                this.drawWorm(ctx);
                break;
            default:
                this.drawMouse(ctx);
                break;
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

    private drawBeetle(ctx: CanvasRenderingContext2D) {
        // Oval Carapace
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.beginPath();
        ctx.arc(this.size, 0, this.size * 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Legs (6)
        ctx.lineWidth = 3;
        ctx.strokeStyle = this.color;
        ctx.beginPath();
        for (let i = 0; i < 3; i++) {
            const x = (i - 1) * this.size * 0.6;
            // Left
            ctx.moveTo(x, -this.size * 0.5);
            ctx.lineTo(x - 5, -this.size - 5);
            // Right
            ctx.moveTo(x, this.size * 0.5);
            ctx.lineTo(x - 5, this.size + 5);
        }
        ctx.stroke();
    }

    private drawFirefly(ctx: CanvasRenderingContext2D) {
        // Glowing abdomen
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#FFFF00';
        ctx.fillStyle = '#FFFFCC'; // Hot center
        ctx.beginPath();
        ctx.ellipse(-this.size * 0.5, 0, this.size * 0.8, this.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Wings (Dark)
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.ellipse(this.size * 0.2, -this.size * 0.5, this.size, this.size * 0.4, 0.5, 0, Math.PI * 2);
        ctx.ellipse(this.size * 0.2, this.size * 0.5, this.size, this.size * 0.4, -0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }

    private drawDragonfly(ctx: CanvasRenderingContext2D) {
        // Long thin body
        ctx.beginPath();
        ctx.fillRect(-this.size * 1.5, -this.size * 0.2, this.size * 3, this.size * 0.4);
        ctx.fill();

        // Big Eyes
        ctx.beginPath();
        ctx.arc(this.size * 1.5, 0, this.size * 0.5, 0, Math.PI * 2);
        ctx.fill();

        // Double Wings
        ctx.fillStyle = '#00FFFF'; // Tint
        ctx.globalAlpha = 0.5;
        const flutter = Math.sin(this.tailPhase * 30) * 0.5;

        ctx.beginPath();
        // Front
        ctx.ellipse(0, -this.size * 1.5, this.size * 2, this.size * 0.5, 0.2 + flutter, 0, Math.PI * 2);
        // Back
        ctx.ellipse(-this.size, -this.size * 1.5, this.size * 1.8, this.size * 0.4, 0.4 + flutter, 0, Math.PI * 2);
        // Mirror
        ctx.ellipse(0, this.size * 1.5, this.size * 2, this.size * 0.5, -0.2 - flutter, 0, Math.PI * 2);
        ctx.ellipse(-this.size, this.size * 1.5, this.size * 1.8, this.size * 0.4, -0.4 - flutter, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }

    private drawGecko(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color;
        // S - Curve Body hint (simple oval for now, improved logic)
        ctx.beginPath();
        // Head
        ctx.arc(this.size, 0, this.size * 0.6, 0, Math.PI * 2);
        // Neck
        ctx.rect(-this.size, -this.size * 0.4, this.size * 2, this.size * 0.8);
        ctx.fill();

        // Limbs (Splayed)
        ctx.lineWidth = 4;
        ctx.strokeStyle = this.color;

        const legWalk = Math.sin(this.tailPhase * 10) * 0.5;

        ctx.beginPath();
        // Front Left
        ctx.moveTo(this.size * 0.5, -this.size * 0.4);
        ctx.lineTo(this.size * 1.2, -this.size * 1.5 + legWalk * 5);
        // Front Right
        ctx.moveTo(this.size * 0.5, this.size * 0.4);
        ctx.lineTo(this.size * 1.2, this.size * 1.5 - legWalk * 5);
        // Back Left
        ctx.moveTo(-this.size * 0.5, -this.size * 0.4);
        ctx.lineTo(-this.size * 1.2, -this.size * 1.5 - legWalk * 5);
        // Back Right
        ctx.moveTo(-this.size * 0.5, this.size * 0.4);
        ctx.lineTo(-this.size * 1.2, this.size * 1.5 + legWalk * 5);
        ctx.stroke();
    }

    private drawSpider(ctx: CanvasRenderingContext2D) {
        // Simple 8-leg spider
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.6, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
            // Left legs
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(-this.size * 1.5, (i - 1.5) * 10, -this.size * 1.2, (i - 1.5) * 15 + 10);
            // Right legs
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(this.size * 1.5, (i - 1.5) * 10, this.size * 1.2, (i - 1.5) * 15 + 10);
        }
        ctx.stroke();

        // Silk thread going up
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -1000); // Go up to top of screen
        ctx.stroke();
    }

    private drawMiniLaser(ctx: CanvasRenderingContext2D) {
        const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size * 3);
        glow.addColorStop(0, this.color); // Red center
        glow.addColorStop(0.4, this.color);
        glow.addColorStop(1, 'rgba(255, 0, 0, 0)');

        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.8, 0, Math.PI * 2);
        ctx.fill();
    }

    private drawSnake(ctx: CanvasRenderingContext2D) {
        // Draw Trail as Body (Segments)
        if (this.trail.length > 1) {
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            // Draw from tail to head
            for (let i = 0; i < this.trail.length - 1; i++) {
                const pt = this.trail[i];
                const nextPt = this.trail[i + 1];

                // Tapering width
                const progress = 1 - (i / this.trail.length); // 1 at head, 0 at tail
                const segmentWidth = this.size * 1.5 * Math.max(0.2, progress);

                ctx.lineWidth = Math.max(2, segmentWidth);
                ctx.strokeStyle = this.color; // Using color directly

                ctx.beginPath();
                // Convert absolute to relative
                ctx.moveTo(pt.x - this.position.x, pt.y - this.position.y);
                ctx.lineTo(nextPt.x - this.position.x, nextPt.y - this.position.y);
                ctx.stroke();
            }
        }

        // Distinct Head
        ctx.fillStyle = this.color;
        ctx.beginPath();
        // Slightly elongated head
        ctx.ellipse(0, 0, this.size * 1.2, this.size * 0.9, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#FFFF00';
        ctx.beginPath();
        ctx.arc(-this.size * 0.4, -this.size * 0.4, this.size * 0.25, 0, Math.PI * 2);
        ctx.arc(this.size * 0.4, -this.size * 0.4, this.size * 0.25, 0, Math.PI * 2);
        ctx.fill();

        // Tongue (Flicker)
        if (Math.sin(this.tailPhase * 20) > 0) {
            ctx.strokeStyle = '#FF0000';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(0, this.size); // Start from nose? No, usually direction aligned.
            // We rotate context by velocity direction, so X is forward?
            // Wait, rotation is `Math.atan2(this.velocity.y, this.velocity.x)`.
            // Standard generic rotation is 0 degrees = Right (X+).
            // So nose is at (size, 0) or (0,0) depending on draw.
            // drawMouse draws ellipse at (0,0).
            // Let's assume (size, 0) is front.
            ctx.moveTo(this.size, 0);
            ctx.lineTo(this.size * 2.0, 0);
            ctx.stroke();

            // Fork
            ctx.beginPath();
            ctx.moveTo(this.size * 2.0, 0);
            ctx.lineTo(this.size * 2.5, -this.size * 0.5);
            ctx.moveTo(this.size * 2.0, 0);
            ctx.lineTo(this.size * 2.5, this.size * 0.5);
            ctx.stroke();
        }
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
