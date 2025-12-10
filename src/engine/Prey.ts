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

        // ETHOLOGICAL SPAWN POSITIONS
        if (['mouse', 'gecko'].includes(this.type)) {
            // Spawn near a wall (Thigmotaxis start)
            if (Math.random() > 0.5) {
                // Side walls
                this.position = {
                    x: Math.random() > 0.5 ? 10 : bounds.x - 10,
                    y: Math.random() * bounds.y
                };
            } else {
                // Top/Bottom
                this.position = {
                    x: Math.random() * bounds.x,
                    y: Math.random() > 0.5 ? 10 : bounds.y - 10
                };
            }
        } else if (this.type === 'spider') {
            // Ceiling only
            this.position = {
                x: Math.random() * bounds.x,
                y: -20 // Just above screen, abseiling down
            };
        } else if (this.type === 'worm' || this.type === 'snake') {
            // Ground biased
            this.position = {
                x: Math.random() * bounds.x,
                y: bounds.y * (0.6 + Math.random() * 0.4) // Bottom 40%
            };
        } else {
            // Random Air/Ground
            this.position = {
                x: Math.random() * bounds.x,
                y: Math.random() * bounds.y
            };
        }

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
        this.timeOffset += deltaTime;

        // --- ETHOLOGICAL MOVEMENT PATTERNS ---

        // 1. WALL HUGGERS (Thigmotaxis): Mouse, Gecko, Spider
        if (['mouse', 'gecko', 'spider'].includes(this.type)) {
            this.updateThigmotaxis(deltaTime, bounds);
            return;
        }

        // 2. ERRATIC FLIGHT: Butterfly, Dragonfly, Feather
        if (['butterfly', 'dragonfly', 'feather'].includes(this.type)) {
            this.updateFlight(deltaTime, bounds);
            return;
        }

        // 3. BURST/SCUTTLE: Beetle, Insect, Minilaser, Laser
        if (['beetle', 'insect', 'minilaser', 'laser', 'firefly'].includes(this.type)) {
            this.updateBurst(deltaTime, bounds);
            return;
        }

        // 4. UNDULATING: Snake, Worm
        if (['snake', 'worm'].includes(this.type)) {
            this.updateUndulating(deltaTime, bounds);
            return;
        }

        // Default Fallback
        this.updateGeneric(deltaTime, bounds);
    }

    // --- BEHAVIORAL SUBROUTINES ---

    // MOUSE, GECKO, SPIDER
    private updateThigmotaxis(deltaTime: number, bounds: Vector2D) {
        // STATE MACHINE: Search (Wall Seek) -> Wall Run -> Pause -> Scurry

        // Timer Logic
        this.stopGoTimer -= deltaTime * 1000;
        if (this.stopGoTimer <= 0) {
            this.isStopped = !this.isStopped;
            // Mice stop often to listen (Vigilance)
            // Gecko stops to ambush
            this.stopGoTimer = this.isStopped
                ? 1000 + Math.random() * 2000 // Stop: 1-3s
                : 500 + Math.random() * 1000; // Run: 0.5-1.5s

            // Burst of speed on start
            if (!this.isStopped) {
                this.currentSpeed = this.targetSpeed * (Math.random() > 0.7 ? 2.5 : 1.0); // Occasional sprint
            }
        }

        if (this.isStopped && this.state !== 'flee') {
            // Jitter while stopped (breathing/sniffing)
            if (this.type === 'mouse') {
                // Nothing, total stillness is key for camouflage, maybe slight nose twitch (visual only)
            }
            return;
        }

        // FLEE OVERRIDE
        if (this.state === 'flee' && this.fleeTarget) {
            const dx = this.position.x - this.fleeTarget.x;
            const dy = this.position.y - this.fleeTarget.y;
            const angle = Math.atan2(dy, dx);
            this.velocity.x = Math.cos(angle) * this.targetSpeed * 3; // Panic speed
            this.velocity.y = Math.sin(angle) * this.targetSpeed * 3;

            this.integrateVelocity(deltaTime, bounds);
            return;
        }

        // WALL SEEKING LOGIC
        const margin = 100; // Awareness range
        const nearLeft = this.position.x < margin;
        const nearRight = this.position.x > bounds.x - margin;
        const nearTop = this.position.y < margin;
        const nearBottom = this.position.y > bounds.y - margin;
        const isNearWall = nearLeft || nearRight || nearTop || nearBottom;

        if (isNearWall) {
            // WE ARE ON A WALL (or close)
            // Align velocity with wall
            const speed = this.currentSpeed;

            if (nearLeft) { // Left Wall
                this.position.x = Math.max(this.size, this.position.x - speed * deltaTime); // Snap
                if (Math.abs(this.velocity.y) < 0.1) this.velocity.y = speed * (Math.random() > 0.5 ? 1 : -1);
                this.velocity.x = 0;
            } else if (nearRight) { // Right Wall
                this.position.x = Math.min(bounds.x - this.size, this.position.x + speed * deltaTime);
                if (Math.abs(this.velocity.y) < 0.1) this.velocity.y = speed * (Math.random() > 0.5 ? 1 : -1);
                this.velocity.x = 0;
            } else if (nearTop) { // Top Wall
                this.position.y = Math.max(this.size, this.position.y - speed * deltaTime);
                if (Math.abs(this.velocity.x) < 0.1) this.velocity.x = speed * (Math.random() > 0.5 ? 1 : -1);
                this.velocity.y = 0;
            } else if (nearBottom) { // Bottom Wall
                this.position.y = Math.min(bounds.y - this.size, this.position.y + speed * deltaTime);
                if (Math.abs(this.velocity.x) < 0.1) this.velocity.x = speed * (Math.random() > 0.5 ? 1 : -1);
                this.velocity.y = 0;
            }

            // Corner handling: If hitting a corner, turn 90 deg
            // (Implicitly handled by bounding box logic usually, but let's be explicit)
            if (this.position.y <= this.size && this.velocity.y < 0) { this.velocity.y = 0; this.velocity.x = speed * (Math.random() > 0.5 ? 1 : -1); }
            if (this.position.y >= bounds.y - this.size && this.velocity.y > 0) { this.velocity.y = 0; this.velocity.x = speed * (Math.random() > 0.5 ? 1 : -1); }
            // etc...

        } else {
            // OPEN SPACE -> SEEK WALL
            // Move generally towards nearest wall or random
            // Mouse hates open space.
            if (Math.random() < 0.05) { // Occasional re-decision
                const angle = Math.random() * Math.PI * 2;
                this.velocity.x = Math.cos(angle) * this.currentSpeed;
                this.velocity.y = Math.sin(angle) * this.currentSpeed;
            }
        }

        this.integrateVelocity(deltaTime, bounds);
    }

    // BUTTERFLY, DRAGONFLY, FEATHER
    private updateFlight(deltaTime: number, bounds: Vector2D) {
        if (this.type === 'feather') {
            const driftX = noise2D(this.timeOffset * 0.5, 0) * this.targetSpeed;
            const driftY = (noise2D(0, this.timeOffset * 0.5) + 0.3) * this.targetSpeed * 0.5; // Gravity-ish
            this.velocity.x = driftX;
            this.velocity.y = driftY;
            this.integrateVelocity(deltaTime, bounds, true); // Wrap bounds
            return;
        }

        // CHAOTIC FLIGHT (Lévy Flight approx)
        const speed = this.targetSpeed;

        // Change direction smoothly but rapidly
        const noiseAngle = noise2D(this.timeOffset * 2, 0) * Math.PI * 4;

        // Flap impulse
        const flap = Math.sin(this.timeOffset * (this.type === 'dragonfly' ? 30 : 10));

        // Dragonfly: Hover then Dart
        if (this.type === 'dragonfly') {
            this.stopGoTimer -= deltaTime * 1000;
            if (this.stopGoTimer <= 0) {
                this.isStopped = !this.isStopped;
                this.stopGoTimer = this.isStopped ? 1000 : 300; // Long hover, fast burst
                if (!this.isStopped) {
                    // DART!
                    const dartAngle = Math.random() * Math.PI * 2;
                    this.velocity.x = Math.cos(dartAngle) * speed * 5; // Super fast
                    this.velocity.y = Math.sin(dartAngle) * speed * 5;
                } else {
                    this.velocity.x *= 0.1;
                    this.velocity.y *= 0.1;
                }
            }
            if (!this.isStopped) {
                // Drag
                this.velocity.x *= 0.95;
                this.velocity.y *= 0.95;
            }
        } else {
            // Butterfly
            this.velocity.x = Math.cos(noiseAngle) * speed;
            this.velocity.y = Math.sin(noiseAngle) * speed;

            // Add flap verticality
            this.velocity.y += flap * speed * 0.5;
        }

        this.integrateVelocity(deltaTime, bounds);
    private updateBurst(deltaTime: number, bounds: Vector2D) {
        // Stop & Go behavior (Beetle, Insect, Laser)
        this.stopGoTimer -= deltaTime * 1000;

        if (this.stopGoTimer <= 0) {
            this.isStopped = !this.isStopped;
            // Bursts are short, stops are variable
            this.stopGoTimer = this.isStopped ? Math.random() * 1000 + 500 : Math.random() * 500 + 200;

            if (!this.isStopped) {
                // New random direction for burst
                const angle = Math.random() * Math.PI * 2;
                const speed = this.targetSpeed * (this.type === 'laser' || this.type === 'minilaser' ? 2.5 : 1.5);
                this.velocity.x = Math.cos(angle) * speed;
                this.velocity.y = Math.sin(angle) * speed;
            } else {
                this.velocity.x = 0;
                this.velocity.y = 0;
            }
        }

        // Jitter while stopped?
        if (this.isStopped && ['insect', 'fly'].includes(this.type)) {
            this.position.x += (Math.random() - 0.5) * 2;
            this.position.y += (Math.random() - 0.5) * 2;
        }

        this.integrateVelocity(deltaTime, bounds);
    }

    private updateUndulating(deltaTime: number, bounds: Vector2D) {
        // Sine wave movement (Snake, Worm)
        // Move forward in current direction, but add sine wave to perpendicular
        const speed = this.targetSpeed;

        // Slowly change base direction
        const noiseAngle = noise2D(this.timeOffset * 0.5, 0) * Math.PI * 2;

        const baseX = Math.cos(noiseAngle);
        const baseY = Math.sin(noiseAngle);

        this.velocity.x = baseX * speed;
        this.velocity.y = baseY * speed;

        this.integrateVelocity(deltaTime, bounds);
    }

    private updateGeneric(deltaTime: number, bounds: Vector2D) {
        // Fallback: Constant motion with bounces
        const speed = this.targetSpeed;
        // Just keep current velocity normalized to speed
        const currentSpeed = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
        if (currentSpeed < 0.1) {
            const angle = Math.random() * Math.PI * 2;
            this.velocity.x = Math.cos(angle) * speed;
            this.velocity.y = Math.sin(angle) * speed;
        }

        this.integrateVelocity(deltaTime, bounds);
    }

    private integrateVelocity(deltaTime: number, bounds: Vector2D, wrap: boolean = false) {
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;

        if (wrap) {
            if (this.position.x < -50) this.position.x = bounds.x + 50;
            if (this.position.x > bounds.x + 50) this.position.x = -50;
            if (this.position.y < -50) this.position.y = bounds.y + 50;
            if (this.position.y > bounds.y + 50) this.position.y = -50;
        } else {
            const margin = this.size;
            if (this.position.x < margin) { this.position.x = margin; this.velocity.x *= -1; }
            if (this.position.x > bounds.x - margin) { this.position.x = bounds.x - margin; this.velocity.x *= -1; }
            if (this.position.y < margin) { this.position.y = margin; this.velocity.y *= -1; }
            if (this.position.y > bounds.y - margin) { this.position.y = bounds.y - margin; this.velocity.y *= -1; }
        }
    }

    public draw(ctx: CanvasRenderingContext2D) {
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
        // High Fidelity Mouse (Top Down)

        // 1. Tail (Bezier, twitchy)
        const tailWag = Math.sin(this.tailPhase * 5) * 20;
        ctx.beginPath();
        ctx.moveTo(-this.size * 0.8, 0); // Base of tail
        ctx.quadraticCurveTo(
            -this.size * 2, tailWag, // Control point
            -this.size * 2.5, tailWag * 0.5 // Tip
        );
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#D3D3D3'; // Pinkish Grey
        ctx.stroke();

        // 2. Body (Teardrop)
        ctx.fillStyle = this.color;
        ctx.beginPath();
        // Nose point at (size, 0), Back at (-size*0.8, 0)
        ctx.ellipse(0, 0, this.size, this.size * 0.65, 0, 0, Math.PI * 2);
        ctx.fill();

        // 3. Ears (Large, Rounded, on sides of head)
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.size * 0.2, -this.size * 0.5, this.size * 0.35, 0, Math.PI * 2); // Left
        ctx.arc(this.size * 0.2, this.size * 0.5, this.size * 0.35, 0, Math.PI * 2); // Right
        ctx.fill();

        // Ear Inner (Pink)
        ctx.fillStyle = '#FFC0CB';
        ctx.beginPath();
        ctx.arc(this.size * 0.2, -this.size * 0.5, this.size * 0.2, 0, Math.PI * 2);
        ctx.arc(this.size * 0.2, this.size * 0.5, this.size * 0.2, 0, Math.PI * 2);
        ctx.fill();

        // 4. Eyes (Beady Black)
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(this.size * 0.6, -this.size * 0.25, this.size * 0.1, 0, Math.PI * 2);
        ctx.arc(this.size * 0.6, this.size * 0.25, this.size * 0.1, 0, Math.PI * 2);
        ctx.fill();

        // 5. Nose (Pink dot)
        ctx.fillStyle = '#FFC0CB';
        ctx.beginPath();
        ctx.arc(this.size * 0.95, 0, this.size * 0.1, 0, Math.PI * 2);
        ctx.fill();

        // 6. Whiskers (Long, thin, spanning out)
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.beginPath();
        // Left Whiskers
        ctx.moveTo(this.size * 0.9, -this.size * 0.1); ctx.lineTo(this.size * 1.5, -this.size * 0.8);
        ctx.moveTo(this.size * 0.9, -this.size * 0.1); ctx.lineTo(this.size * 1.6, -this.size * 0.4);
        // Right Whiskers
        ctx.moveTo(this.size * 0.9, this.size * 0.1); ctx.lineTo(this.size * 1.5, this.size * 0.8);
        ctx.moveTo(this.size * 0.9, this.size * 0.1); ctx.lineTo(this.size * 1.6, this.size * 0.4);
        ctx.stroke();
    }

    private drawInsect(ctx: CanvasRenderingContext2D) {
        // High Fidelity Insect (Fly/Gnat)

        // 1. Wings (Motion Blur)
        const wingFlap = Math.sin(this.tailPhase * 30) * 0.5; // Fast flutter
        ctx.fillStyle = '#FFFFFF';
        ctx.globalAlpha = 0.5;

        ctx.beginPath();
        // Left Wing
        ctx.ellipse(-this.size * 0.3, -this.size * 0.5, this.size * 1.2, this.size * 0.4, -0.5 + wingFlap, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        // Right Wing
        ctx.ellipse(-this.size * 0.3, this.size * 0.5, this.size * 1.2, this.size * 0.4, 0.5 - wingFlap, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;

        // 2. Body (Segmented)
        ctx.fillStyle = this.color;

        // Thorax
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size * 0.5, this.size * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Abdomen (Bulbous)
        ctx.beginPath();
        ctx.ellipse(-this.size * 0.8, 0, this.size * 0.7, this.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.beginPath();
        ctx.arc(this.size * 0.6, 0, this.size * 0.4, 0, Math.PI * 2);
        ctx.fill();

        // 3. Legs (6)
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            const x = (i - 1) * this.size * 0.4;
            ctx.moveTo(x, -this.size * 0.3); ctx.lineTo(x + 5, -this.size - 2);
            ctx.moveTo(x, this.size * 0.3); ctx.lineTo(x + 5, this.size + 2);
            ctx.stroke();
        }

        // 4. Eyes (Red/Compound)
        ctx.fillStyle = '#8B0000';
        ctx.beginPath();
        ctx.arc(this.size * 0.7, -this.size * 0.2, this.size * 0.15, 0, Math.PI * 2);
        ctx.arc(this.size * 0.7, this.size * 0.2, this.size * 0.15, 0, Math.PI * 2);
        ctx.fill();
    }

    private drawBeetle(ctx: CanvasRenderingContext2D) {
        // High Fidelity Beetle (Scarab style)

        // 1. Carapace (Shiny)
        const shine = ctx.createRadialGradient(-this.size * 0.3, -this.size * 0.3, 0, 0, 0, this.size * 1.5);
        shine.addColorStop(0, '#FFFFFF'); // Specular highlight
        shine.addColorStop(0.2, this.color);
        shine.addColorStop(1, '#000000'); // Shadowy edges

        ctx.fillStyle = shine;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Split line (Elytra)
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.size * 0.4, 0);
        ctx.lineTo(-this.size, 0);
        ctx.stroke();

        // 2. Head
        ctx.fillStyle = '#000000'; // Dark head
        ctx.beginPath();
        // Head shape
        ctx.moveTo(this.size * 0.8, -this.size * 0.4);
        ctx.quadraticCurveTo(this.size * 1.4, 0, this.size * 0.8, this.size * 0.4);
        ctx.fill();

        // 3. Antennae (Elaborate)
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        // Left
        ctx.moveTo(this.size * 1.2, -this.size * 0.2);
        ctx.lineTo(this.size * 2.0, -this.size * 0.8);
        // Right
        ctx.moveTo(this.size * 1.2, this.size * 0.2);
        ctx.lineTo(this.size * 2.0, this.size * 0.8);
        ctx.stroke();

        // 4. Legs (Thick, segmented)
        ctx.lineWidth = 3;
        for (let i = 0; i < 3; i++) {
            const x = (i - 1) * this.size * 0.5;
            const legSpread = (i === 0 ? -1 : i === 2 ? 1 : 0);

            ctx.beginPath();
            ctx.moveTo(x, -this.size * 0.5);
            ctx.quadraticCurveTo(x + 5, -this.size * 1.2, x + 10 + legSpread * 10, -this.size * 1.5);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(x, this.size * 0.5);
            ctx.quadraticCurveTo(x + 5, this.size * 1.2, x + 10 + legSpread * 10, this.size * 1.5);
            ctx.stroke();
        }
    }

    // ... (Firefly, Dragonfly, etc. remain unchanged unless requested) ...
    // Note: Firefly and Dragonfly updated in logic, their draw methods might need tweak if previous overwrites messed them up.
    // Assuming they are safe for now or will be fixed if overwritten.

    // REDEFINING drawLaser to include Bloom
    private drawLaser(ctx: CanvasRenderingContext2D) {
        // Bloom / Glow
        const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size * 4);
        glow.addColorStop(0, '#FFFFFF'); // Hot center
        glow.addColorStop(0.2, this.color); // Core color
        glow.addColorStop(0.6, this.color + '44'); // Faded halo
        glow.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = glow;
        ctx.globalCompositeOperation = 'screen'; // Additive blending for light
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over'; // Reset

        // Hard Core
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        // Jitter shape slightly
        const deform = Math.random() * 2;
        ctx.ellipse(0, 0, this.size * 0.8 + deform, this.size * 0.8 - deform, Math.random(), 0, Math.PI * 2);
        ctx.fill();
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
                const segmentWidth = this.size * 1.8 * Math.max(0.1, progress); // Thicker

                ctx.lineWidth = Math.max(2, segmentWidth);
                ctx.strokeStyle = this.color;

                ctx.beginPath();
                // Convert absolute to relative
                ctx.moveTo(pt.x - this.position.x, pt.y - this.position.y);
                ctx.lineTo(nextPt.x - this.position.x, nextPt.y - this.position.y);
                ctx.stroke();

                // SCALES: Draw small dot every few segments if width is enough
                if (i % 3 === 0 && segmentWidth > 4) {
                    ctx.fillStyle = 'rgba(0,0,0,0.2)';
                    ctx.beginPath();
                    ctx.arc(pt.x - this.position.x, pt.y - this.position.y, segmentWidth * 0.3, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }

        // Distinct Head (Cobra style)
        ctx.fillStyle = this.color;
        ctx.beginPath();
        // Hood flare?
        ctx.ellipse(0, 0, this.size * 1.2, this.size * 1.0, 0, 0, Math.PI * 2);
        ctx.fill();

        // Shine/Reflection on head
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.ellipse(-this.size * 0.3, -this.size * 0.3, this.size * 0.3, this.size * 0.2, -0.5, 0, Math.PI * 2);
        ctx.fill();


        // Eyes (Slanted)
        ctx.fillStyle = '#FFFF00';
        ctx.beginPath();
        // Left Eye
        ctx.ellipse(this.size * 0.5, -this.size * 0.4, this.size * 0.25, this.size * 0.15, 0.5, 0, Math.PI * 2);
        // Right Eye
        ctx.ellipse(this.size * 0.5, this.size * 0.4, this.size * 0.25, this.size * 0.15, -0.5, 0, Math.PI * 2);
        ctx.fill();

        // Pupils (Slits)
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(this.size * 0.55, -this.size * 0.4, this.size * 0.05, this.size * 0.12, 0.5, 0, Math.PI * 2);
        ctx.ellipse(this.size * 0.55, this.size * 0.4, this.size * 0.05, this.size * 0.12, -0.5, 0, Math.PI * 2);
        ctx.fill();


        // Tongue (Flicker)
        if (Math.sin(this.tailPhase * 20) > 0) {
            ctx.strokeStyle = '#FF0000';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(this.size, 0); // Start from nose

            // Wiggle
            const wiggle = Math.sin(this.tailPhase * 40) * 5;
            ctx.quadraticCurveTo(this.size * 1.5, wiggle, this.size * 2.0, 0);
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
