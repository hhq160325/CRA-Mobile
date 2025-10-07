// Helper to map mock-data image paths (string) to require() references for React Native
const assetMap: Record<string, any> = {
  '/tesla-model-s-luxury.png': require('../assets/tesla-model-s-luxury.png'),
  '/tesla-interior.jpg': require('../assets/tesla-interior.jpg'),
  '/tesla-dashboard.jpg': require('../assets/tesla-dashboard.jpg'),
  '/bmw-x5-suv.png': require('../assets/bmw-x5-suv.png'),
  '/bmw-x5-interior.png': require('../assets/bmw-x5-interior.png'),
  '/bmw-x5-trunk.jpg': require('../assets/bmw-x5-trunk.jpg'),
  // mercedes image not present in repo; fall back to a similar existing asset
  '/mercedes-s-class-luxury.jpg': require('../assets/luxury-sedan.png'),
  '/sleek-red-sports-car.png': require('../assets/sleek-red-sports-car.png'),
  '/porsche-911-interior.jpg': require('../assets/porsche-911-interior.jpg'),
  '/porsche-engine.jpg': require('../assets/porsche-engine.jpg'),
  // fallbacks for mercedes interior images that are not in assets
  '/mercedes-s-class-interior.jpg': require('../assets/luxury-sedan.png'),
  '/mercedes-luxury-seats.jpg': require('../assets/luxury-sedan.png'),
  '/luxury-sedan.png': require('../assets/luxury-sedan.png'),
  '/audi-a8-interior.jpg': require('../assets/audi-a8-interior.jpg'),
  '/audi-technology.jpg': require('../assets/audi-technology.jpg'),
  '/luxury-suv.png': require('../assets/luxury-suv.png'),
  '/range-rover-interior.jpg': require('../assets/range-rover-interior.jpg'),
  '/range-rover-offroad.jpg': require('../assets/range-rover-offroad.jpg'),
}

export function getAsset(path?: string) {
  if (!path) return undefined
  return assetMap[path] || undefined
}

export default getAsset
