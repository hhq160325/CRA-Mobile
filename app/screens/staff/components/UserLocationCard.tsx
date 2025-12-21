import React from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../theme/colors';
import { useUserLocation } from '../../../../lib/hooks/useUserLocation';
import { useReverseGeocoding } from '../../../../lib/hooks/useReverseGeocoding';
import { formatSpeed, formatCoordinates } from '../../../../lib/utils/gpsUtils';
import GPSStatusChecker from './GPSStatusChecker';
import type { NavigatorParamList } from '../../../navigators/navigation-route';
import { userLocationCardStyles as styles } from '../styles/userLocationCard.styles';

interface UserLocationCardProps {
    userId: string;
    compact?: boolean;
}

export default function UserLocationCard({ userId, compact = false }: UserLocationCardProps) {
    const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>();
    const { location, loading, error, timeAgo, isRecent, refetch } = useUserLocation(userId);
    const { address, loading: addressLoading } = useReverseGeocoding(
        location?.latitude || 0,
        location?.longitude || 0
    );

    const handleViewFullLocation = () => {
        navigation.navigate('UserLocationHistory' as any, { userId });
    };

    const handleViewOnMap = () => {
        // Navigate to GPS monitoring with this user pre-selected
        navigation.navigate('GPSMonitoring' as any, { focusUserId: userId });
    };

    if (loading) {
        return (
            <View style={[styles.container, compact && styles.containerCompact]}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={styles.loadingText}>Loading GPS...</Text>
                </View>
            </View>
        );
    }

    if (error || !location) {
        if (compact) {
            return (
                <Pressable
                    style={[styles.container, styles.containerCompact, styles.containerError]}
                    onPress={refetch}
                >
                    <MaterialIcons name="location-off" size={14} color="#ef4444" />
                    <Text style={styles.errorText}>No GPS data</Text>
                    <MaterialIcons name="refresh" size={14} color="#6b7280" />
                </Pressable>
            );
        }

        return (
            <View style={[styles.container, styles.containerError]}>
                <View style={styles.errorHeader}>
                    <MaterialIcons name="location-off" size={16} color="#ef4444" />
                    <Text style={styles.errorText}>No GPS data available</Text>
                    <Pressable onPress={refetch} style={styles.retryButton}>
                        <MaterialIcons name="refresh" size={14} color="#6b7280" />
                    </Pressable>
                </View>
                <GPSStatusChecker userId={userId} />
            </View>
        );
    }

    if (compact) {
        return (
            <Pressable
                style={[styles.container, styles.containerCompact]}
                onPress={handleViewFullLocation}
            >
                <View style={[
                    styles.statusDot,
                    isRecent ? styles.statusDotOnline : styles.statusDotOffline
                ]} />
                <MaterialIcons
                    name="location-on"
                    size={14}
                    color={isRecent ? '#10b981' : '#6b7280'}
                />
                <Text style={[
                    styles.compactText,
                    isRecent ? styles.compactTextOnline : styles.compactTextOffline
                ]}>
                    {timeAgo}
                </Text>
                <MaterialIcons name="chevron-right" size={14} color="#9ca3af" />
            </Pressable>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.statusContainer}>
                    <View style={[
                        styles.statusDot,
                        isRecent ? styles.statusDotOnline : styles.statusDotOffline
                    ]} />
                    <MaterialIcons
                        name="location-on"
                        size={16}
                        color={isRecent ? '#10b981' : '#6b7280'}
                    />
                    <Text style={[
                        styles.statusText,
                        isRecent ? styles.statusTextOnline : styles.statusTextOffline
                    ]}>
                        {isRecent ? 'Recent' : 'Offline'}
                    </Text>
                </View>
                <Text style={styles.timeText}>{timeAgo}</Text>
            </View>

            <View style={styles.locationInfo}>
                <View style={styles.locationRow}>
                    <MaterialIcons name="place" size={14} color={colors.primary} />
                    <View style={styles.addressContainer}>
                        {addressLoading ? (
                            <View style={styles.addressLoading}>
                                <ActivityIndicator size="small" color={colors.primary} />
                                <Text style={styles.addressLoadingText}>Getting address...</Text>
                            </View>
                        ) : address ? (
                            <Text style={styles.addressText} numberOfLines={4}>
                                {address}
                            </Text>
                        ) : (
                            <Text style={styles.coordinatesText}>
                                {formatCoordinates(location.latitude, location.longitude, 4)}
                            </Text>
                        )}
                    </View>
                </View>

                <View style={styles.locationRow}>
                    <MaterialIcons name="my-location" size={14} color="#6b7280" />
                    <Text style={styles.coordinatesText}>
                        {formatCoordinates(location.latitude, location.longitude, 6)}
                    </Text>
                </View>

                <View style={styles.locationRow}>
                    <MaterialIcons name="speed" size={14} color="#6b7280" />
                    <Text style={styles.speedText}>{formatSpeed(location.speed, true)}</Text>
                </View>

                <View style={styles.locationRow}>
                    <MaterialIcons name="devices" size={14} color="#6b7280" />
                    <Text style={styles.deviceText}>{location.deviceId}</Text>
                </View>
            </View>

            <View style={styles.actions}>
                <Pressable style={styles.actionButton} onPress={handleViewFullLocation}>
                    <MaterialIcons name="location-on" size={16} color={colors.primary} />
                    <Text style={styles.actionText}>Latest</Text>
                </Pressable>

                <Pressable style={styles.actionButton} onPress={handleViewOnMap}>
                    <MaterialIcons name="map" size={16} color={colors.primary} />
                    <Text style={styles.actionText}>Map</Text>
                </Pressable>

                <Pressable style={styles.actionButton} onPress={refetch}>
                    <MaterialIcons name="refresh" size={16} color={colors.primary} />
                    <Text style={styles.actionText}>Refresh</Text>
                </Pressable>
            </View>
        </View>
    );
}