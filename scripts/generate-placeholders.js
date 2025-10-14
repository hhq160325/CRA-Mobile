const fs = require('fs');
const path = require('path');


const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Pw8AAn8B9p3aOQAAAABJRU5ErkJggg==';
const pngBuffer = Buffer.from(pngBase64, 'base64');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}


const appImages = [
  'bg.png',
  'whitecar.png',
  'overlay-bg.png',
  'logo.png',
  'eye.png',
  'logo_black.png',
];


const rootAssets = [
  'tesla-model-s-luxury.png',
  'tesla-interior.jpg',
  'tesla-dashboard.jpg',
  'bmw-x5-suv.png',
  'bmw-x5-interior.png',
  'bmw-x5-trunk.jpg',
  'sleek-red-sports-car.png',
  'porsche-911-interior.jpg',
  'porsche-engine.jpg',
  'luxury-sedan.png',
  'audi-a8-interior.jpg',
  'audi-technology.jpg',
  'luxury-suv.png',
  'range-rover-interior.jpg',
  'range-rover-offroad.jpg',
  'male-avatar.png',
  'diverse-female-avatar.png',
  'admin-avatar.png',
];

const projectRoot = path.resolve(__dirname, '..');
const appImagesDir = path.join(projectRoot, 'app', 'assets', 'images');
const rootAssetsDir = path.join(projectRoot, 'assets');

ensureDir(appImagesDir);
ensureDir(rootAssetsDir);

appImages.forEach((name) => {
  const p = path.join(appImagesDir, name);
  fs.writeFileSync(p, pngBuffer);
  console.log('Wrote', p);
});

rootAssets.forEach((name) => {
  const p = path.join(rootAssetsDir, name);
  fs.writeFileSync(p, pngBuffer);
  console.log('Wrote', p);
});

console.log('\nPlaceholder assets generated.');
console.log('Run `expo start -c` (or `npx expo start -c`) to clear Metro cache and retry bundling.');
