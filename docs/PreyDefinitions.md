# Prey Definitions & AI Rules

## Core Principles

### 1. Single Entity Rule
-   **Rule**: Only **ONE** prey entity may exist on screen at any given time.
-   **Reasoning**: Preserves device battery, maintains focus for the cat, and prevents chaos.
-   **Implementation**: `GameDirector` must verify `activePrey.length === 0` before spawning.

### 2. Natural Entry Rule
-   **Rule**: Prey must **enter** the screen naturally from the edges.
-   **Forbidden**: Instant spawning in the center of the screen (popping in).
-   **Exception**: **Worms** / **Moles**. These biological entities can emerge from the ground (Z-axis) at any X/Y coordinate.
-   **Implementation**: `Prey` constructor or `SpawnConfig` must enforce coordinates outside `bounds` (e.g., `x = -50` or `x = width + 50`).

### 3. Adaptive AI (Difficulty Scaling)
-   **Rule**: Prey behavior improves based on the cat's skill level.
-   **Metric**: "Cat Confidence" (0.0 to 1.0) or simply Session Duration / Kill Count.
-   **Scaling Factors**:
    -   **Speed**: Base speed increases (up to 1.5x).
    -   **Evasiveness**: Probability of `flee` state increases.
    -   **Reflexes**: Reaction time to touch decreases.
-   **Implementation**: `GameDirector` passes a `difficulty` scalar to `Prey` at spawn.

## Prey Specifics

### Mouse
-   **Spawn**: Edge (any side).
-   **Movement**: Wall-hugging, fast darts, pauses.
-   **Reaction**: Freezes on sight, bolts on touch.

### Insect (Fly/Beetle)
-   **Spawn**: Edge (Air for flies, Ground for beetles).
-   **Movement**: Levy Flight (Buzz + Darts).
-   **Reaction**: Repulsed by touch radius.

### Worm
-   **Spawn**: **EXCEPTION** - Ground emergence (Any X/Y).
-   **Movement**: Peristalsis (Physics Soft Body).
-   **Reaction**: Retracts into ground on touch.
