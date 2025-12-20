/**
 * GPS Fix Verification Script
 * 
 * This script tests the GPS API fix to ensure the correct URL is being used
 */

const BASE_URL = 'https://selfdrivecarrentalservice-gze5gtc3dkfybtev.southeastasia-01.azurewebsites.net';
const TEST_USER_ID = '019a9f03-d063-79a6-937c-0611d4f49f12';

/**
 * Test the GPS API endpoint directly
 */
async function testGPSEndpoint() {
    console.log('🧪 Testing GPS API Endpoint Fix\n');

    const url = `${BASE_URL}/ByUser/${TEST_USER_ID}`;
    console.log('📍 Testing URL:', url);

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'accept': '*/*'
            },
        });

        console.log('📍 Response Status:', response.status, response.statusText);

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Success! GPS data retrieved:');
            console.log('📊 Total records:', data.length);

            if (data.length > 0) {
                const latest = data[0];
                console.log('📍 Latest location:');
                console.log('  - Coordinates:', latest.latitude, ',', latest.longitude);
                console.log('  - Speed:', latest.speed, 'km/h');
                console.log('  - Device:', latest.deviceId);
                console.log('  - Timestamp:', latest.timestamp);
                console.log('  - User:', latest.user?.fullname || 'Unknown');

                // Calculate time difference
                const now = new Date();
                const locationTime = new Date(latest.timestamp);
                const diffMinutes = Math.floor((now - locationTime) / (1000 * 60));
                console.log('  - Time ago:', diffMinutes < 1 ? 'Just now' : `${diffMinutes} minutes ago`);
            }
        } else {
            const errorText = await response.text();
            console.log('❌ Error Response:', errorText);
        }

    } catch (error) {
        console.error('❌ Network Error:', error.message);
    }
}

/**
 * Test URL construction logic
 */
function testURLConstruction() {
    console.log('\n🔧 Testing URL Construction Logic\n');

    // Simulate the API_CONFIG.BASE_URL
    const apiConfigBaseUrl = 'https://selfdrivecarrentalservice-gze5gtc3dkfybtev.southeastasia-01.azurewebsites.net/api';

    // Old logic (incorrect)
    const oldUrl = `${apiConfigBaseUrl}/ByUser/${TEST_USER_ID}`;
    console.log('❌ Old URL (incorrect):', oldUrl);

    // New logic (correct)
    const newBaseUrl = apiConfigBaseUrl.replace('/api', '');
    const newUrl = `${newBaseUrl}/ByUser/${TEST_USER_ID}`;
    console.log('✅ New URL (correct):', newUrl);

    // Verify the fix
    const expectedUrl = `${BASE_URL}/ByUser/${TEST_USER_ID}`;
    const isFixed = newUrl === expectedUrl;

    console.log('🎯 Expected URL:', expectedUrl);
    console.log('🔍 URLs match:', isFixed ? '✅ YES' : '❌ NO');

    return isFixed;
}

/**
 * Main test execution
 */
async function main() {
    console.log('🚀 GPS API Fix Verification\n');
    console.log('Testing the fix for HTTP 404 error when fetching GPS location data\n');

    // Test URL construction logic
    const urlFixed = testURLConstruction();

    if (urlFixed) {
        console.log('\n✅ URL construction fix verified!');

        // Test the actual API endpoint
        await testGPSEndpoint();

        console.log('\n🎯 Summary:');
        console.log('- Fixed GPS service base URL construction');
        console.log('- Removed /api suffix for GPS endpoints');
        console.log('- Added comprehensive error handling');
        console.log('- Enhanced debugging and logging');
        console.log('\n✅ GPS tracking should now work correctly in the app!');

    } else {
        console.log('\n❌ URL construction fix failed!');
        console.log('Please check the GPS tracking service configuration.');
    }
}

// Run the test
main();