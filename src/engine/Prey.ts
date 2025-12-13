import { createNoise2D } from 'simplex-noise';
import type { PreyEntity, Vector2D, SpawnConfig } from './types';
import { GAME_CONFIG } from './constants';

const noise2D = createNoise2D();

// VERLET PHYSICS ENGINE
interface VerletNode {
    x: number;
    y: number;
    oldX: number;
    oldY: number;
    radius: number;
    isPinned?: boolean; // For debugging or specialized behaviors
}

interface VerletConstraint {
    p1: VerletNode;
    p2: VerletNode;
    length: number;
    stiffness: number; // 0..1
}

export class Prey implements PreyEntity {
    // ... (Existing properties)

    // VERLET STATE (Worm Only)
    private nodes: VerletNode[] = [];
    private constraints: VerletConstraint[] = [];
    private muscleTimer: number = 0; // For peristalsis wave

    id: string;
    position: Vector2D;
    velocity: Vector2D;
    type: 'mouse' | 'insect' | 'worm' | 'laser' | 'butterfly' | 'feather' | 'beetle' | 'firefly' | 'dragonfly' | 'gecko' | 'spider' | 'snake' | 'waterdrop' | 'fish';
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
    private heading: number = 0;

    // RADICAL OVERHAUL: Waypoint System
    private currentTarget: Vector2D | null = null;
    private waitTimer: number = 0;

    // Deep Mac / Burrowing properties
    private burrowProgress: number = 1.0; // 0 = Underground, 1 = Surface
    private burrowState: 'hidden' | 'emerging' | 'surface' = 'surface';

    private snakeSegments: Vector2D[] = []; // For Smooth Snake

    // Director injected behaviors
    private behaviorFlags: { canFlee: boolean, isEvasive: boolean };
    private fleeTarget: Vector2D | null = null;

    // SNAKE AI PROPERTIES
    private snakeState: 'cruise' | 'coil' | 'glide' = 'cruise';
    private snakeStateTimer: number = 0;
    private wallTangentTimer: number = 0; // Boredom meter for parallel movement
    private meanderTimer: number = 0;
    private meanderVector: Vector2D = { x: 0, y: 0 };

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
        // ETHOLOGICAL SPAWN POSITIONS
        const edgeSpawners = ['mouse', 'insect', 'beetle', 'firefly', 'dragonfly', 'butterfly', 'fish'];

        if (edgeSpawners.includes(this.type)) {
            // ETHOLOGICAL SPAWN: Always enter from outside
            const side = Math.floor(Math.random() * 4); // 0:L, 1:R, 2:T, 3:B
            const offset = 80;

            if (side === 0) { // Left
                this.position = { x: -offset, y: Math.random() * bounds.y };
                this.velocity = { x: 1, y: 0 };
            } else if (side === 1) { // Right
                this.position = { x: bounds.x + offset, y: Math.random() * bounds.y };
                this.velocity = { x: -1, y: 0 };
            } else if (side === 2) { // Top
                this.position = { x: Math.random() * bounds.x, y: -offset };
                this.velocity = { x: 0, y: 1 };
            } else { // Bottom
                this.position = { x: Math.random() * bounds.x, y: bounds.y + offset };
                this.velocity = { x: 0, y: -1 };
            }
        } else if (['gecko'].includes(this.type)) {
            // Gecko still spawns on walls
            if (Math.random() > 0.5) {
                this.position = { x: Math.random() > 0.5 ? 10 : bounds.x - 10, y: Math.random() * bounds.y };
            } else {
                this.position = { x: Math.random() * bounds.x, y: Math.random() > 0.5 ? 10 : bounds.y - 10 };
            }
        } else if (this.type === 'spider' || this.type === 'waterdrop' || this.type === 'feather') {
            // Ceiling / Sky only
            this.position = {
                x: Math.random() * bounds.x,
                y: -50 // Above screen
            };
        } else if (this.type === 'snake') {
            // Side or Bottom (Terrestrial)
            const side = Math.random() > 0.33 ? 3 : (Math.random() > 0.5 ? 0 : 1); // Biased to Bottom (3), else L/R
            const offset = 80;

            if (side === 0) { // Left
                this.position = { x: -offset, y: bounds.y - 50 }; // Low to ground
            } else if (side === 1) { // Right
                this.position = { x: bounds.x + offset, y: bounds.y - 50 };
            } else { // Bottom
                this.position = { x: Math.random() * bounds.x, y: bounds.y + offset };
            }
        } else if (this.type === 'worm') {
            // EXCEPTION: Underground (Anywhere)
            this.position = {
                x: Math.random() * bounds.x,
                y: Math.random() * bounds.y
            };
        } else {
            // Laser / Default -> Random
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

            case 'laser':
                // User Feedback: Small sharp pointer
                this.color = '#00FF00'; // Classic Green
                this.baseSize = GAME_CONFIG.SIZE_MOUSE * 0.2; // Tiny sharp dot
                this.baseSpeed = GAME_CONFIG.SPEED_RUN * 2.5; // Very fast
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
                this.baseSize = GAME_CONFIG.SIZE_INSECT * 0.8;
                this.baseSpeed = GAME_CONFIG.SPEED_STALK * 0.8;
                break;

            case 'gecko': // Explicit case for sizing
                this.color = '#40E0D0'; // Turquoise
                this.baseSize = GAME_CONFIG.SIZE_MOUSE * 0.6; // Smaller
                this.baseSpeed = GAME_CONFIG.SPEED_RUN * 1.2;
                break;

            case 'waterdrop':
                this.color = '#4FA4F4';
                // User Feedback: Varying sizes
                this.baseSize = GAME_CONFIG.SIZE_MOUSE * (0.5 + Math.random() * 0.5);
                this.baseSpeed = GAME_CONFIG.SPEED_STALK * (0.8 + Math.random() * 0.4); // Gravity controlled varied speed
                break;

            case 'fish':
                this.color = '#FFA500'; // Orange Koi
                this.baseSize = GAME_CONFIG.SIZE_MOUSE * 0.7; // Smaller
                this.baseSpeed = GAME_CONFIG.SPEED_STALK * 1.5;
                break;

            case 'snake':
                this.color = '#32CD32'; // Green
                this.baseSize = GAME_CONFIG.SIZE_MOUSE * 0.5;
                this.baseSpeed = GAME_CONFIG.SPEED_RUN * 0.8;
                // Initialize segments for smooth movement
                for (let i = 0; i < 15; i++) {
                    this.snakeSegments.push({ ...this.position });
                }
                // Also init trail for drawing
                this.trail.push({ ...this.position });
                break;

            case 'worm':
                this.color = '#FFD700'; // Gold
                this.baseSize = GAME_CONFIG.SIZE_MOUSE * 0.15; // Tiny

                this.baseSpeed = GAME_CONFIG.SPEED_STALK;

                // VERLET INITIALIZATION
                const numNodes = 30;
                const startX = this.position.x;
                const startY = this.position.y;

                for (let i = 0; i < numNodes; i++) {
                    this.nodes.push({
                        x: startX,
                        y: startY + i * 5, // Slightly offset
                        oldX: startX,
                        oldY: startY + i * 5,
                        radius: this.baseSize
                    });
                }

                // Connect constraints
                for (let i = 0; i < numNodes - 1; i++) {
                    this.constraints.push({
                        p1: this.nodes[i],
                        p2: this.nodes[i + 1],
                        length: 10, // Base segment length
                        stiffness: 0.8
                    });
                }

                // Deep Mac: Start underground
                this.burrowProgress = 0;
                this.burrowState = 'emerging';
                this.isStopped = true;
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

        // ETHOLOGICAL FIX: Ensure initial velocity has correct magnitude
        // (Because spawn logic sets direction only)
        if (this.velocity.x !== 0 || this.velocity.y !== 0) {
            const mag = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
            this.velocity.x = (this.velocity.x / mag) * this.currentSpeed;
            this.velocity.y = (this.velocity.y / mag) * this.currentSpeed;
        }
    }

