// Test script for old formatted address functionality
const testCoordinates = {
    latitude: 10.836574664854608,
    longitude: 106.68601371572379
};

console.log('🧪 Testing Old Formatted Address API');
console.log('📍 Coordinates:', testCoordinates);

const testReverseGeocoding = async () => {
    try {
        const response = await fetch('https://selfdrivecarrentalservice-gze5gtc3dkfybtev.southeastasia-01.azurewebsites.net/api/TrackAsia/GetReverseGeocoding', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': '*/*'
            },
            body: JSON.stringify({
                latitude: testCoordinates.latitude.toString(),
                longitude: testCoordinates.longitude.toString()
            })
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ API Response:');
            console.log('📍 formattedAddress:', data.formattedAddress);
            console.log('📍 oldFormattedAddress:', data.oldFormattedAddress);

            console.log('\n🎯 GPS Card will show:');
            console.log('Address:', data.oldFormattedAddress);
            console.log('Speed: 10 km/h');
            console.log('Time ago: 1 minute ago (example)');
            console.log('Device ID: DEVICE_610A35');
        } else {
            console.error('❌ API Error:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('❌ Network Error:', error.message);
    }
};

// Run the test
testReverseGeocoding();