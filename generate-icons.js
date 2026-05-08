import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const svgContent = readFileSync(join(__dirname, 'public/icon.svg'));

await sharp(svgContent)
  .resize(192, 192)
  .png()
  .toFile(join(__dirname, 'public/icon-192.png'));

await sharp(svgContent)
  .resize(512, 512)
  .png()
  .toFile(join(__dirname, 'public/icon-512.png'));

await sharp(svgContent)
  .resize(512, 512)
  .png()
  .toFile(join(__dirname, 'public/icon.png'));

const ogSvgContent = readFileSync(join(__dirname, 'public/og-image.svg'));

await sharp(ogSvgContent)
  .resize(1200, 630)
  .png()
  .toFile(join(__dirname, 'public/og-image.png'));

console.log('Icons and OG image generated successfully!');
