# 🧠 The Living Ecosystem: Adaptive AI Logic

**Core Concept**: 
The game does not have "Levels". It has a **Global Confidence Score** (0-100) that represents the "Morale" of the prey population.

## 1. The Confidence Meter
*   **Start**: 50 (Neutral).
*   **Range**: 0 (Terrified) to 100 (Cocky).

### Feedback Loop
*   **Cat Kills Prey**: Confidence **-2** (Prey gets scared).
*   **Prey Escapes / Time Passes**: Confidence **+1** (Prey gets brave).

## 2. Behavioral Mapping

| Confidence | State Name | Behavior Characteristics | Ethological Note |
| :--- | :--- | :--- | :--- |
| **0 - 30** | **Fearful** | Slow movement. Long freezes (3s). No evasion. | "Frozen with fear". Ideal for kittens/learning. |
| **30 - 70** | **Balanced** | Normal speed. Standard stop-and-go. | "Cautious foraging". The standard experience. |
| **70 - 100** | **Apex** | Hyper speed. Instant reaction to touch. "Taunt" moves. | "Evasive prey". Requires reflex mastery. |

## 3. Implementation Details (`GameDirector.ts`)
The `GameDirector` recalculates difficulty on every spawn based on current Confidence.
*   **Speed Multiplier**: Linear interpolation from 0.8x (Fearful) to 2.5x (Apex).
*   **Stop Duration**: 3.0s (Fearful) -> 0.5s (Apex).
*   **Flee Trigger**: Distance based. Fearful prey lets you touch them. Apex prey flees at 100px proximity.

## 4. Developer Tools
### Bypass Device Restriction
To test the game logic on PC/Mac without installing the Android App:
*   Append `?debug=1` to the URL.
*   Example: `http://localhost:5173/play?debug=1`
*   **Note**: This bypasses the `DesktopBlocker` and `MobileWebBlocker`. Touch events might be simulated via mouse clicks.

---
*This ecosystem ensures that a bored cat gets a challenge (Confidence rises), and a frustrated cat gets a win (Confidence falls).*
