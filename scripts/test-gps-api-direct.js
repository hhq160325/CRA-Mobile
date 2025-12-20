// Direct API test for GPS data
const testUserId = '019a9f03-d063-79a6-937c-0611d4f49f12';
const baseUrl = 'https://selfdrivecarrentalservice-gze5gtc3dkfybtev.southeastasia-01.azurewebsites.net';

console.log('🧪 Direct GPS API Test');
console.log('📍 Testing userId:', testUserId);
console.log('📍 API URL:', `${baseUrl}/ByUser/${testUserId}`);
console.log('');

const testGPSAPI = async () => {
    try {
        console.log('🔍 Making API call...');

        const response = await fetch(`${baseUrl}/ByUser/${testUserId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'accept': '*/*'
            },
        });

        console.log('📍 Response status:', response.status, response.statusText);

        if (response.status === 404) {
            console.log('❌ 404 - No GPS data found for this user');
            console.log('💡 This means the userId in the app doesn\'t match the GPS data');
            return;
        }

        if (!response.ok) {
            const errorText = await response.text();
            console.log('❌ Error response:', errorText);
            return;
        }

        const data = await response.json();
        console.log('✅ GPS data found!');
        console.log('📍 Number of records:', data.length);

        if (data.length > 0) {
            const latest = data.sort((a, b) =>
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            )[0];

            console.log('📍 Latest record:');
            console.log('  - Timestamp:', latest.timestamp);
            console.log('  - Latitude:', latest.latitude);
            console.log('  - Longitude:', latest.longitude);
            console.log('  - Speed:', latest.speed);
            console.log('  - Device ID:', latest.deviceId);
            console.log('  - User ID:', latest.userId);
        }

    } catch (error) {
        console.error('❌ Network error:', error.message);
    }
};

// Run the test
testGPSAPI();