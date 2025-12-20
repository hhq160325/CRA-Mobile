import React, { useState } from 'react';
import {
    View,
    Text,
    Pressable,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../theme/colors';
import { scale, verticalScale } from '../theme/scale';
import Header from '../components/Header/Header';
import GPSTrackingIndicator from '../components/GPSTrackingIndicator/GPSTrackingIndicator';
import { useGPSTrackingContext } from '../../lib/providers/GPSTrackingProvider';
import { useAuth } from '../../lib/auth-context';
import { locationService } from '../../lib/services/locationService';
import type { NavigatorParamList } from '../navigators/navigation-route';

export default function GPSDemoScreen() {
    const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>();
    const { user } = useAuth();
    const { isTracking, trackingError, lastLocationSent, startTracking, stopTracking } = useGPSTrackingContext();
    const [testingLocation, setTestingLocation] = useState(false);
    const [lastTestLocation, setLastTestLocation] = useState<any>(null);

    const handleTestCurrentLocation = async () => {
        if (!user?.id) {
            Alert.alert('Error', 'Please log in first');
            return;
        }

        setTestingLocation(true);
        try {
            const location = await locationService.getCurrentLocation();
            if (location) {
                setLastTestLocation(location);
                Alert.alert(
                    'Location Retrieved',
                    `Lat: ${location.latitude.toFixed(6)}\nLng: ${location.longitude.toFixed(6)}\nSpeed: ${location.speed} km/h`
                );
            } else {
                Alert.alert('Error', 'Failed to get current location');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to get location: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
        setTestingLocation(false);
    };

    const handleToggleTracking = async () => {
        if (isTracking) {
            stopTracking();
        } else {
            const success = await startTracking();
            if (!success) {
                Alert.alert('Error', 'Failed to start GPS tracking');
            }
        }
    };

    const handleNavigateToStaffGPS = () => {
        navigation.navigate('GPSMonitoring' as any);
    };

    return (
        <View style={styles.container}>
            <Header />

            <View style={styles.header}>
                <Pressable
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
                    <Text style={styles.backText}>Back</Text>
                </Pressable>
                <Text style={styles.title}>GPS Tracking Demo</Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* GPS Status Indicator */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>GPS Status</Text>
                    <GPSTrackingIndicator />

                    {trackingError && (
                        <View style={styles.errorContainer}>
                            <MaterialIcons name="error" size={20} color="#ef4444" />
                            <Text style={styles.errorText}>{trackingError}</Text>
                        </View>
                    )}
                </View>

                {/* User Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>User Information</Text>
                    <View style={styles.infoCard}>
                        <Text style={styles.infoLabel}>User ID:</Text>
                        <Text style={styles.infoValue}>{user?.id || 'Not logged in'}</Text>
                        <Text style={styles.infoLabel}>Name:</Text>
                        <Text style={styles.infoValue}>{user?.username || 'N/A'}</Text>
                    </View>
                </View>

                {/* Tracking Controls */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Tracking Controls</Text>

                    <Pressable
                        style={[
                            styles.button,
                            isTracking ? styles.buttonStop : styles.buttonStart
                        ]}
                        onPress={handleToggleTracking}
                        disabled={!user?.id}
                    >
                        <MaterialIcons
                            name={isTracking ? "stop" : "play-arrow"}
                            size={20}
                            color="white"
                        />
                        <Text style={styles.buttonText}>
                            {isTracking ? 'Stop Tracking' : 'Start Tracking'}
                        </Text>
                    </Pressable>

                    <Pressable
                        style={[styles.button, styles.buttonTest]}
                        onPress={handleTestCurrentLocation}
                        disabled={testingLocation || !user?.id}
                    >
                        {testingLocation ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <MaterialIcons name="my-location" size={20} color="white" />
                        )}
                        <Text style={styles.buttonText}>Test Current Location</Text>
                    </Pressable>

                    <Pressable
                        style={[styles.button, styles.buttonStaff]}
                        onPress={() => navigation.navigate('GPSMonitoring' as any, { focusUserId: user?.id })}
                        disabled={!user?.id}
                    >
                        <MaterialIcons name="admin-panel-settings" size={20} color="white" />
                        <Text style={styles.buttonText}>Check My GPS in Staff View</Text>
                    </Pressable>
                </View>

                {/* Last Location Test */}
                {lastTestLocation && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Last Test Location</Text>
                        <View style={styles.locationCard}>
                            <View style={styles.locationRow}>
                                <MaterialIcons name="location-on" size={16} color={colors.primary} />
                                <Text style={styles.locationText}>
                                    {lastTestLocation.latitude.toFixed(6)}, {lastTestLocation.longitude.toFixed(6)}
                                </Text>
                            </View>
                            <View style={styles.locationRow}>
                                <MaterialIcons name="speed" size={16} color="#6b7280" />
                                <Text style={styles.speedText}>
                                    {lastTestLocation.speed} km/h {lastTestLocation.speed === 10 ? '(default)' : ''}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Tracking Info */}
                {isTracking && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Tracking Information</Text>
                        <View style={styles.infoCard}>
                            <Text style={styles.infoLabel}>Status:</Text>
                            <Text style={[styles.infoValue, { color: '#10b981' }]}>Active</Text>
                            <Text style={styles.infoLabel}>Last Update:</Text>
                            <Text style={styles.infoValue}>
                                {lastLocationSent ? lastLocationSent.toLocaleString() : 'Starting...'}
                            </Text>
                            <Text style={styles.infoLabel}>Interval:</Text>
                            <Text style={styles.infoValue}>60 seconds (1 minute)</Text>
                        </View>
                    </View>
                )}

                {/* Staff GPS Monitoring */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Staff Features</Text>
                    <Pressable
                        style={[styles.button, styles.buttonStaff]}
                        onPress={handleNavigateToStaffGPS}
                    >
                        <MaterialIcons name="admin-panel-settings" size={20} color="white" />
                        <Text style={styles.buttonText}>Staff GPS Monitoring</Text>
                    </Pressable>
                </View>

                {/* Instructions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>How It Works</Text>
                    <View style={styles.instructionsCard}>
                        <Text style={styles.instructionStep}>1. User logs in → Auto-generates device ID</Text>
                        <Text style={styles.instructionStep}>2. App requests GPS permissions</Text>
                        <Text style={styles.instructionStep}>3. Location sent to server every 60 seconds (1 minute)</Text>
                        <Text style={styles.instructionStep}>4. Speed defaults to 10 km/h when GPS doesn't provide speed</Text>
                        <Text style={styles.instructionStep}>5. Staff can monitor user locations</Text>
                        <Text style={styles.instructionStep}>6. Latest timestamp displayed for each user</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = {
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    header: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(12),
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    backButton: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        marginRight: scale(16),
    },
    backText: {
        fontSize: scale(16),
        color: colors.primary,
        marginLeft: scale(4),
    },
    title: {
        fontSize: scale(20),
        fontWeight: 'bold' as const,
        color: colors.primary,
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: scale(16),
    },
    section: {
        marginVertical: verticalScale(12),
    },
    sectionTitle: {
        fontSize: scale(18),
        fontWeight: 'bold' as const,
        color: colors.primary,
        marginBottom: verticalScale(8),
    },
    infoCard: {
        backgroundColor: 'white',
        padding: scale(16),
        borderRadius: scale(12),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    infoLabel: {
        fontSize: scale(14),
        color: '#6b7280',
        marginBottom: verticalScale(2),
    },
    infoValue: {
        fontSize: scale(16),
        fontWeight: '600' as const,
        color: colors.primary,
        marginBottom: verticalScale(8),
    },
    button: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        paddingVertical: verticalScale(12),
        paddingHorizontal: scale(16),
        borderRadius: scale(8),
        marginBottom: verticalScale(8),
        gap: scale(8),
    },
    buttonStart: {
        backgroundColor: '#10b981',
    },
    buttonStop: {
        backgroundColor: '#ef4444',
    },
    buttonTest: {
        backgroundColor: colors.primary,
    },
    buttonStaff: {
        backgroundColor: '#8b5cf6',
    },
    buttonText: {
        fontSize: scale(14),
        fontWeight: '600' as const,
        color: 'white',
    },
    errorContainer: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        backgroundColor: '#fee2e2',
        padding: scale(12),
        borderRadius: scale(8),
        marginTop: verticalScale(8),
        gap: scale(8),
    },
    errorText: {
        fontSize: scale(14),
        color: '#991b1b',
        flex: 1,
    },
    locationCard: {
        backgroundColor: 'white',
        padding: scale(16),
        borderRadius: scale(12),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    locationRow: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        marginBottom: verticalScale(6),
    },
    locationText: {
        fontSize: scale(14),
        color: colors.primary,
        marginLeft: scale(6),
        fontWeight: '500' as const,
    },
    speedText: {
        fontSize: scale(14),
        color: '#6b7280',
        marginLeft: scale(6),
    },
    instructionsCard: {
        backgroundColor: 'white',
        padding: scale(16),
        borderRadius: scale(12),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    instructionStep: {
        fontSize: scale(14),
        color: '#374151',
        marginBottom: verticalScale(6),
        lineHeight: scale(20),
    },
};