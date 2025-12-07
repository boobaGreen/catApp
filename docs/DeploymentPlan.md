# Android Deployment Roadmap (From Code to Play Store)

## What is a PWA? 📦
A **Progressive Web App (PWA)** is a website that "pretends" to be a native app.
- **Installable**: Can sit on the home screen with an icon.
- **Offline Capable**: Works even without internet (essential for a game).
- **Full Screen**: Hides the browser URL bar.

## The Strategy: "TWA" (Trusted Web Activity) 🤖
To get into the **Google Play Store**, we don't need to rewrite code in Java. We use a **TWA**.
This wraps your live website into a standard Android package (`.apk` / `.aab`) that Google Play accepts.

**Why Android First?**
- **Cost**: Google Play is **$25 (one-time)**. Apple is **$99/year**.
- **Ease**: Android loves PWAs. Apple makes them difficult.
- **Updates**: Update your website, and the App Store app updates instantly (no review needed for code changes).

---

## Step-by-Step Plan

### Phase 1: The Foundation (PWA) 🏗️
Before going to the store, the web app must be perfect.
1.  **Manifest.json**: The ID card of the app (Name, Icon, Colors).
2.  **Service Worker**: A background script that ensures the game loads offline.
3.  **Assets**: Generate icons for every size (Android requires many).
4.  **Hosting**: The app must live effectively on the web (e.g., Vercel, Netlify, or GitHub Pages).

### Phase 2: The Wrapper (APK Generation) 🎁
Once hosted (e.g., `catengage.vercel.app`), we package it.
1.  **Tool**: Use **PWABuilder.com** (Official Microsoft/Google tool).
2.  **Input**: Enter our URL.
3.  **Key Signing**: Create a digital "signature" (Keystore) to prove we own the app.
4.  **Output**: Download the `.aab` (Android App Bundle) file.

### Phase 3: The Store (Google Play Console) 🏪
1.  **Account**: Pay $25 to open a Developer Account.
2.  **Listing**: Upload Title, Description, Screenshots, and that beautiful "Ethology" graphic.
3.  **Privacy Policy**: We need a simple page saying "We don't steal user data".
4.  **Release**: Upload the `.aab` file to the "Production" track.
5.  **Review**: Wait 2-4 days for Google to say "Yes".

---

## Immediate Task List
- [ ] **PWA Configuration**: Install `vite-plugin-pwa` and configure manifest.
- [ ] **Asset Generation**: Create `icon-192.png`, `icon-512.png`, `maskable-icon.png`.
- [ ] **Host Project**: Deploy current build to Vercel/GitHub Pages to test on real phone.