    public resize(scale: number) {
        // WORM MOBILE FIX: Strong Boost (2.2x) ("Bigger again")
        let effectiveScale = scale;
        if (this.type === 'worm' && scale < 0.8) {
            effectiveScale = scale * 2.2;
        }

        this.size = this.baseSize * effectiveScale;
        this.targetSpeed = this.baseSpeed * effectiveScale;
        if (this.currentSpeed > 0 && this.state !== 'flee') {
            this.currentSpeed = this.targetSpeed;
        }

        // VERLET: Scale constraints if worm
        if (this.type === 'worm' && this.constraints.length > 0) {
            // Re-calculate constraint length based on new scale
            // Base length is 5.
            const newLength = 5 * scale; // Keep length constraint based on screen scale (don't make it too long)
            for (const c of this.constraints) {
                c.length = newLength;
            }
            // Also scale node radii -> USE EFFECTIVE SCALE (Thickness Boost)
            for (const n of this.nodes) {
                n.radius = this.baseSize * effectiveScale;
            }
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

        // 3. BURST/SCUTTLE: Beetle, Firefly
        if (['beetle', 'firefly'].includes(this.type)) {
            this.updateBurst(deltaTime, bounds);
            return;
        }

        // 4. FLY: Insect (Levy Flight)
        if (this.type === 'insect') {
            this.updateFlyBehavior(deltaTime, bounds);
            return;
        }

        if (this.type === 'snake') {
            this.updateSnake(deltaTime, bounds);
            return;
        }



        // 4. UNDULATING: Worm (Snake handled above now)
        // 4. PERISTALSIS: Worm
        if (this.type === 'worm') {
            this.updateVerletOfWorm(deltaTime, bounds);
            return;
        }

        // 5. NEW PHYSICS
        if (this.type === 'laser') {
            this.updateLaser(deltaTime, bounds);
            return;
        }
        if (this.type === 'waterdrop') {
            this.updateGravity(deltaTime, bounds);
            return;
        }
        if (this.type === 'fish') {
            this.updateSwim(deltaTime, bounds);
            return;
        }

        // Default Fallback
        this.updateGeneric(deltaTime, bounds);
    }

    // --- BEHAVIORAL SUBROUTINES ---

    // MOUSE, GECKO, SPIDER
    private updateThigmotaxis(deltaTime: number, bounds: Vector2D) {
        // RADICAL OVERHAUL: Waypoint System (Target-Based)
        // No more "wall following" physics. We pick safe points and run to them.

        // 1. Wait/Idle State
        if (this.waitTimer > 0) {
            this.waitTimer -= deltaTime * 1000;
            this.velocity.x = 0;
            this.velocity.y = 0;
            return;
        }

        // 2. Pick New Target if needed
        const safetyMargin = Math.max(this.size * 2, 120); // Always stay deep inside
        if (!this.currentTarget) {
            this.pickNewTarget(bounds, safetyMargin);
        }

        // 3. Move towards Target
        if (this.currentTarget) {
            const dx = this.currentTarget.x - this.position.x;
            const dy = this.currentTarget.y - this.position.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Distance check tolerance
            if (dist < 20) {
                // Reached Target
                this.position.x = this.currentTarget.x;
                this.position.y = this.currentTarget.y;
                this.currentTarget = null;
                // Wait for a bit (0.2s to 1.5s)
                this.waitTimer = 200 + Math.random() * 1300;
            } else {
                // Move towards target
                this.currentSpeed = this.targetSpeed; // Speed reset
                this.velocity.x = (dx / dist) * this.currentSpeed;
                this.velocity.y = (dy / dist) * this.currentSpeed;
            }
        }

        // FLEE OVERRIDE
        if (this.state === 'flee' && this.fleeTarget) {
            const dx = this.position.x - this.fleeTarget.x;
            const dy = this.position.y - this.fleeTarget.y;
            const angle = Math.atan2(dy, dx);
            this.velocity.x = Math.cos(angle) * this.targetSpeed * 3;
            this.velocity.y = Math.sin(angle) * this.targetSpeed * 3;
        }
        else {
            this.handleWallSteering(bounds);
        }

        this.integrateVelocity(deltaTime, bounds);
    }

    private pickNewTarget(bounds: Vector2D, margin: number) {
        const safeW = bounds.x - margin * 2;
        const safeH = bounds.y - margin * 2;

        this.currentTarget = {
            x: margin + Math.random() * safeW,
            y: margin + Math.random() * safeH
        };
    }

    private handleWallSteering(bounds: Vector2D) {
        // If we hit a wall while running, slide along it instead of bouncing
        const margin = 50;
        const futureX = this.position.x + this.velocity.x * 0.1;
        const futureY = this.position.y + this.velocity.y * 0.1;

        if (futureX < margin) {
            this.position.x = margin;
            // Turn vertical
            this.velocity.x = 0;
            if (Math.abs(this.velocity.y) < 0.1) this.velocity.y = this.currentSpeed * (Math.random() > 0.5 ? 1 : -1);
        }
        else if (futureX > bounds.x - margin) {
            this.position.x = bounds.x - margin;
            this.velocity.x = 0;
            if (Math.abs(this.velocity.y) < 0.1) this.velocity.y = this.currentSpeed * (Math.random() > 0.5 ? 1 : -1);
        }

        if (futureY < margin) {
            this.position.y = margin;
            this.velocity.y = 0;
            if (Math.abs(this.velocity.x) < 0.1) this.velocity.x = this.currentSpeed * (Math.random() > 0.5 ? 1 : -1);
        }
        else if (futureY > bounds.y - margin) {
            this.position.y = bounds.y - margin;
            this.velocity.y = 0;
            if (Math.abs(this.velocity.x) < 0.1) this.velocity.x = this.currentSpeed * (Math.random() > 0.5 ? 1 : -1);
        }
    }

    // BUTTERFLY, DRAGONFLY, FEATHER
    private updateFlight(deltaTime: number, bounds: Vector2D) {
        if (this.type === 'feather') {
            // ADVANCED FALLING LEAF PHYSICS
            // 1. Gravity & Terminal Velocity
            // Base fall speed increases slightly over time until terminal
            const terminalVelocity = this.targetSpeed * 1.5; // Faster than before
            this.velocity.y += deltaTime * 200; // Gravity acceleration
            if (this.velocity.y > terminalVelocity) this.velocity.y = terminalVelocity;

            // 2. Oscillating Drift (Sine Wave)
            // Leaves flutter left/right. The angle determines lift/drag interactions?
            // Simplified: Use composed Sine waves for natural "flutter"
            const flutterFreq = 2.5;
            const flutterAmp = this.targetSpeed * 2.5; // Wide swing
            const sway = Math.sin(this.timeOffset * flutterFreq) * flutterAmp;

            // Secondary wobble
            const wobble = Math.cos(this.timeOffset * 6) * (this.targetSpeed * 0.5);

            this.velocity.x = sway + wobble;

            // 3. Ground Respawn (Infinite Fall)
            // If it hits the bottom, recycle to top immediately
            const futureY = this.position.y + this.velocity.y * deltaTime;
            if (futureY > bounds.y + 50) {
                this.position.y = -50;
                this.position.x = Math.random() * bounds.x;
                this.velocity.y = this.targetSpeed * 0.2; // Reset speed
                this.timeOffset = Math.random() * 100; // Desync
                return; // Skip integration
            }

            this.integrateVelocity(deltaTime, bounds, true);
            return;
        }

        const speed = this.targetSpeed;

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
            // Butterfly: Smoother, slower
            // Perlin noise for direction, but lerp velocity
            const noiseAngle = noise2D(this.timeOffset * 0.5, 100) * Math.PI * 4; // Slower change

            const tx = Math.cos(noiseAngle) * speed;
            const ty = Math.sin(noiseAngle) * speed;

            // Flap adds a bit of burst
            const flap = Math.sin(this.timeOffset * 5);

            this.velocity.x += (tx - this.velocity.x) * deltaTime * 2;
            this.velocity.y += (ty - this.velocity.y) * deltaTime * 2;

            if (flap > 0.8) {
                this.velocity.y -= speed * 0.5; // Little lift
            }
        }

        this.integrateVelocity(deltaTime, bounds);
    }

