import * as FileSystem from 'expo-file-system';

/**
 * Convert image URI to base64 string
 * Supports local file URIs and remote URLs
 */
export async function convertImageToBase64(uri: string): Promise<string> {
    try {
        console.log('Converting image to base64:', uri);

        // For local files (from camera or gallery)
        if (uri.startsWith('file://') || uri.startsWith('content://')) {
            const base64 = await FileSystem.readAsStringAsync(uri, {
                encoding: 'base64',
            });

            // Return with data URI prefix
            return `data:image/jpeg;base64,${base64}`;
        }

        // For remote URLs, fetch and convert
        if (uri.startsWith('http://') || uri.startsWith('https://')) {
            const response = await fetch(uri);
            const blob = await response.blob();

            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    resolve(reader.result as string);
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        }

        // If already base64
        if (uri.startsWith('data:')) {
            return uri;
        }

        throw new Error('Unsupported image URI format');
    } catch (error) {
        console.error('Error converting image to base64:', error);
        throw error;
    }
}

/**
 * Get just the base64 string without the data URI prefix
 */
export function getBase64String(dataUri: string): string {
    if (dataUri.includes(',')) {
        return dataUri.split(',')[1];
    }
    return dataUri;
}

/**
 * Validate image size (in bytes)
 * Default max: 5MB
 */
export function validateImageSize(base64: string, maxSizeInMB: number = 5): boolean {
    const base64String = getBase64String(base64);
    const sizeInBytes = (base64String.length * 3) / 4;
    const sizeInMB = sizeInBytes / (1024 * 1024);

    console.log(`Image size: ${sizeInMB.toFixed(2)}MB`);

    return sizeInMB <= maxSizeInMB;
}
