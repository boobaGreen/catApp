import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Original Artifact Path (Large)
const sourceIcon = "C:/Users/ClaudioDall'Ara/.gemini/antigravity/brain/4bb0027d-f096-42e3-83df-db0f78881f3d/felis_app_icon_1765208206301.png";
const publicDir = "c:/Users/ClaudioDall'Ara/OneDrive - Agile Lab/Desktop/MySide/catApp/public";

async function generateIcons() {
    console.log('Processing Icons...');

    // Ensure public dir exists
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
    }

    // 192x192
    await sharp(sourceIcon)
        .resize(192, 192)
        .png() // Force PNG
        .toFile(path.join(publicDir, 'pwa-192x192.png'));
    console.log('✅ Generated pwa-192x192.png');

    // 512x512
    await sharp(sourceIcon)
        .resize(512, 512)
        .png() // Force PNG
        .toFile(path.join(publicDir, 'pwa-512x512.png'));
    console.log('✅ Generated pwa-512x512.png');
}

generateIcons().catch(console.error);
