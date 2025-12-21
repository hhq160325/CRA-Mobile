import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    RefreshControl,
    ActivityIndicator,
    Pressable,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/colors';
import Header from '../../components/Header/Header';
import { gpsTrackingService, type UserLocationHistory } from '../../../lib/api/services/gpsTracking.service';
import { reverseGeocodingService } from '../../../lib/api/services/reverseGeocoding.service';
import type { NavigatorParamList } from '../../navigators/navigation-route';
const { userLocationHistoryStyles: styles } = require('../styles/userLocationHistory.styles');

type UserLocationHistoryRouteProp = RouteProp<
    { params: { userId: string } },
    'params'
>;

interface LocationHistoryItem extends UserLocationHistory {
    timeAgo: string;
    formattedTime: string;
    address?: string;
}

export default function UserLocationHistoryScreen() {
    const route = useRoute<UserLocationHistoryRouteProp>();
    const navigation = useNavigation<StackNavigationProp<NavigatorParamList>>();
    const { userId } = (route.params as any) || {};

    const [locationHistory, setLocationHistory] = useState<LocationHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userInfo, setUserInfo] = useState<any>(null);

    const formatTimeAgo = (timestamp: string): { timeAgo: string; formattedTime: string } => {
        const now = new Date();
        const locationTime = new Date(timestamp);
        const diffMs = now.getTime() - locationTime.getTime();
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);

        let timeAgo: string;
        if (diffMinutes < 1) {
            timeAgo = 'Just now';
        } else if (diffMinutes < 60) {
            timeAgo = `${diffMinutes}m ago`;
        } else if (diffHours < 24) {
            timeAgo = `${diffHours}h ago`;
        } else {
            timeAgo = `${diffDays}d ago`;
        }

        const formattedTime = locationTime.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });

        return { timeAgo, formattedTime };
    };

    const fetchLocationHistory = async (forceRefresh = false) => {
        if (!forceRefresh) setLoading(true);
        setError(null);

        try {
            // Get only the latest location instead of full history
            const result = await gpsTrackingService.getLatestUserLocation(userId);

            if (result.error) {
                setError(result.error.message);
                return;
            }

            if (result.data) {
                // Set user info from the location record
                setUserInfo(result.data.user);

                // Format the single latest location
                const { timeAgo, formattedTime } = formatTimeAgo(result.data.timestamp);
                const latestLocation: LocationHistoryItem = {
                    ...result.data,
                    timeAgo,
                    formattedTime,
                };

                // Fetch address for the location
                try {
                    const address = await reverseGeocodingService.getFormattedAddress(
                        result.data.latitude,
                        result.data.longitude
                    );
                    latestLocation.address = address;
                } catch (error) {
                    console.log('📍 Failed to get address for location:', error);
                }

                setLocationHistory([latestLocation]); // Only show the latest location
            } else {
                setLocationHistory([]);
            }
        } catch (error) {
            console.error('📍 Error fetching latest location:', error);
            setError(error instanceof Error ? error.message : 'Failed to fetch latest location');
        }

        setLoading(false);
        setRefreshing(false);
    };

    useEffect(() => {
        if (userId) {
            fetchLocationHistory();
        }
    }, [userId]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchLocationHistory(true);
    };

    const renderLocationItem = ({ item, index }: { item: LocationHistoryItem; index: number }) => (
        <View style={styles.locationItem}>
            <View style={styles.timelineContainer}>
                <View style={[styles.timelineDot, styles.timelineDotLatest]} />
            </View>

            <View style={styles.locationContent}>
                <View style={styles.locationHeader}>
                    <View style={styles.timestampContainer}>
                        <MaterialIcons name="schedule" size={16} color={colors.primary} />
                        <Text style={styles.locationTime}>
                            {new Date(item.timestamp).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                            })}
                        </Text>
                    </View>
                    <Text style={styles.timeAgo}>{item.timeAgo}</Text>
                </View>

                <View style={styles.locationDetails}>
                    {item.address && (
                        <View style={styles.detailRow}>
                            <MaterialIcons name="place" size={16} color={colors.primary} />
                            <Text style={styles.addressText} numberOfLines={4}>
                                {item.address}
                            </Text>
                        </View>
                    )}

                    <View style={styles.detailRow}>
                        <MaterialIcons name="location-on" size={16} color={colors.primary} />
                        <Text style={styles.coordinatesText}>
                            {item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}
                        </Text>
                    </View>

                    <View style={styles.detailRow}>
                        <MaterialIcons name="speed" size={16} color="#6b7280" />
                        <Text style={styles.speedText}>{item.speed} km/h</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <MaterialIcons name="devices" size={16} color="#6b7280" />
                        <Text style={styles.deviceText}>{item.deviceId}</Text>
                    </View>
                </View>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.container}>
                <Header />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Loading latest location...</Text>
                </View>
            </View>
        );
    }

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
                <Text style={styles.headerTitle}>Latest Location</Text>
            </View>

            {userInfo && (
                <View style={styles.userInfoCard}>
                    <View style={styles.userInfoContent}>
                        <Text style={styles.userInfoName}>{userInfo.fullname}</Text>
                        <Text style={styles.userInfoEmail}>{userInfo.email}</Text>
                        <Text style={styles.userInfoPhone}>{userInfo.phoneNumber}</Text>
                    </View>
                    <View style={styles.locationCount}>
                        <Text style={styles.locationCountNumber}>Latest</Text>
                        <Text style={styles.locationCountLabel}>Location</Text>
                    </View>
                </View>
            )}

            {error ? (
                <View style={styles.errorContainer}>
                    <MaterialIcons name="error-outline" size={48} color="#ef4444" />
                    <Text style={styles.errorText}>{error}</Text>
                    <Pressable onPress={() => fetchLocationHistory(true)} style={styles.retryButton}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </Pressable>
                </View>
            ) : (
                <FlatList
                    data={locationHistory}
                    renderItem={renderLocationItem}
                    keyExtractor={(item) => `${item.userId}-${item.timestamp}`}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[colors.primary]}
                            tintColor={colors.primary}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <MaterialIcons name="location-off" size={64} color="#9ca3af" />
                            <Text style={styles.emptyText}>No latest location available</Text>
                            <Text style={styles.emptySubtext}>User needs to have GPS tracking enabled</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}