# 🦁 FELIS: Apex Hunter - Project Brief

**"The First Mobile Game Designed for Apex Predators."**

## 🎯 The Vision
CatEngage isn't just a "game for cats." It is an **Ethological Training Tool**.
Most cat games are just random animations. We use science-backed triggers (450-550nm light spectrum, 3-8kHz ultrasonic audio, and specific movement algorithms) to stimulate a cat's dormant predatory instincts.
**We transform House Cats into Apex Predators.**

---

## 🏗️ Technical Architecture "The TWA Stack"

We use a modern **Hybrid Architecture** to combine the speed of Web Development with the distribution of the Google Play Store.

*   **Core**: React + TypeScript (Vite).
*   **Engine**: Custom HTML5 Canvas Engine (Zero dependencies, 60FPS).
*   **Distribution**: Trusted Web Activity (TWA). The Android App is a thin "Shell" that loads the website.
    *   *Benefit*: Instant Updates. Pushing code to Vercel updates the app on all phones instantly.
*   **Styling**: TailwindCSS (Utility-first).

---

## 💰 Monetization Strategy "Ethological Stamina"

We prioritize the **cat's health** to sell the Premium upgrade.

1.  **The Hook (Free: "Safety First")**:
    *   **90s Session Limit**: Mimics a natural "Hunt Cycle". Prevents overstimulation.
    *   **5m Resting Phase**: Mandatory cooldown. "The cat must rest."
    *   **Quality**: Always 100% (Apex AI). We never downgrade the experience.
    *   **Controls**: Basic Audio/Vibration Toggles.

2.  **The Value (Pro: "Veterinary Control")**:
    *   **Manual Override**: Set Play Time (1m to ∞) and Rest Time (0m to 30m).
    *   **Bio-Rhythm AI**: Auto-adjusts session length based on cat's stress/excitement levels (APM).
    *   **Advanced Tuning**: Fine-tune Audio Frequencies and Haptic Intensity.
    *   **Permanent Stats**: Track the cat's career over months.

---

## 🚀 Go-To-Market

*   **Platform**: Android-First (PWA/TWA).
*   **Visual Identity**: Cyberpunk/Tactical. "Military Briefing" style UI.
*   **Channels**: Viral TikTok/Reels showing cats "Testing the System".

---

## 🛠️ Development & Testing Hooks

To facilitate testing of Pro features without real payments (Google Play Billing), we have implemented a **Dev Toggle**:

*   **Mechanism**: A hidden "Secret Tap" on the **"FELIS"** title in the Main Menu toggles the `isPremium` state locally.
*   **Purpose**: Allows beta testers and developers to verify "Veterinary Control" and "Ethological Stamina" logic instantly.
*   **Deprecation Plan**:
    1.  **Phase 7 (Deployment)**: The toggle will be restricted to `DEV` builds only (using `import.meta.env.DEV`). 
    2.  **Phase 8 (In-App Purchases)**: The toggle will be completely replaced by real Google Play Billing verification. In Production, this backdoor will be removed to prevent revenue loss.
