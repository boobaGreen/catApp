# 🦁 Ethological Research: Designing for the Feline Sensory System

**Objective**: To optimize "Felis: Apex Hunter" using advanced scientific data on cat physiology and psychology.
**Date**: December 8, 2025

---

## 👁️ 1. Visual Perception & Engine Tuning

### A. Spectral Sensitivity (The "Cat Palette")
Cats are **dichromatic** (similar to Red-Green colorblind humans).
*   **Peak 1 (Blue-Violet)**: 450nm.
    *   *Hex Target*: `#0000FF` (Pure Blue) to `#4169E1` (Royal Blue).
*   **Peak 2 (Green-Yellow)**: 556nm.
    *   *Hex Target*: `#7FFF00` (Chartreuse) to `#ADFF2F` (Green-Yellow).
*   **Invisible Zone**: Red/Orange/Brown appear as muddied Grey/Dark.
    *   *Action*: remove red indicators. Use High-Contrast White/Blue vs Black background.

### B. Critical Flicker Fusion (CFF) & Motion
*   **The "Strobe Effect"**: Cats have a higher CFF (~100Hz) compared to humans (~60Hz). A standard 60fps game might look "flickery" to them.
*   **Optimized Motion**:
    *   *Target FPS*: 60fps is the **absolute minimum**. Drops below 60 will break the illusion instantly.
    *   *Motion Blur*: Adding a slight "trail" behind fast objects can help smooth the motion gap for feline eyes.

### C. Visual Acuity & Size
*   **Near-Sighted Predators**: Cats focus best at 2-6 meters. At "tablet distance" (<30cm), they rely almost entirely on **Motion Detection** rather than detail.
*   **Optimal Prey Visual Angle**:
    *   Prey should be **2cm - 5cm** physically on screen.
    *   Smaller (>1cm) triggers "Insect" mode (batting).
    *   Larger (<10cm) triggers "Rodent" mode (pouncing).
    *   Too large (>15cm) might trigger fear/avoidance.

---

## 👂 2. Auditory Stimulation (The "Calling Card")

### A. Frequency Range
*   **Range**: 48Hz - 85kHz.
*   **Peak Sensitivity**: **8kHz - 15kHz**. (This is where mouse squeaks and rustling leaves live).
*   **Ultrasonic**: Cats hear >20kHz. Most phone speakers *can* technically emit up to 22kHz, but fidelity is low.
    *   *Strategy*: Prioritize **8kHz - 12kHz** (High pitched, safe for speakers).

### B. Trigger Sounds
1.  **"The Rustle"**: Broadband high-frequency noise (mimicking movement in dry grass). Highly stimulating.
2.  **"The Squeak"**: Short bursts at 8-12kHz.
3.  **"The Purr"**: 20-150Hz. Low frequency vibration. Hard to reproduce on phone audio, but **Haptics** can mimic this.

---

## 🧠 3. Predatory Psychology & Game Loop

### A. The Hunting Cycle
Nature's Loop: *Locate -> Stalk -> Chase -> Pounce -> Kill -> Eat*.
*   **Locate**: Sound/Movement triggers interest.
*   **Stalk**: Prey must STOP occasionally to allow "butt wiggles" (stalking preparation). Continuous movement is unnatural.
*   **Kill**: The most critical moment. If a cat "catches" the tablet but nothing happens (no feedback), frustration builds.

### B. The "Frustration Gap"
*   **Success Rate**: In the wild, domestic cats have a ~30-50% success rate.
*   **Game Design**: A 100% catch rate is boring. A 0% catch rate is frustrating.
*   **Target**: **30-50% Difficulty**. The mouse should "escape" sometimes.
*   **The "Kill Bite"**: When the cat touches the screen:
    1.  **Visual**: Explosion/Particle effect (High Contrast).
    2.  **Audio**: High-pitched "Squeak/Crunch".
    3.  **Haptic**: Strong vibration (simulating physical struggle).

---

## 🛠️ Proposed Adjustments for "Felis"

### 1. Visual Overhaul
*   **Background**: Deep Black (`#000000`) for max contrast.
*   **Prey Colors**:
    *   Mice: Neon Blue (`#4169E1`).
    *   Insects: Chartreuse (`#7FFF00`).
*   **Motion**: Add "pauses" (1-2s) to prey movement to encourage stalking.

### 2. Audio Layer
*   **Idle Sound**: Faint 10kHz "rustling" when prey is off-screen (to attract attention).
*   **Move Sound**: "Skittering" noise synced to velocity.
*   **Catch Sound**: Satisfying "Crunch/Squeak" + Vibration.

### 3. "The Living Ecosystem" (Adaptive AI)
*   **Dynamic Difficulty Adjustment (DDA)**: Based on "Flow Channel Theory".
    *   **Boredom**: If cat misses/ignores, difficulty increases (Prey Confidence UP).
    *   **Frustration**: If cat kills, difficulty decreases (Prey Confidence DOWN).
*   **Mechanic**:
    *   **Confidence Score**: 0 (Easy) to 100 (Hard).
    *   **Behavior**:
        *   *Low Confidence*: Long Freezes, Slow Reactions.
        *   *High Confidence*: Short Freezes, Evasive Dodges.
