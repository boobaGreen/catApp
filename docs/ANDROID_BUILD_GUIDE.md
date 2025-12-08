# 📱 Android TWA Build Guide (Phase 7)

Since we are using a **Trusted Web Activity (TWA)** architecture, we don't compile code manually. We use **PWABuilder** to wrap your live website into an Android App.

## Prerequisites
- **Live URL**: `https://cat-app-five-flame.vercel.app/`
- **Icon**: `pwa-512x512.png` is already live on your site.

---

## 🚀 Step-by-Step Generation

1.  **Go to PWABuilder**:
    - Open [https://www.pwabuilder.com/](https://www.pwabuilder.com/).

2.  **Enter URL**:
    - Paste: `https://cat-app-five-flame.vercel.app/`
    - Click **Start**.

3.  **Audit**:
    - You will see a score. It should be fully green (Manifest, Service Worker, Security).
    - If it asks for "Store content", you can fill it locally or skip for now.

4.  **Generate Android App**:
    - Click the **Package for Stores** button.
    - Select **Android**.
    - **Options**:
        - **Package ID**: `com.agilelab.felis` (or similar).
        - **App Name**: `FELIS: Apex Hunter`.
        - **Launcher Name**: `FELIS`.
        - **Signing Key**: Select "Create New" (for now) or upload if you have one.
    - Click **Generate**.

5.  **Download**:
    - You will get a ZIP file.
    - Extract it. You will find:
        - `assetlinks.json` (Important for later).
        - `app-release-signed.apk` (Installable on your phone immediately).
        - `app-release.aab` (For Google Play Store upload).

---

## 🧪 How to Test (Beta)

1.  Connect your Android phone to PC via USB.
# 📱 Android TWA Build Guide (Phase 7)

Since we are using a **Trusted Web Activity (TWA)** architecture, we don't compile code manually. We use **PWABuilder** to wrap your live website into an Android App.

## Prerequisites
- **Live URL**: `https://apex-hunter.eu`
- **Icon**: `pwa-512x512.png` is already live on your site.

---

## 🚀 Step-by-Step Generation

1.  **Go to PWABuilder**:
    - Open [https://www.pwabuilder.com/](https://www.pwabuilder.com/).

2.  **Enter URL**:
    - Paste: `https://apex-hunter.eu/`
    - Click **Start**.

3.  **Audit**:
    - You will see a score. It should be fully green (Manifest, Service Worker, Security).
    - If it asks for "Store content", you can fill it locally or skip for now.

4.  **Generate Android App**:
    - Click the **Package for Stores** button.
    - Select **Android**.
    - **Options**:
        - **Package ID**: `com.agilelab.felis` (or similar).
        - **App Name**: `FELIS: Apex Hunter`.
        - **Launcher Name**: `FELIS`.
        - **Signing Key**: Select "Create New" (for now) or upload if you have one.
    - Click **Generate**.

5.  **Download**:
    - You will get a ZIP file.
    - Extract it. You will find:
        - `assetlinks.json` (Important for later).
        - `app-release-signed.apk` (Installable on your phone immediately).
        - `app-release.aab` (For Google Play Store upload).

---

## 🧪 How to Test (Beta)

1.  Connect your Android phone to PC via USB.
2.  Copy the `.apk` file to your phone.
3.  Install it (Allow "Unknown Sources").
4.  **Verify**:
    - Launch the app.
    - It should hide the URL bar.
    - It should look like a native game.
    - Toggle the "Pro Mode" secret title tap.

## 1. Prepare your PWA
Ensure your project is deployed and accessible via HTTPS.
**Current Production URL**: `https://apex-hunter.eu` (Previously `cat-app-five-flame.vercel.app`)

> [!IMPORTANT]
> **Re-Build Required**: Now that we have a custom domain (`apex-hunter.eu`), you MUST generate the Android App Bundle using this new URL. If you use the old Vercel URL, the TWA verification layout might break.

### **Asset Links (The Key to Fullscreen)**
You must host a file at `https://apex-hunter.eu/.well-known/assetlinks.json`.
We have already created this file in `public/.well-known/assetlinks.json`.
It contains the fingerprint (SHA-256) of your signing key.
This proves to Android that you own the website. This removes the "url bar" in some edge cases and validates the TWA.
