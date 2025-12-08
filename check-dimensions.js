import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const publicDir = "c:/Users/ClaudioDall'Ara/OneDrive - Agile Lab/Desktop/MySide/catApp/public";

async function checkDimensions() {
    const files = fs.readdirSync(publicDir).filter(f => f.startsWith('screenshot') && f.endsWith('.png'));

    for (const file of files) {
        const filePath = path.join(publicDir, file);
        const metadata = await sharp(filePath).metadata();
        console.log(`${file}: ${metadata.width}x${metadata.height}`);
    }
}

checkDimensions().catch(console.error);