    private updateFlyBehavior(deltaTime: number, bounds: Vector2D) {
        // LEVY FLIGHT: 90% Buzz (Short/Fast), 10% Dart (Long/Fast), Rare Stops
        this.stopGoTimer -= deltaTime * 1000;

        // Change Behavior State
        if (this.stopGoTimer <= 0) {
            const rand = Math.random();

            if (this.isStopped) {
                // Was stopped, start moving
                this.isStopped = false;
                this.stopGoTimer = 100 + Math.random() * 300; // Buzz duration
            } else {
                // Was moving...
                if (rand < 0.05) {
                    // STOP (Clean wings) - Rare (5%)
                    this.isStopped = true;
                    this.stopGoTimer = 500 + Math.random() * 1000;
                    this.velocity.x = 0;
                    this.velocity.y = 0;
                } else if (rand < 0.20) {
                    // DART (Long flight) - 15%
                    this.stopGoTimer = 500 + Math.random() * 500;
                    const angle = Math.random() * Math.PI * 2;
                    const speed = this.targetSpeed * 2.5; // VERY FAST
                    this.velocity.x = Math.cos(angle) * speed;
                    this.velocity.y = Math.sin(angle) * speed;
                } else {
                    // BUZZ (Short jitter) - 80%
                    this.stopGoTimer = 50 + Math.random() * 150; // Super short
                    const angle = Math.random() * Math.PI * 2;
                    const speed = this.targetSpeed * 1.5;
                    this.velocity.x = Math.cos(angle) * speed;
                    this.velocity.y = Math.sin(angle) * speed;
                }
            }
        }

        this.integrateVelocity(deltaTime, bounds);
    }
    private updateVerletOfWorm(deltaTime: number, bounds: Vector2D) {
        // LAZY INIT: Handle HMR or existing instances properly
        if (this.nodes.length === 0) {
            console.log("Verlet: Lazy Init Worm Nodes");
            const numNodes = 14;
            const startX = this.position.x;
            const startY = this.position.y;

            for (let i = 0; i < numNodes; i++) {
                this.nodes.push({
                    x: startX,
                    y: startY + i * 3, // Tighter spacing (3px)
                    oldX: startX,
                    oldY: startY + i * 3,
                    radius: this.baseSize
                });
            }

            for (let i = 0; i < numNodes - 1; i++) {
                this.constraints.push({
                    p1: this.nodes[i],
                    p2: this.nodes[i + 1],
                    length: 5, // Base length 5
                    stiffness: 0.8
                });
            }

            this.burrowProgress = 0;
            this.burrowState = 'emerging';
            this.isStopped = true;
        }

        // BURROWING LOGIC
        if (this.burrowState === 'emerging') {
            this.burrowProgress += deltaTime * 0.5;
            if (this.burrowProgress >= 1.0) {
                this.burrowProgress = 1.0;
                this.burrowState = 'surface';
            }
        }

        // 1. BEHAVIOR (Peristalsis)
        this.muscleTimer += deltaTime * 5; // Wave speed

        // 2. HEAD MOVEMENT (Procedural Driver)
        // The head (nodes[0]) pulls the rest
        if (this.burrowState === 'surface' || this.burrowState === 'emerging') {
            this.stopGoTimer -= deltaTime * 1000;
            if (this.stopGoTimer <= 0) {
                this.isStopped = !this.isStopped;
                this.stopGoTimer = this.isStopped ? 500 : 300;

                // Change direction when stopping/starting
                if (!this.isStopped) {
                    const noiseAngle = noise2D(this.timeOffset * 0.2, 0) * Math.PI * 4;
                    this.heading = noiseAngle;
                }
            }

            if (!this.isStopped) {
                const speed = this.targetSpeed * (this.burrowState === 'emerging' ? 0.2 : 1.0);
                const head = this.nodes[0];

                // Wall Deflection (Soft Bounce)
                const margin = 20;
                if (head.x < margin && Math.cos(this.heading) < 0) this.heading = 0; // Go Right
                if (head.x > bounds.x - margin && Math.cos(this.heading) > 0) this.heading = Math.PI; // Go Left
                if (head.y < margin && Math.sin(this.heading) < 0) this.heading = Math.PI * 0.5; // Go Down
                if (head.y > bounds.y - margin && Math.sin(this.heading) > 0) this.heading = Math.PI * 1.5; // Go Up

                head.x += Math.cos(this.heading) * speed * deltaTime;
                head.y += Math.sin(this.heading) * speed * deltaTime;
            }
        }

        // 3. VERLET INTEGRATION (Update Positions)
        for (let i = 0; i < this.nodes.length; i++) {
            const p = this.nodes[i];
            if (i === 0 && !this.isStopped && this.burrowState !== 'hidden') continue; // Head is driven manually

            const vx = (p.x - p.oldX) * 0.85; // Heavy drag (0.85 instead of 0.9)
            const vy = (p.y - p.oldY) * 0.85;

            p.oldX = p.x;
            p.oldY = p.y;
            p.x += vx;
            p.y += vy; // No Gravity for Top-Down view
        }

        // 4. CONSTRAINTS (Relaxation) - Run 3 times for stability
        const iterations = 3;
        for (let iter = 0; iter < iterations; iter++) {
            // A. Link Constraints (Spine)
            for (let i = 0; i < this.constraints.length; i++) {
                const c = this.constraints[i];
                const dx = c.p2.x - c.p1.x;
                const dy = c.p2.y - c.p1.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                // MUSCLE: Modulate target length based on wave
                // Wave travels down body (index proportional)
                const wave = Math.sin(this.muscleTimer - i * 0.5);
                const targetLen = c.length * (1.0 + wave * 0.3); // +/- 30% length

                const diff = (targetLen - dist) / dist;

                // Apply correction
                const offset = diff * 0.5 * c.stiffness;
                const offsetX = dx * offset;
                const offsetY = dy * offset;

                // Move p1 (unless head?)
                if (i !== 0 || this.isStopped) { // Don't push head back if driving
                    c.p1.x -= offsetX;
                    c.p1.y -= offsetY;
                }
                c.p2.x += offsetX;
                c.p2.y += offsetY;
            }

            // B. Bounds Constraint
            for (let i = 0; i < this.nodes.length; i++) {
                const p = this.nodes[i];
                p.x = Math.max(0, Math.min(bounds.x, p.x));
                p.y = Math.max(0, Math.min(bounds.y, p.y));
            }
        }

        // Update Entity Position (for camera/game logic) to match Head
        if (this.nodes.length > 0) {
            this.position.x = this.nodes[0].x;
            this.position.y = this.nodes[0].y;
        }
    }

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
                const speed = this.targetSpeed * (this.type === 'laser' ? 2.5 : 1.5);
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



