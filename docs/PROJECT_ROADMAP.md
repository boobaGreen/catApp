# 🗺️ Project Roadmap - FELIS: Apex Hunter

## ✅ Phase 1: Foundation & Setup
- [x] Initialize Project (Vite + React + TypeScript)
- [x] Configure TailwindCSS with Ethological Palette (Blue, Lime, Yellow)
- [x] Setup Basic Project Structure (Canvas Context, Game Loop)

## ✅ Phase 2: Core Engine (The Predatory Cycle)
- [x] Implement Game Loop (60fps fixed timestep)
- [x] Create `Prey` Class/Entity System
- [x] Implement Movement Algorithms (Perlin Noise / Brownian Motion)
- [x] Implement State Machine (Search -> Stalk -> Pounce -> Kill)

## ✅ Phase 3: Sensory Experience
- [x] Visuals: High Contrast Shapes (Mouse-like, oscillating trails)
- [x] Visuals: Particle Effects for "Kill" (Explosions/Feedback)
- [x] Audio: Integrate High-Pitch Sound Engine (3-8kHz bursts)
- [x] Haptics: Vibration patterns (Navigator Vibrate API)

## ✅ Phase 4: Game Logic & Progression
- [x] Spawning Logic (Periphery, Multi-prey scaling)
- [x] Score/Tracking System (Paw touches, success rate)
- [x] System: Persistent Stats (Auto-save on kill)
- [x] UI: "Cat-Proof" Navigation (Long-press to exit)
- [x] UI: Premium Main Menu & Settings (Glassmorphism, Animations)
- [ ] Feature: "Laser Pointer" Game Mode (Future Update)

## ✅ Phase 5: Polish & Deployment Prep
- [x] System: Game Director (Infinite Progression Algorithm)
- [x] UI: Info/Guide Modal (Glassmorphism, Infographics)
- [x] Documentation: Professional Game Design Document
- [x] Verify Performance (Mobile Optimization)

## ✅ Phase 6: Monetization (Safe Demo Mode)
- [x] **Step 1: Demo Architecture**
  - [x] Created `DemoGameDirector.ts` with "Golden Minute" logic
  - [x] Refactored Engine to support Runtime Director Switching
- [x] **Step 2: UI/UX**
  - [x] Updated `MainMenu` with Premium Hooks
  - [x] "Demo Expired" Logic -> Reduces game to "boring" mode after 60s
  - [x] `StatsPage`: "Apex Predator" Dashboard (Retention Feature)

---

## 🚀 CURRENT: Phase 7: Deployment (Road to Play Store)
> 📘 **See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for full technical details on TWA (.aab) implementation.**

### Step 1: PWA Foundation (Next)
- [ ] Install `vite-plugin-pwa`
- [ ] Configure `manifest.json` (App Name, Colors, Fullscreen Mode)
- [ ] Generate Asset Icons (192px, 512px, Maskable)
- [ ] Register Service Worker for Offline Play
- [ ] **Billing Integration**: Replace mock `togglePremium` with Google Play Billing (via TWA Digital Goods API)

### Step 2: Android TWA Wrapper
- [ ] Use PWABuilder to wrap PWA into .aab (Android App Bundle)
- [ ] Sign the Bundle
- [ ] Upload to Google Play Console

---

## 🌐 Phase 8: Web Presence & Infrastructure
- [ ] **Landing Page**: Create a high-conversion site (Vercel + GoDaddy Domain)
  - Showcase "Predator Science" & "Cat Proof" features
  - Video trailer of cats playing
- [ ] **Payments & Monetization**:
  - **Google Play Billing**: REQUIRED for Android App unlocks (No Stripe allowed inside Play Store apps).
    - Needs: Google Play Developer Account ($25 one-time).
    - Needs: Merchant Profile (Bank account/Tax info).
  - **Stripe**: Use on the Website for "Support the Dev" or "Web Premium" keys.

## 📢 Phase 9: Go-To-Market Strategy
> 🤖 **See [MARKETING_AI_STRATEGY.md](./MARKETING_AI_STRATEGY.md) for the AI Content Workflow.**

- [ ] **TikTok & Instagram (CRITICAL)**:
  - *Strategy*: "Cat Testing" videos. Show real cats going crazy for the game.
  - *Account*: Create a Brand Account (e.g., @CatEngageApp). No personal face needed.
  - *Viral Hook*: "Does your cat have what it takes to be an Apex Predator?"
- [ ] **Reddit**:
  - r/cats (Videos of users using it)
  - r/androidapps (Promo codes)
  - r/indiedev (Technical journey)
- [ ] **X / Twitter**:
  - Build in Public (#indiedev #solodev)
  - Interact with Cat Accounts
