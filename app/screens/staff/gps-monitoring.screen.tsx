import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    RefreshControl,
    ActivityIndicator,
    Pressable,
    TextInput,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/colors';
import Header from '../../components/Header/Header';
import { gpsTrackingService, type UserLocationHistory } from '../../../lib/api/services/gpsTracking.service';
import { reverseGeocodingService } from '../../../lib/api/services/reverseGeocoding.service';
import type { NavigatorParamList } from '../../navigators/navigation-route';
import { gpsMonitoringStyles } from './styles/gpsMonitoring.styles';

interface UserLocationData extends UserLocationHistory {
    timeAgo: string;
    isRecent: boolean;
    address?: string;
    addressLoading?: boolean;
}

type GPSMonitoringRouteProp = RouteProp<
    { params: { focusUserId?: string } },
    'params'
>;

export default function GPSMonitoringScreen() {
    const route = useRoute<GPSMonitoringRouteProp>();
    const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>();
    const { focusUserId } = (route.params as any) || {};
    const [userLocations, setUserLocations] = useState<UserLocationData[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const formatTimeAgo = (timestamp: string): { timeAgo: string; isRecent: boolean } => {
        const now = new Date();
        const locationTime = new Date(timestamp);
        const diffMs = now.getTime() - locationTime.getTime();
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);

        let timeAgo: string;
        let isRecent = false;

        if (diffMinutes < 1) {
            timeAgo = 'Just now';
            isRecent = true;
        } else if (diffMinutes < 60) {
            timeAgo = `${diffMinutes}m ago`;
            isRecent = diffMinutes <= 30; // Recent if within 30 minutes
        } else if (diffHours < 24) {
            timeAgo = `${diffHours}h ago`;
            isRecent = diffHours <= 2; // Recent if within 2 hours
        } else {
            timeAgo = `${diffDays}d ago`;
            isRecent = false;
        }

        return { timeAgo, isRecent };
    };

    const fetchUserLocations = async (forceRefresh = false) => {
        if (!forceRefresh) setLoading(true);
        setError(null);

        try {
            // Get all unique user IDs from staff bookings
            const { bookingsService } = await import('../../../lib/api/services/bookings.service');
            const bookingsResult = await bookingsService.getAllBookings();

            let knownUserIds: string[] = [];

            if (bookingsResult.data && bookingsResult.data.length > 0) {
                // Extract unique user IDs from bookings
                knownUserIds = [...new Set(bookingsResult.data.map(booking => booking.userId).filter(Boolean))];
                // console.log('📍 Found user IDs from bookings:', knownUserIds.length);
            } else {
                // Fallback to demo user IDs if no bookings found
                knownUserIds = [
                    '019a9f03-d063-79a6-937c-0611d4f49f12', // Demo user
                ];
                // console.log('📍 Using fallback user IDs');
            }

            const locationPromises = knownUserIds.map(async (userId) => {
                try {
                    const result = await gpsTrackingService.getLatestUserLocation(userId);
                    if (result.data) {
                        return result.data;
                    } else {
                        // console.log('📍 No GPS data for user:', userId);
                        return null;
                    }
                } catch (error) {
                    // console.error('📍 Error fetching GPS for user:', userId, error);
                    return null;
                }
            });

            const results = await Promise.all(locationPromises);
            const validLocations = results.filter((location): location is UserLocationHistory =>
                location !== null
            );

            // Add time formatting and fetch addresses
            const formattedLocations: UserLocationData[] = await Promise.all(
                validLocations.map(async (location) => {
                    const { timeAgo, isRecent } = formatTimeAgo(location.timestamp);

                    // Fetch address for each location
                    let address: string | undefined;
                    try {
                        address = await reverseGeocodingService.getFormattedAddress(
                            location.latitude,
                            location.longitude
                        );
                    } catch (error) {
                        // console.log('📍 Failed to get address for location:', error);
                        address = undefined;
                    }

                    return {
                        ...location,
                        timeAgo,
                        isRecent,
                        address,
                        addressLoading: false,
                    };
                })
            );

            // Sort by timestamp (most recent first)
            formattedLocations.sort((a, b) =>
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );

            setUserLocations(formattedLocations);
            // console.log('📍 Loaded locations for', formattedLocations.length, 'users');
        } catch (error) {
            // console.error('📍 Error fetching user locations:', error);
            setError(error instanceof Error ? error.message : 'Failed to fetch locations');
        }

        setLoading(false);
        setRefreshing(false);
    };

    useEffect(() => {
        fetchUserLocations();

        // If focusUserId is provided, set it as search query to highlight the user
        if (focusUserId) {
            setSearchQuery(focusUserId);
        }
    }, [focusUserId]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchUserLocations(true);
    };

    const handleViewUserDetails = (userId: string) => {
        navigation.navigate('UserLocationHistory' as any, { userId });
    };

    const filteredLocations = userLocations.filter(location => {
        if (!searchQuery.trim()) return true;

        const query = searchQuery.toLowerCase();
        return (
            location.user.fullname.toLowerCase().includes(query) ||
            location.user.email.toLowerCase().includes(query) ||
            location.user.phoneNumber.includes(query) ||
            location.userId.toLowerCase().includes(query)
        );
    });

    const renderLocationItem = ({ item }: { item: UserLocationData }) => (
        <Pressable
            style={gpsMonitoringStyles.locationCard}
            onPress={() => handleViewUserDetails(item.userId)}
        >
            <View style={gpsMonitoringStyles.cardHeader}>
                <View style={gpsMonitoringStyles.userInfo}>
                    <Text style={gpsMonitoringStyles.userName}>{item.user.fullname}</Text>
                    <Text style={gpsMonitoringStyles.userEmail}>{item.user.email}</Text>
                    <Text style={gpsMonitoringStyles.userId}>ID: {item.userId.slice(-12)}</Text>
                </View>
                <View style={[
                    gpsMonitoringStyles.statusBadge,
                    item.isRecent ? gpsMonitoringStyles.statusBadgeOnline : gpsMonitoringStyles.statusBadgeOffline
                ]}>
                    <View style={[
                        gpsMonitoringStyles.statusDot,
                        item.isRecent ? gpsMonitoringStyles.statusDotOnline : gpsMonitoringStyles.statusDotOffline
                    ]} />
                    <Text style={[
                        gpsMonitoringStyles.statusText,
                        item.isRecent ? gpsMonitoringStyles.statusTextOnline : gpsMonitoringStyles.statusTextOffline
                    ]}>
                        {item.isRecent ? 'Recent' : 'Offline'}
                    </Text>
                </View>
            </View>

            <View style={gpsMonitoringStyles.locationInfo}>
                <View style={gpsMonitoringStyles.locationRow}>
                    <MaterialIcons name="place" size={16} color={colors.primary} />
                    <View style={gpsMonitoringStyles.addressContainer}>
                        {item.address ? (
                            <Text style={gpsMonitoringStyles.addressText} numberOfLines={4}>
                                {item.address}
                            </Text>
                        ) : (
                            <Text style={gpsMonitoringStyles.locationText}>
                                {item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}
                            </Text>
                        )}
                    </View>
                </View>

                <View style={gpsMonitoringStyles.locationRow}>
                    <MaterialIcons name="my-location" size={16} color="#6b7280" />
                    <Text style={gpsMonitoringStyles.coordinatesText}>
                        {item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}
                    </Text>
                </View>

                <View style={gpsMonitoringStyles.locationRow}>
                    <MaterialIcons name="speed" size={16} color="#6b7280" />
                    <Text style={gpsMonitoringStyles.speedText}>
                        {item.speed} km/h
                    </Text>
                </View>

                <View style={gpsMonitoringStyles.locationRow}>
                    <MaterialIcons name="access-time" size={16} color="#6b7280" />
                    <Text style={gpsMonitoringStyles.timeText}>
                        {item.timeAgo}
                    </Text>
                </View>

                <View style={gpsMonitoringStyles.locationRow}>
                    <MaterialIcons name="devices" size={16} color="#6b7280" />
                    <Text style={gpsMonitoringStyles.deviceText}>
                        {item.deviceId}
                    </Text>
                </View>
            </View>

            <View style={gpsMonitoringStyles.cardFooter}>
                <View style={gpsMonitoringStyles.timestampContainer}>
                    <MaterialIcons name="schedule" size={16} color="#6b7280" />
                    <Text style={gpsMonitoringStyles.timestampText}>
                        {new Date(item.timestamp).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                        })}
                    </Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color={colors.primary} />
            </View>
        </Pressable>
    );

    if (loading) {
        return (
            <View style={gpsMonitoringStyles.container}>
                <Header />
                <View style={gpsMonitoringStyles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={gpsMonitoringStyles.loadingText}>Loading GPS data...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={gpsMonitoringStyles.container}>
            <Header />

            <View style={gpsMonitoringStyles.header}>
                <Pressable
                    onPress={() => navigation.goBack()}
                    style={gpsMonitoringStyles.backButton}
                >
                    <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
                    <Text style={gpsMonitoringStyles.backText}>Back</Text>
                </Pressable>
                <View style={gpsMonitoringStyles.titleContainer}>
                    <Text style={gpsMonitoringStyles.title}>GPS Monitoring</Text>
                    <Text style={gpsMonitoringStyles.subtitle}>Latest Locations Only</Text>
                </View>
            </View>

            <View style={gpsMonitoringStyles.searchContainer}>
                <MaterialIcons name="search" size={20} color="#6b7280" />
                <TextInput
                    style={gpsMonitoringStyles.searchInput}
                    placeholder="Search by name, email, or phone..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {error ? (
                <View style={gpsMonitoringStyles.errorContainer}>
                    <MaterialIcons name="error-outline" size={48} color="#ef4444" />
                    <Text style={gpsMonitoringStyles.errorText}>{error}</Text>
                    <Pressable onPress={() => fetchUserLocations(true)} style={gpsMonitoringStyles.retryButton}>
                        <Text style={gpsMonitoringStyles.retryButtonText}>Retry</Text>
                    </Pressable>
                </View>
            ) : (
                <FlatList
                    data={filteredLocations}
                    renderItem={renderLocationItem}
                    keyExtractor={(item) => `${item.userId}-${item.timestamp}`}
                    contentContainerStyle={gpsMonitoringStyles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[colors.primary]}
                            tintColor={colors.primary}
                        />
                    }
                    ListEmptyComponent={
                        <View style={gpsMonitoringStyles.emptyContainer}>
                            <MaterialIcons name="location-off" size={64} color="#9ca3af" />
                            <Text style={gpsMonitoringStyles.emptyText}>
                                {searchQuery ? 'No users found matching your search' : 'No latest GPS locations available'}
                            </Text>
                            <Text style={gpsMonitoringStyles.emptySubtext}>
                                Users need to have GPS tracking enabled and active
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}