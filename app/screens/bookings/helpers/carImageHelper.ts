import getAsset from '../../../../lib/getAsset';
import type { Car } from '../../../../lib/api';

/**
 * Get car image source from various possible sources
 */
export const getCarImageSource = (car: Car | null) => {
    if (!car) return null;

    if (car.imageUrls && car.imageUrls.length > 0) {
        return { uri: car.imageUrls[0] };
    }

    if (car.images && car.images.length > 0) {
        return { uri: car.images[0] };
    }

    if (car.image) {
        if (car.image.startsWith('http://') || car.image.startsWith('https://')) {
            return { uri: car.image };
        }
        const localAsset = getAsset(car.image);
        if (localAsset) return localAsset;
    }

    return null;
};
