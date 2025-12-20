/**
 * GPS utility functions for location and speed handling
 */

/**
 * Normalize speed value - defaults to 10 km/h when GPS doesn't provide speed
 * This is common when GPS accuracy is low or device doesn't support speed detection
 */
export function normalizeSpeed(speed: number | null | undefined): number {
    if (speed === null || speed === undefined || speed < 0) {
        return 10; // Default speed in km/h
    }

    // Round to nearest integer for cleaner display
    return Math.round(speed);
}

/**
 * Format speed for display with unit
 */
export function formatSpeed(speed: number | null | undefined, showDefault: boolean = false): string {
    const normalizedSpeed = normalizeSpeed(speed);
    const isDefault = (speed === null || speed === undefined || speed < 0);

    if (showDefault && isDefault) {
        return `${normalizedSpeed} km/h (default)`;
    }

    return `${normalizedSpeed} km/h`;
}

/**
 * Validate GPS coordinates
 */
export function isValidCoordinate(latitude: number, longitude: number): boolean {
    return (
        latitude >= -90 && latitude <= 90 &&
        longitude >= -180 && longitude <= 180
    );
}

/**
 * Calculate distance between two GPS coordinates (in kilometers)
 * Uses Haversine formula
 */
export function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(latitude: number, longitude: number, precision: number = 6): string {
    return `${latitude.toFixed(precision)}, ${longitude.toFixed(precision)}`;
}