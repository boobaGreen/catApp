# 🔐 Google Play Billing Setup Guide

This guide explains how to generate the **Service Account JSON Key** required for the game's backend to verify purchases securely.

## Prerequisites
- You must have a **Google Play Console** Developer Account ($25 one-time fee).
- You are logged in as the **Account Owner**.

---

## Step 1: Link Google Cloud Project
1.  Open **[Google Play Console](https://play.google.com/console)**.
2.  Go to **Setup** > **API access** (in the left menu).
3.  If you haven't linked a project yet:
    - Click **Create new Google Cloud project**.
    - Click **Save**.
4.  If you already have a linked project, just note its name.

## Step 2: Create Service Account (The "Robot User")
1.  In the **API access** page, look for the **Service accounts** section.
2.  Click **Create new service account**.
3.  A popup will appear. Click the link **Google Cloud Platform**. (This opens a new tab).
4.  In the Google Cloud tab:
    - Click **+ CREATE SERVICE ACCOUNT** (top center).
    - **Name**: `felis-billing-verifier` (or similar).
    - Click **Create and Continue**.
    - **Role**: Select **Editor** (Project > Editor) or **Pub/Sub Admin**. (For simplicity, Editor works, but for strict security, you can refine later).
    - Click **Done**.

## Step 3: Generate the JSON Key 🔑
1.  In the Google Cloud list of Service Accounts, click on the email of the one you just created (`felis-billing-verifier@...`).
2.  Go to the **KEYS** tab (top menu).
3.  Click **ADD KEY** > **Create new key**.
4.  Select **JSON**.
5.  Click **CREATE**.
6.  **A file will download automatically** (e.g., `api-project-12345-v12345.json`).
    *   🚨 **KEEP THIS FILE SAFE!** It is the master key to your billing data.

## Step 4: Grant Permissions in Play Console
1.  Go back to the **Google Play Console** tab ("API access" page).
2.  Click **Refresh service accounts**. The new account should appear.
3.  Click **Grant access** (or "Manage Play Console permissions") next to the new service account.
4.  **Permissions**:
    - In the "Financial data" tab, check **View financial data**.
    - In the "App permissions" tab, ensuring it has access to **Felis: Apex Hunter**.
    - Click **Invite user** / **Send invitation**.

---

## Step 5: Configure In-App Product
1.  Go to your App in Play Console > **Monetize** > **Products** > **In-app products**.
2.  Click **Create product**.
3.  **Product ID**: `com.felis.apexhunter.premium` (Must match the code!).
4.  **Name**: `Apex Hunter Premium`.
5.  **Description**: `Unlocks veterinary controls and infinite stamina.`
6.  **Price**: Set to **€9.99** (or your base price).
7.  **Status**: Click **Activate**.

---

## 🌍 Step 5.5: Update Store Listing (Branding)
Since we bought a domain, let's look professional.
1.  Go to **Grow users** > **Store presence** > **Store settings**.
2.  In **Store listing contact details** > **Website**.
3.  Change it to: `https://apex-hunter.eu`
4.  Click **Save**.

---

## ✅ Final Check
Once you have the **JSON File** on your computer, tell me!
We will need to copy its content into Vercel (Environment Variables) so the backend can use it.

---

## 🛑 Step 6: IF API ACCESS IS BLOCKED (Verification Pending)
If you cannot see the **API Access** menu, it means Google is still verifying your identity (ID Card). This usually takes 1-3 days.

**Strategy for "Pending" State:**
1.  **Mock Mode (Current)**:
    *   We implement the backend to **always approve** purchases for testing.
    *   This allows you to finish the app and test the UI/UX.
    *   **Env Var**: `GOOGLE_PLAY_CREDENTIALS` = (Empty/Missing).

2.  **Activation (Later)**:
    *   When Google approves your ID, the API Access menu will appear.
    *   Follow Steps 1-3 to get the JSON Key.
    *   **Action**: Go to Vercel > Project Settings > Environment Variables.
    *   **Add**: `GOOGLE_PLAY_CREDENTIALS` = (Paste the entire JSON content).
    *   **Redeploy**: The backend will automatically detect the key and switch to **Real Verification Mode**.

