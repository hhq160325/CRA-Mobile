/**
 * GPS Tracking Flow Test Script
 * 
 * This script tests the complete GPS tracking flow:
 * 1. User login → Auto-start GPS tracking
 * 2. Location sent every minute in background
 * 3. Staff can monitor user locations
 */

const API_BASE_URL = 'https://selfdrivecarrentalservice-gze5gtc3dkfybtev.southeastasia-01.azurewebsites.net/api';

// Test user data
const TEST_USER_ID = '019a9f03-d063-79a6-937c-0611d4f49f12';
const TEST_DEVICE_ID = 'DEVICE_TEST01';

// Test location data (Ho Chi Minh City coordinates) with default speed of 10 km/h
const TEST_LOCATIONS = [
    { latitude: 10.847092, longitude: 106.800623, speed: 10 },
    { latitude: 10.847192, longitude: 106.800723, speed: 10 },
    { latitude: 10.847292, longitude: 106.800823, speed: 10 },
    { latitude: 10.847392, longitude: 106.800923, speed: 10 },
];

/**
 * Send location data to server
 */
async function sendLocationData(locationData) {
    try {
        console.log('📍 Sending location data:', locationData);

        const response = await fetch(`${API_BASE_URL}/FromDevice`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': '*/*'
            },
            body: JSON.stringify(locationData),
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('✅ Location sent successfully:', result);
        return result;
    } catch (error) {
        console.error('❌ Error sending location:', error.message);
        return null;
    }
}

/**
 * Get user location history
 */
async function getUserLocationHistory(userId) {
    try {
        console.log('📍 Fetching location history for user:', userId);

        const response = await fetch(`${API_BASE_URL}/ByUser/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'accept': '*/*'
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('✅ Location history fetched:', result.length, 'records');
        return result;
    } catch (error) {
        console.error('❌ Error fetching location history:', error.message);
        return null;
    }
}

/**
 * Simulate user login and GPS tracking
 */
async function simulateUserGPSTracking() {
    console.log('🎯 Starting GPS tracking simulation...\n');

    // Step 1: Simulate user login and device ID generation
    console.log('1️⃣ User Login Simulation');
    console.log('   - User ID:', TEST_USER_ID);
    console.log('   - Device ID:', TEST_DEVICE_ID);
    console.log('   - GPS tracking auto-started\n');

    // Step 2: Send location data every minute (simulated)
    console.log('2️⃣ Location Tracking Simulation (every minute)');

    for (let i = 0; i < TEST_LOCATIONS.length; i++) {
        const location = TEST_LOCATIONS[i];
        const locationData = {
            ...location,
            userId: TEST_USER_ID,
            deviceId: TEST_DEVICE_ID,
        };

        console.log(`   Minute ${i + 1}:`);
        const result = await sendLocationData(locationData);

        if (result) {
            console.log(`   ✅ Location ${i + 1} sent successfully`);
            console.log(`   📍 Coordinates: ${location.latitude}, ${location.longitude}`);
            console.log(`   🚗 Speed: ${location.speed} km/h`);
            console.log(`   ⏰ Timestamp: ${result.timestamp}\n`);
        } else {
            console.log(`   ❌ Failed to send location ${i + 1}\n`);
        }

        // Wait 2 seconds between requests (simulating 1-minute intervals)
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Step 3: Simulate staff monitoring
    console.log('3️⃣ Staff Monitoring Simulation');
    const locationHistory = await getUserLocationHistory(TEST_USER_ID);

    if (locationHistory && locationHistory.length > 0) {
        console.log('   ✅ Staff can view user locations');
        console.log('   📊 Total locations:', locationHistory.length);

        // Show latest location
        const latest = locationHistory[0];
        console.log('   📍 Latest location:');
        console.log('     - Coordinates:', latest.latitude, ',', latest.longitude);
        console.log('     - Speed:', latest.speed, 'km/h');
        console.log('     - Device:', latest.deviceId);
        console.log('     - Timestamp:', latest.timestamp);
        console.log('     - User:', latest.user?.fullname || 'Unknown');

        // Calculate time difference
        const now = new Date();
        const locationTime = new Date(latest.timestamp);
        const diffMinutes = Math.floor((now - locationTime) / (1000 * 60));
        console.log('     - Time ago:', diffMinutes < 1 ? 'Just now' : `${diffMinutes} minutes ago`);

    } else {
        console.log('   ❌ No location data found for staff monitoring');
    }

    console.log('\n🎯 GPS tracking flow test completed!');
}

/**
 * Test GPS API endpoints
 */
async function testGPSEndpoints() {
    console.log('🧪 Testing GPS API Endpoints...\n');

    // Test 1: Send location data
    console.log('Test 1: Send Location Data');
    const testLocation = {
        latitude: 10.847092,
        longitude: 106.800623,
        speed: 10,
        userId: TEST_USER_ID,
        deviceId: TEST_DEVICE_ID,
    };

    const sendResult = await sendLocationData(testLocation);
    console.log('Result:', sendResult ? '✅ Success' : '❌ Failed\n');

    // Test 2: Get user location history
    console.log('Test 2: Get User Location History');
    const historyResult = await getUserLocationHistory(TEST_USER_ID);
    console.log('Result:', historyResult ? `✅ Success (${historyResult.length} records)` : '❌ Failed\n');

    console.log('🧪 API endpoint tests completed!');
}

/**
 * Main execution
 */
async function main() {
    console.log('🚀 GPS Tracking Flow Verification\n');
    console.log('This script tests the complete GPS tracking flow:');
    console.log('1. User login → Auto-start GPS tracking');
    console.log('2. Location sent every minute in background');
    console.log('3. Staff can monitor user locations\n');

    try {
        // Run API endpoint tests first
        await testGPSEndpoints();
        console.log('\n' + '='.repeat(50) + '\n');

        // Run full flow simulation
        await simulateUserGPSTracking();

    } catch (error) {
        console.error('💥 Test failed:', error.message);
    }
}

// Run the tests
main();