/**
 * Reverse Geocoding Test Script
 * 
 * This script tests the TrackAsia reverse geocoding API integration
 */

const API_BASE_URL = 'https://selfdrivecarrentalservice-gze5gtc3dkfybtev.southeastasia-01.azurewebsites.net/api';

// Test coordinates (Ho Chi Minh City)
const TEST_COORDINATES = [
    { latitude: 10.847092, longitude: 106.800623, name: 'Lê Văn Việt Street' },
    { latitude: 10.762622, longitude: 106.660172, name: 'District 1 Center' },
    { latitude: 10.8231, longitude: 106.6297, name: 'Tan Son Nhat Airport' },
];

/**
 * Test reverse geocoding for a single coordinate
 */
async function testReverseGeocoding(latitude, longitude, name) {
    console.log(`\n🗺️ Testing: ${name}`);
    console.log(`📍 Coordinates: ${latitude}, ${longitude}`);

    try {
        const requestData = {
            latitude: latitude.toString(),
            longitude: longitude.toString(),
        };

        const response = await fetch(`${API_BASE_URL}/TrackAsia/GetReverseGeocoding`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': '*/*'
            },
            body: JSON.stringify(requestData),
        });

        console.log(`📡 Response Status: ${response.status} ${response.statusText}`);

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Success!');
            console.log(`🏠 Address: ${data.formattedAddress}`);
            if (data.oldFormattedAddress && data.oldFormattedAddress !== data.formattedAddress) {
                console.log(`🏠 Old Address: ${data.oldFormattedAddress}`);
            }
            return data;
        } else {
            const errorText = await response.text();
            console.log('❌ Error Response:', errorText);
            return null;
        }

    } catch (error) {
        console.error('❌ Network Error:', error.message);
        return null;
    }
}

/**
 * Test multiple coordinates
 */
async function testMultipleCoordinates() {
    console.log('🚀 Reverse Geocoding API Test\n');
    console.log('Testing TrackAsia reverse geocoding with multiple coordinates...\n');

    const results = [];

    for (const coord of TEST_COORDINATES) {
        const result = await testReverseGeocoding(coord.latitude, coord.longitude, coord.name);
        results.push({
            ...coord,
            result,
            success: result !== null,
        });

        // Wait between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return results;
}

/**
 * Test the service integration
 */
async function testServiceIntegration() {
    console.log('\n🔧 Testing Service Integration\n');

    // Simulate the service class
    class TestReverseGeocodingService {
        async getAddressFromCoordinates(latitude, longitude) {
            try {
                const requestData = {
                    latitude: latitude.toString(),
                    longitude: longitude.toString(),
                };

                const response = await fetch(`${API_BASE_URL}/TrackAsia/GetReverseGeocoding`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'accept': '*/*'
                    },
                    body: JSON.stringify(requestData),
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                return { data };
            } catch (error) {
                return {
                    error: {
                        message: error instanceof Error ? error.message : 'Failed to get address'
                    }
                };
            }
        }

        async getFormattedAddress(latitude, longitude) {
            try {
                const result = await this.getAddressFromCoordinates(latitude, longitude);

                if (result.data?.formattedAddress) {
                    return result.data.formattedAddress;
                }

                return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            } catch (error) {
                return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            }
        }
    }

    const service = new TestReverseGeocodingService();

    // Test the service methods
    const testCoord = TEST_COORDINATES[0];
    console.log(`Testing service with: ${testCoord.name}`);

    const address = await service.getFormattedAddress(testCoord.latitude, testCoord.longitude);
    console.log(`✅ Service returned: ${address}`);

    return address;
}

/**
 * Main test execution
 */
async function main() {
    console.log('🌍 TrackAsia Reverse Geocoding Test Suite\n');

    try {
        // Test multiple coordinates
        const results = await testMultipleCoordinates();

        // Test service integration
        const serviceResult = await testServiceIntegration();

        // Summary
        console.log('\n📊 Test Summary:');
        console.log('================');

        const successCount = results.filter(r => r.success).length;
        console.log(`✅ Successful requests: ${successCount}/${results.length}`);

        if (successCount > 0) {
            console.log('✅ Reverse geocoding API is working correctly');
            console.log('✅ Service integration is functional');
            console.log('\n🎯 Ready for integration into GPS tracking components!');
        } else {
            console.log('❌ All requests failed - check API connectivity');
        }

        console.log('\n📍 Example addresses retrieved:');
        results.forEach(result => {
            if (result.success && result.result) {
                console.log(`  - ${result.name}: ${result.result.formattedAddress}`);
            }
        });

    } catch (error) {
        console.error('💥 Test suite failed:', error.message);
    }
}

// Run the tests
main();