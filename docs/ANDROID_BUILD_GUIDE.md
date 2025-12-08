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
2.  Copy the `.apk` file to your phone.
3.  Install it (Allow "Unknown Sources").
4.  **Verify**:
    - Launch the app.
    - It should hide the URL bar.
    - It should look like a native game.
    - Toggle the "Pro Mode" secret title tap.

## 🔐 Next Step: Asset Links (Ownership)
Once you confirm the APK works, we need to upload the `assetlinks.json` file (from the ZIP) to your Vercel project (`public/.well-known/assetlinks.json`) to prove to Android that you own the website. This removes the "url bar" in some edge cases and validates the TWA.