    private updateSnake(deltaTime: number, bounds: Vector2D) {
        // --- 1. STATE MACHINE & RHYTHM (GENTLE) ---
        this.snakeStateTimer -= deltaTime * 1000;

        if (this.snakeStateTimer <= 0) {
            // Pick new state gently
            const r = Math.random();
            if (this.snakeState === 'cruise') {
                if (r < 0.2) {
                    this.snakeState = 'coil';
                    this.snakeStateTimer = 2000 + Math.random() * 2000;
                } else if (r < 0.5) {
                    this.snakeState = 'glide';
                    this.snakeStateTimer = 1500 + Math.random() * 1000;
                } else {
                    this.snakeStateTimer = 3000 + Math.random() * 3000;
                }
            } else if (this.snakeState === 'coil') {
                this.snakeState = r > 0.5 ? 'cruise' : 'glide';
                this.snakeStateTimer = 2000 + Math.random() * 2000;
            } else { // glide
                this.snakeState = 'cruise';
                this.snakeStateTimer = 3000 + Math.random() * 3000;
            }
        }

        // LERP Speed
        let targetSpeedMultiplier = 1.0;
        if (this.snakeState === 'coil') targetSpeedMultiplier = 0.3;
        if (this.snakeState === 'glide') targetSpeedMultiplier = 1.6;

        this.currentSpeed += (this.targetSpeed * targetSpeedMultiplier - this.currentSpeed) * deltaTime * 2.0;

        // --- 2. DIRECTOR AI (WALL BOREDOM) ---
        const margin = 120;
        const isNearWall = (this.position.x < margin || this.position.x > bounds.x - margin ||
            this.position.y < margin || this.position.y > bounds.y - margin);

        if (isNearWall) {
            this.wallTangentTimer += deltaTime;
        } else {
            this.wallTangentTimer = Math.max(0, this.wallTangentTimer - deltaTime * 2);
        }

        // --- 3. MEANDER (ORGANIC DECISION MAKING) ---
        // Instead of constant noise, we take specific "Decisions" to turn.
        this.meanderTimer -= deltaTime;
        if (this.meanderTimer <= 0) {
            // DECISION TIME: Pick a new direction relative to current
            // 0.5s to 2.5s between decisions
            this.meanderTimer = 0.5 + Math.random() * 2.0;

            // Bias: If moving fast (glide), turns are subtler. If slow, turns are sharper.
            const maxTurn = this.snakeState === 'glide' ? Math.PI * 0.25 : Math.PI * 0.8;

            // Random angle
            const turnAngle = (Math.random() - 0.5) * 2 * maxTurn;

            // Apply rotation to current velocity to get target meander vector
            const vx = this.velocity.x;
            const vy = this.velocity.y;
            const cos = Math.cos(turnAngle);
            const sin = Math.sin(turnAngle);

            this.meanderVector.x = vx * cos - vy * sin;
            this.meanderVector.y = vx * sin + vy * cos;

            // Normalize
            const mag = Math.hypot(this.meanderVector.x, this.meanderVector.y);
            if (mag > 0) {
                this.meanderVector.x /= mag;
                this.meanderVector.y /= mag;
            }
        }

        // --- 4. PHYSICS ACCUMULATION ---
        const maxForce = 600.0;
        let ax = 0;
        let ay = 0;

        // Force A: MEANDER (The "Will" of the snake)
        // Steer towards meanderVector
        // Steering = Desired - Velocity
        const desiredMeanderX = this.meanderVector.x * this.currentSpeed;
        const desiredMeanderY = this.meanderVector.y * this.currentSpeed;

        ax += (desiredMeanderX - this.velocity.x) * 1.5; // Weight 1.5
        ay += (desiredMeanderY - this.velocity.y) * 1.5;

        // Force B: WANDER (The "Jitter/Noise")
        // Kept low to add organic imperfection to the determined line
        const noiseVal = noise2D(this.timeOffset * 0.2, 0);
        const wanderTheta = noiseVal * Math.PI * 2;
        const wanderRad = 30; // Reduced jitter

        ax += Math.cos(wanderTheta) * wanderRad;
        ay += Math.sin(wanderTheta) * wanderRad;


        // Force C: CONTAINMENT (Prioritized)
        const lookAheadTime = 0.8;
        const futureX = this.position.x + this.velocity.x * lookAheadTime;
        const futureY = this.position.y + this.velocity.y * lookAheadTime;

        let steerX = 0;
        let steerY = 0;
        let hitWall = false;
        const hardMargin = 50;

        if (futureX < hardMargin) { steerX = this.currentSpeed; hitWall = true; }
        else if (futureX > bounds.x - hardMargin) { steerX = -this.currentSpeed; hitWall = true; }

        if (futureY < hardMargin) { steerY = this.currentSpeed; hitWall = true; }
        else if (futureY > bounds.y - hardMargin) { steerY = -this.currentSpeed; hitWall = true; }

        if (hitWall) {
            steerX -= this.velocity.x;
            steerY -= this.velocity.y;
            steerX *= 15.0; // Critical priority
            steerY *= 15.0;
            ax += steerX;
            ay += steerY;
            this.wallTangentTimer = 0;

            // Reset Meander to align with new wall reflection (don't fight the wall)
            // Simply allow next meander update to pick a valid direction, 
            // or set meanderVector roughly to wall reflection?
            // Automatic: Next frame velocity update will shift meander baseline.
        }

        // Force D: DIRECTOR (Boredom Breaker)
        if (this.wallTangentTimer > 2.5 && !hitWall) {
            const centerX = bounds.x / 2;
            const centerY = bounds.y / 2;
            const dirToCenter = { x: centerX - this.position.x, y: centerY - this.position.y };
            const len = Math.hypot(dirToCenter.x, dirToCenter.y);
            if (len > 0) {
                ax += (dirToCenter.x / len) * 800;
                ay += (dirToCenter.y / len) * 800;
            }
        }

        // --- 5. INTEGRATION ---
        const forceMag = Math.sqrt(ax * ax + ay * ay);
        if (forceMag > maxForce) {
            const scale = maxForce / forceMag;
            ax *= scale;
            ay *= scale;
        }

        this.velocity.x += ax * deltaTime;
        this.velocity.y += ay * deltaTime;

        // Speed Control
        const speedSq = this.velocity.x ** 2 + this.velocity.y ** 2;
        if (speedSq > 0) {
            const currentMag = Math.sqrt(speedSq);
            const scale = this.currentSpeed / currentMag;
            this.velocity.x *= scale;
            this.velocity.y *= scale;
        }

        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;

        // Failsafe Bounds
        if (this.position.x < 0) { this.position.x = 0; this.velocity.x *= -1; }
        if (this.position.x > bounds.x) { this.position.x = bounds.x; this.velocity.x *= -1; }
        if (this.position.y < 0) { this.position.y = 0; this.velocity.y *= -1; }
        if (this.position.y > bounds.y) { this.position.y = bounds.y; this.velocity.y *= -1; }


        // --- 6. VISUALS (Path History) ---
        this.trail.unshift({ ...this.position });
        if (this.trail.length > 300) this.trail.length = 300;

        if (this.snakeSegments.length === 0) {
            for (let i = 0; i < 15; i++) this.snakeSegments.push({ ...this.position });
        }

        const spacing = this.size * 0.45;
        let currentTrailIndex = 0;
        let cumulativeDist = 0;

        for (let i = 0; i < this.snakeSegments.length; i++) {
            const targetDist = (i + 1) * spacing;
            while (currentTrailIndex < this.trail.length - 1) {
                const p1 = this.trail[currentTrailIndex];
                const p2 = this.trail[currentTrailIndex + 1];
                const dx = p2.x - p1.x;
                const dy = p2.y - p1.y;
                const segLen = Math.sqrt(dx * dx + dy * dy);

                if (cumulativeDist + segLen >= targetDist) {
                    const remaining = targetDist - cumulativeDist;
                    const ratio = remaining / segLen;
                    this.snakeSegments[i].x = p1.x + (dx) * ratio;
                    this.snakeSegments[i].y = p1.y + (dy) * ratio;

                    // Undulation Logic
                    let stateAmp = 1.0;
                    let stateFreq = 1.0;

                    if (this.snakeState === 'glide') { stateAmp = 0.5; stateFreq = 2.0; }
                    if (this.snakeState === 'coil') { stateAmp = 0.0; }

                    const slitherAmp = this.size * 0.3 * stateAmp;
                    const wavePhase = (this.timeOffset * 5.0 * stateFreq) - (i * 0.5);
                    const wave = Math.sin(wavePhase) * slitherAmp;

                    const nx = -dy / segLen;
                    const ny = dx / segLen;

                    this.snakeSegments[i].x += nx * wave;
                    this.snakeSegments[i].y += ny * wave;

                    break;
                }
                cumulativeDist += segLen;
                currentTrailIndex++;
            }
        }
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


    private updateLaser(deltaTime: number, bounds: Vector2D) {
        // Mechanical/Pointer movement (Perlin Noise but "Smoother/Robot-like")
        const speed = this.targetSpeed * 1.5;

        // Actually, for a "Laser Pointer" feel, it should move towards a noise-target
        const angle = noise2D(this.timeOffset * 0.8, 0) * Math.PI * 4;

        // Smooth interpolation
        this.velocity.x += (Math.cos(angle) * speed - this.velocity.x) * deltaTime * 5;
        this.velocity.y += (Math.sin(angle) * speed - this.velocity.y) * deltaTime * 5;

        this.integrateVelocity(deltaTime, bounds);
    }

    private updateGravity(deltaTime: number, bounds: Vector2D) {
        // Simple Gravity Physics (WaterDrop)
        const gravity = 800; // pixels/s^2

        // User Request: "Cadere più random non sempre allo stessa tempistica"
        // State Machine: Falling -> Splash (Reset) -> Waiting -> Falling

        if (this.isStopped) {
            // Waiting State
            this.stopGoTimer -= deltaTime * 1000;
            if (this.stopGoTimer <= 0) {
                // Start Falling
                this.isStopped = false;
                this.position.y = -this.size * 2; // Above screen
                this.position.x = Math.random() * bounds.x; // Random X
                this.velocity.y = this.targetSpeed * (0.5 + Math.random() * 0.5); // Initial velocity
                this.velocity.x = (Math.random() - 0.5) * 50; // Initial drift
            }
            return;
        }

        this.velocity.y += gravity * deltaTime;
        this.velocity.x *= 0.99; // Drag

        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;

        // Reset if off bottom
        if (this.position.y > bounds.y + this.size) {
            // INFINITE FLOW: Reset immediately to top
            // No waiting, no sound (as requested)
            this.position.y = -this.size * 2; // Above screen
            this.position.x = Math.random() * bounds.x; // Random X
            this.velocity.y = this.targetSpeed * (0.5 + Math.random() * 0.5); // Initial velocity
            this.velocity.x = (Math.random() - 0.5) * 50; // Initial drift
        }
    }

    private updateSwim(deltaTime: number, bounds: Vector2D) {
        // KOI PHYSICS (Heavy, Fluid, Center-Biased)
        const maxForce = 200.0;
        const speed = this.targetSpeed * 0.6; // Slower than mouse
        let ax = 0;
        let ay = 0;

        // 1. WANDER (Base Organic Movement)
        const noiseAngle = noise2D(this.timeOffset * 0.3, 100) * Math.PI * 4;
        const wanderX = Math.cos(noiseAngle) * speed;
        const wanderY = Math.sin(noiseAngle) * speed;

        ax += (wanderX - this.velocity.x) * 1.5;
        ay += (wanderY - this.velocity.y) * 1.5;

        // 2. CENTER BIAS (Keep it visible)
        // Gentle pull towards center to avoid edges
        const centerX = bounds.x / 2;
        const centerY = bounds.y / 2;
        const dirToCenter = { x: centerX - this.position.x, y: centerY - this.position.y };
        const distToCenter = Math.hypot(dirToCenter.x, dirToCenter.y);

        if (distToCenter > 0) {
            // Strength increases as we get further away
            const pullStrength = Math.min(1.0, distToCenter / (Math.min(bounds.x, bounds.y) * 0.4)) * 150;
            ax += (dirToCenter.x / distToCenter) * pullStrength;
            ay += (dirToCenter.y / distToCenter) * pullStrength;
        }

        // 3. WALL AVOIDANCE (Strong & Predictive)
        const lookAhead = 1.0; // Seconds
        const futureX = this.position.x + this.velocity.x * lookAhead;
        const futureY = this.position.y + this.velocity.y * lookAhead;
        const margin = 100;

        let steerX = 0;
        let steerY = 0;
        let hitWall = false;

        if (futureX < margin) { steerX = speed; hitWall = true; }
        else if (futureX > bounds.x - margin) { steerX = -speed; hitWall = true; }

        if (futureY < margin) { steerY = speed; hitWall = true; }
        else if (futureY > bounds.y - margin) { steerY = -speed; hitWall = true; }

        if (hitWall) {
            // Override everything else to turn
            ax += steerX * 5.0;
            ay += steerY * 5.0;
        }

        // 4. INTEGRATION
        // Clamp force
        const forceMag = Math.hypot(ax, ay);
        if (forceMag > maxForce) {
            const scale = maxForce / forceMag;
            ax *= scale;
            ay *= scale;
        }

        this.velocity.x += ax * deltaTime;
        this.velocity.y += ay * deltaTime;

        // Speed Limit
        const velMag = Math.hypot(this.velocity.x, this.velocity.y);
        if (velMag > speed * 1.5) {
            const scale = (speed * 1.5) / velMag;
            this.velocity.x *= scale;
            this.velocity.y *= scale;
        }

        // No Wrap! Use bounce fallback or just standard integration which has defaults.
        // We use standard integration logic but wrap=false
        this.integrateVelocity(deltaTime, bounds, false);
    }

    private integrateVelocity(deltaTime: number, bounds: Vector2D, wrap: boolean = false) {
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;

        // Update Trail (Snake/Worm)
        if (['snake', 'worm'].includes(this.type)) {
            // Add current position to head of trail
            // Only add if far enough from last point to avoid clumping
            const head = this.trail[0];
            if (!head || Math.hypot(head.x - this.position.x, head.y - this.position.y) > 10) {
                this.trail.unshift({ x: this.position.x, y: this.position.y });

                // Limit trail length
                const maxLen = (this.type === 'snake' || this.type === 'worm') ? 35 : 8;
                if (this.trail.length > maxLen) {
                    this.trail.pop();
                }
            }
        }

        if (wrap) {
            if (this.position.x < -50) this.position.x = bounds.x + 50;
            if (this.position.x > bounds.x + 50) this.position.x = -50;
            if (this.position.y < -50) this.position.y = bounds.y + 50;
            if (this.position.y > bounds.y + 50) this.position.y = -50;
        } else {
            // ETHOLOGICAL BOUNDARY handling
            if (this.type === 'mouse') {
                // Mice can enter and exit. Do not bounce.
                // However, if they are DEEP inside, maybe we discourage wall clipping unless they 'want' to leave?
                // For now, simple: No artificial bounds. Let behaviors drive them.
                return;
            }

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

        if (Math.abs(this.velocity.x) > 0.1 || Math.abs(this.velocity.y) > 0.1) {
            this.heading = Math.atan2(this.velocity.y, this.velocity.x);
        }
        let rotation = this.heading;

        // Special Start Case: If never moved? (Heading 0 is fine)

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

            case 'snake':
                this.drawSnake(ctx);
                break;
            case 'waterdrop':
                this.drawWaterDrop(ctx);
                break;
            case 'fish':
                this.drawFish(ctx);
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
        const wingFlap = this.isStopped ? 0 : Math.sin(this.tailPhase * 30) * 0.5; // Fast flutter
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
        // High Intensity Central Point (User Request: "Puntatore Laser")
        // No large soft bloom provided, just a tiny hot core and a sharp halo.

        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;

        // Inner Core (White Hot)
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.6, 0, Math.PI * 2);
        ctx.fill();

        // Outer Hard Glow (Green/Color)
        ctx.fillStyle = this.color;
        ctx.beginPath();
        // Slightly unstable size for realism
        const jitter = Math.random() * 0.2;
        ctx.arc(0, 0, this.size * (1.2 + jitter), 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
    }

    private drawWaterDrop(ctx: CanvasRenderingContext2D) {
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#4FA4F4'; // Water Blue

        // Elongated Teardrop (Pointing Left/Back in local space -> Up in global)
        ctx.beginPath();
        ctx.moveTo(-this.size * 2.5, 0); // Tip at Back (Up when falling)
        // Top half
        ctx.bezierCurveTo(
            -this.size * 0.5, -this.size,
            this.size * 1.5, -this.size,
            this.size * 1.5, 0
        );
        // Bottom half
        ctx.bezierCurveTo(
            this.size * 1.5, this.size,
            -this.size * 0.5, this.size,
            -this.size * 2.5, 0
        );
        ctx.fill();

        // Shine (highlight on curvature - Bulb is at +X)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.ellipse(this.size * 0.8, -this.size * 0.5, this.size * 0.3, this.size * 0.15, 0.5, 0, Math.PI * 2);
        ctx.fill();
    }

    private drawFish(ctx: CanvasRenderingContext2D) {
        ctx.shadowBlur = 0;
        // High Fidelity Koi

        const tailWag = Math.sin(this.tailPhase * 5) * 0.5;

        // 1. Side Fins (Pectoral)
        ctx.fillStyle = this.color + 'DD'; // Slightly transparent
        ctx.beginPath();
        // Left Fin
        ctx.ellipse(this.size * 0.5, -this.size * 0.6, this.size * 0.6, this.size * 0.3, -0.5 - tailWag * 0.5, 0, Math.PI * 2);
        ctx.fill();
        // Right Fin
        ctx.beginPath();
        ctx.ellipse(this.size * 0.5, this.size * 0.6, this.size * 0.6, this.size * 0.3, 0.5 + tailWag * 0.5, 0, Math.PI * 2);
        ctx.fill();

        // 2. Body (Tapered Ellipse)
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.size * 1.5, 0); // Nose
        ctx.quadraticCurveTo(0, -this.size * 0.9, -this.size * 1.5, 0); // Top curve
        ctx.quadraticCurveTo(0, this.size * 0.9, this.size * 1.5, 0); // Bottom curve
        ctx.fill();

        // 3. Tail (Flowing)
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(-this.size * 1.2, 0);
        ctx.quadraticCurveTo(-this.size * 2.5, tailWag * 10, -this.size * 3.0, -this.size + tailWag * 15);
        ctx.lineTo(-this.size * 3.0, this.size + tailWag * 15);
        ctx.quadraticCurveTo(-this.size * 2.5, tailWag * 10, -this.size * 1.2, 0);
        ctx.fill();

        // 4. Pattern (Calico spots)
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size * 0.6, this.size * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#000000'; // Black spots
        ctx.beginPath();
        ctx.arc(this.size * 0.8, -this.size * 0.2, this.size * 0.15, 0, Math.PI * 2);
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
        // Head
        ctx.beginPath();
        ctx.arc(this.size, 0, this.size * 0.6, 0, Math.PI * 2);
        ctx.fill();

        // Body (Simple)
        ctx.beginPath();
        ctx.ellipse(-this.size, 0, this.size * 1.5, this.size * 0.5, 0, 0, Math.PI * 2);
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

    private drawSnake(ctx: CanvasRenderingContext2D) {
        // Smooth Snake using segments
        // Head is at (0,0) in local space? No, context is translated to this.position.
        // Segments are in WORLD space. We need to draw relative to this.position (0,0).

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Draw Segments
        if (this.snakeSegments.length > 0) {
            ctx.save();
            ctx.rotate(-this.heading); // Un-rotate to match World Space coordinates

            // We need to draw from Head (0,0) back to segments
            ctx.beginPath();
            ctx.moveTo(0, 0); // Head center

            for (let i = 0; i < this.snakeSegments.length; i++) {
                const seg = this.snakeSegments[i];
                // Convert world space segment to local space
                const lx = seg.x - this.position.x;
                const ly = seg.y - this.position.y;

                // Use simpler lines or bezier for organic? Lines are safer for now to avoid artifacts
                ctx.lineTo(lx, ly);
            }

            ctx.lineWidth = this.size;
            ctx.strokeStyle = this.color;
            ctx.stroke();

            // Zebra pattern
            ctx.strokeStyle = '#228B22'; // Darker green
            ctx.lineWidth = this.size * 0.4;
            ctx.setLineDash([10, 10]);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.restore();
        }

        // Head Logic (Snake Head)
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size * 0.8, this.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#FFFF00';
        ctx.beginPath();
        ctx.arc(this.size * 0.3, -this.size * 0.3, this.size * 0.2, 0, Math.PI * 2);
        ctx.arc(this.size * 0.3, this.size * 0.3, this.size * 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Tongue
        const flicker = Math.sin(this.tailPhase * 20) > 0.5 ? 1 : 0;
        if (flicker) {
            ctx.strokeStyle = '#FF0000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.size * 0.8, 0);
            ctx.lineTo(this.size * 1.5, 0);
            ctx.lineTo(this.size * 1.8, -this.size * 0.2);
            ctx.moveTo(this.size * 1.5, 0);
            ctx.lineTo(this.size * 1.8, this.size * 0.2);
            ctx.stroke();
        }
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







    private drawWorm(ctx: CanvasRenderingContext2D) {
        // VERLET SOFT BODY RENDERER
        if (this.nodes.length < 2) return;

        ctx.save();
        // No rotation needed? Nodes are in world space.
        // Wait, if we use nodes, they are world space. 
        // But draw functions might be called inside a context transform?
        // Usually drawX functions in this engine seem to expect rotation or handle it?
        // Let's check drawSnake. It rotates back? 
        // "ctx.rotate(-this.heading);" -> Un-rotates to World Space?
        // Actually, the main game loop likely translates to `this.position` and rotates to `this.heading`.
        // If my nodes are in WORLD space, I need to undo all transforms.

        // Undo standard transforms to draw in World Space
        ctx.rotate(-this.heading);
        ctx.translate(-this.position.x, -this.position.y);

        // 1. Calculate Skin Points (Left/Right Hull)
        const leftHull: { x: number, y: number }[] = [];
        const rightHull: { x: number, y: number }[] = [];

        for (let i = 0; i < this.nodes.length; i++) {
            // Masking for Burrowing
            if (this.burrowState === 'emerging') {
                const visibleNodes = this.nodes.length * this.burrowProgress;
                if (i > visibleNodes) continue;
            }

            const p = this.nodes[i];

            // Calculate normal
            let dx = 0, dy = 0;
            if (i < this.nodes.length - 1) {
                dx = this.nodes[i + 1].x - p.x;
                dy = this.nodes[i + 1].y - p.y;
            } else if (i > 0) {
                dx = p.x - this.nodes[i - 1].x;
                dy = p.y - this.nodes[i - 1].y;
            }

            const len = Math.max(0.1, Math.hypot(dx, dy));
            const nx = -dy / len;
            const ny = dx / len;

            // Width Modulation (Compression = Fatter)
            let w = p.radius;

            // Tapering
            if (i < 3) w *= 0.7 + (i * 0.1);
            if (i > this.nodes.length - 5) w *= 0.5;

            // Clitellum Bulge
            const isClitellum = (i >= 8 && i <= 11);
            if (isClitellum) w *= 1.3;

            leftHull.push({ x: p.x + nx * w * 0.5, y: p.y + ny * w * 0.5 });
            rightHull.push({ x: p.x - nx * w * 0.5, y: p.y - ny * w * 0.5 });
        }

        if (leftHull.length < 2) {
            ctx.restore();
            return;
        }

        // 2. Draw Skin Segment by Segment
        for (let i = 0; i < leftHull.length - 1; i++) {
            const l1 = leftHull[i];
            const r1 = rightHull[i];
            const l2 = leftHull[i + 1];
            const r2 = rightHull[i + 1];

            const isClitellum = (i >= 8 && i <= 11);

            // Perpendicular Gradient (Volumetric)
            const grad = ctx.createLinearGradient(l1.x, l1.y, r1.x, r1.y);
            if (isClitellum) {
                grad.addColorStop(0, '#5A2D2D'); // Dark Red
                grad.addColorStop(0.5, '#E9967A'); // Dark Salmon
                grad.addColorStop(1, '#5A2D2D');
            } else {
                grad.addColorStop(0, '#5D4037'); // Brown
                grad.addColorStop(0.4, '#D2691E'); // Chocolate
                grad.addColorStop(0.6, '#D2691E');
                grad.addColorStop(1, '#5D4037');
            }

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(l1.x, l1.y);
            ctx.lineTo(l2.x, l2.y);
            ctx.lineTo(r2.x, r2.y);
            ctx.lineTo(r1.x, r1.y);
            ctx.fill();

            // Rib lines (Segmentation)
            if (i % 1 === 0) { // Draw every segment
                ctx.beginPath();
                ctx.moveTo(l1.x, l1.y);
                ctx.lineTo(r1.x, r1.y);
                ctx.strokeStyle = 'rgba(40, 20, 10, 0.3)'; // Darker, cleaner rib
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }
        }

        ctx.restore();
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
