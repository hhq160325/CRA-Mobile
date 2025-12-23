export interface DriverLicenseOCRResult {
    licenseId: string;
    idProbability: number;
    nameOnLicense: string;
    nameProbability: number;
    class: string;
    classProbability: number;
    dateOfBirth: string;
    dateOfBirthProbability: number;
    dateOfIssue: string;
    dateOfIssueProbability: number;
    dateOfExpiry: string;
    dateOfExpiryProbability: number;
}

export interface OCRResponse {
    data?: DriverLicenseOCRResult;
    error?: {
        message: string;
        code?: string;
    };
}

import AsyncStorage from '@react-native-async-storage/async-storage';

const getAuthToken = async (): Promise<string | null> => {
    try {
        return await AsyncStorage.getItem("token");
    } catch (e) {
        console.error("Failed to get token:", e);
        return null;
    }
};

class OCRService {
    private readonly baseUrl = 'https://selfdrivecarrentalservice-gze5gtc3dkfybtev.southeastasia-01.azurewebsites.net/api/FPTAI';


    async extractDriverLicenseInfo(imageUri: string): Promise<OCRResponse> {
        try {
            console.log(' OCR: Starting driver license extraction...');

            // Get authentication token
            const token = await getAuthToken();
            console.log('🔐 OCR: Auth token available:', !!token);

            // Create FormData for multipart/form-data request
            const formData = new FormData();

            // Add image file to form data
            formData.append('Image', {
                uri: imageUri,
                type: 'image/jpeg',
                name: 'license.jpg',
            } as any);

            console.log(' OCR: Sending request to API...');

            const headers: Record<string, string> = {
                'Accept': '*/*',
                'Content-Type': 'multipart/form-data',
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${this.baseUrl}/ExtractDriverLicenseInfo`, {
                method: 'POST',
                headers,
                body: formData,
            });

            console.log(' OCR: Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error(' OCR: API error:', errorText);

                return {
                    error: {
                        message: `OCR API error: ${response.status} - ${errorText}`,
                        code: response.status.toString(),
                    },
                };
            }

            const result = await response.json();
            console.log(' OCR: Extraction successful:', result);

            // Validate response structure
            if (!result || typeof result !== 'object') {
                return {
                    error: {
                        message: 'Invalid response format from OCR API',
                        code: 'INVALID_RESPONSE',
                    },
                };
            }

            return {
                data: result as DriverLicenseOCRResult,
            };

        } catch (error: any) {
            console.error(' OCR: Exception during extraction:', error);

            return {
                error: {
                    message: error?.message || 'Failed to extract driver license information',
                    code: 'EXTRACTION_FAILED',
                },
            };
        }
    }


    validateOCRQuality(result: DriverLicenseOCRResult): {
        isValid: boolean;
        warnings: string[];
        confidence: 'high' | 'medium' | 'low';
    } {
        const warnings: string[] = [];
        const minProbability = 80;


        if (result.idProbability < minProbability) {
            warnings.push(`License ID confidence low (${result.idProbability}%)`);
        }

        if (result.nameProbability < minProbability) {
            warnings.push(`Name confidence low (${result.nameProbability}%)`);
        }

        if (result.dateOfBirthProbability < minProbability) {
            warnings.push(`Date of birth confidence low (${result.dateOfBirthProbability}%)`);
        }

        if (result.dateOfIssueProbability < minProbability) {
            warnings.push(`Issue date confidence low (${result.dateOfIssueProbability}%)`);
        }

        // Calculate overall confidence
        const avgProbability = (
            result.idProbability +
            result.nameProbability +
            result.dateOfBirthProbability +
            result.dateOfIssueProbability +
            result.dateOfExpiryProbability +
            result.classProbability
        ) / 6;

        let confidence: 'high' | 'medium' | 'low';
        if (avgProbability >= 95) {
            confidence = 'high';
        } else if (avgProbability >= 85) {
            confidence = 'medium';
        } else {
            confidence = 'low';
        }

        const isValid = warnings.length === 0 && avgProbability >= minProbability;

        return {
            isValid,
            warnings,
            confidence,
        };
    }


    formatOCRResult(result: DriverLicenseOCRResult): {
        licenseId: string;
        fullName: string;
        licenseClass: string;
        dateOfBirth: string;
        issueDate: string;
        expiryDate: string;
        summary: string;
    } {
        return {
            licenseId: result.licenseId || 'N/A',
            fullName: result.nameOnLicense || 'N/A',
            licenseClass: result.class || 'N/A',
            dateOfBirth: result.dateOfBirth || 'N/A',
            issueDate: result.dateOfIssue || 'N/A',
            expiryDate: result.dateOfExpiry || 'N/A',
            summary: `License: ${result.licenseId} | Name: ${result.nameOnLicense} | Class: ${result.class}`,
        };
    }
}

export const ocrService = new OCRService();
export default ocrService;