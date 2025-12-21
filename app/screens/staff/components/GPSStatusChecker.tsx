import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Alert } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../theme/colors';
import { scale, verticalScale } from '../../../theme/scale';
import { gpsTrackingService } from '../../../../lib/api/services/gpsTracking.service';
import { locationService } from '../../../../lib/services/locationService';

interface GPSStatusCheckerProps {
    userId: string;
}

export default function GPSStatusChecker({ userId }: GPSStatusCheckerProps) {
    const [checking, setChecking] = useState(false);
    const [sendingTest, setSendingTest] = useState(false);

    const checkGPSStatus = async () => {
        setChecking(true);
        try {
            // console.log('🔍 Checking GPS status for user:', userId);

            // Check if user has any location data
            const result = await gpsTrackingService.getUserLocationHistory(userId);

            if (result.error) {
                Alert.alert(
                    'GPS Status Check',
                    `❌ No GPS data found\n\nReason: ${result.error.message}\n\nSuggestions:\n• User needs to log in and allow GPS permissions\n• GPS tracking may not have started yet\n• Check if user is using the app actively`,
                    [{ text: 'OK' }]
                );
            } else if (result.data && result.data.length > 0) {
                const latest = result.data[0];
                const timeAgo = new Date().getTime() - new Date(latest.timestamp).getTime();
                const minutesAgo = Math.floor(timeAgo / (1000 * 60));

                Alert.alert(
                    'GPS Status Check',
                    `✅ GPS data found!\n\n📊 Total records: ${result.data.length}\n📍 Latest location: ${latest.latitude.toFixed(4)}, ${latest.longitude.toFixed(4)}\n🚗 Speed: ${latest.speed} km/h\n📱 Device: ${latest.deviceId}\n⏰ Last update: ${minutesAgo < 1 ? 'Just now' : `${minutesAgo} minutes ago`}`,
                    [{ text: 'OK' }]
                );
            }
        } catch (error) {
            Alert.alert(
                'GPS Status Check',
                `❌ Error checking GPS status\n\n${error instanceof Error ? error.message : 'Unknown error'}`,
                [{ text: 'OK' }]
            );
        }
        setChecking(false);
    };

    const sendTestLocation = async () => {
        setSendingTest(true);
        try {
            // console.log(' Sending test GPS location for user:', userId);

            // Get device ID
            const deviceId = await locationService.getDeviceId();

            // Send test location (Ho Chi Minh City coordinates)
            const testLocationData = {
                latitude: 10.847092,
                longitude: 106.800623,
                speed: 10,
                userId,
                deviceId,
            };

            const result = await gpsTrackingService.sendLocationData(testLocationData);

            if (result.error) {
                Alert.alert(
                    'Test Location',
                    `❌ Failed to send test location\n\n${result.error.message}`,
                    [{ text: 'OK' }]
                );
            } else {
                Alert.alert(
                    'Test Location',
                    `✅ Test location sent successfully!\n\n📍 Coordinates: ${testLocationData.latitude}, ${testLocationData.longitude}\n🚗 Speed: ${testLocationData.speed} km/h\n📱 Device: ${deviceId}\n⏰ Timestamp: ${result.data?.timestamp}`,
                    [
                        { text: 'Check Status', onPress: checkGPSStatus },
                        { text: 'OK' }
                    ]
                );
            }
        } catch (error) {
            Alert.alert(
                'Test Location',
                `❌ Error sending test location\n\n${error instanceof Error ? error.message : 'Unknown error'}`,
                [{ text: 'OK' }]
            );
        }
        setSendingTest(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>GPS Debug Tools</Text>
            <Text style={styles.subtitle}>User ID: {userId.slice(-12)}</Text>

            <View style={styles.buttonContainer}>
                <Pressable
                    style={[styles.button, styles.checkButton]}
                    onPress={checkGPSStatus}
                    disabled={checking}
                >
                    {checking ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <MaterialIcons name="search" size={16} color="white" />
                    )}
                    <Text style={styles.buttonText}>
                        {checking ? 'Checking...' : 'Check GPS Status'}
                    </Text>
                </Pressable>

                <Pressable
                    style={[styles.button, styles.testButton]}
                    onPress={sendTestLocation}
                    disabled={sendingTest}
                >
                    {sendingTest ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <MaterialIcons name="send" size={16} color="white" />
                    )}
                    <Text style={styles.buttonText}>
                        {sendingTest ? 'Sending...' : 'Send Test Location'}
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = {
    container: {
        backgroundColor: '#f8fafc',
        borderRadius: scale(8),
        padding: scale(12),
        marginVertical: verticalScale(8),
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    title: {
        fontSize: scale(14),
        fontWeight: 'bold' as const,
        color: colors.primary,
        marginBottom: verticalScale(4),
    },
    subtitle: {
        fontSize: scale(12),
        color: '#6b7280',
        marginBottom: verticalScale(8),
    },
    buttonContainer: {
        flexDirection: 'row' as const,
        gap: scale(8),
    },
    button: {
        flex: 1,
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        paddingVertical: verticalScale(8),
        paddingHorizontal: scale(12),
        borderRadius: scale(6),
        gap: scale(4),
    },
    checkButton: {
        backgroundColor: colors.primary,
    },
    testButton: {
        backgroundColor: '#10b981',
    },
    buttonText: {
        fontSize: scale(12),
        fontWeight: '600' as const,
        color: 'white',
    },
};