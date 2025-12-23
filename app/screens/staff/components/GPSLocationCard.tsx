import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ActivityIndicator, Modal, Linking, Alert } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../theme/colors';
import { useUserLocation } from '../../../../lib/hooks/useUserLocation';
import { reverseGeocodingService } from '../../../../lib/api/services/reverseGeocoding.service';
import { gpsLocationCardStyles } from '../styles/gpsLocationCard.styles';

interface GPSLocationCardProps {
    userId: string;
    visible: boolean;
    onClose: () => void;
}

export default function GPSLocationCard({ userId, visible, onClose }: GPSLocationCardProps) {
    const { location, loading, error, timeAgo, refetch } = useUserLocation(userId);
    const [oldAddress, setOldAddress] = useState<string | null>(null);
    const [addressLoading, setAddressLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Debug logging
    useEffect(() => {
        if (visible) {
            // console.log('🔍 GPSLocationCard: Modal opened for userId:', userId);
            // console.log('🔍 GPSLocationCard: Location data:', location);
            // console.log('🔍 GPSLocationCard: Loading:', loading);
            // console.log('🔍 GPSLocationCard: Error:', error);
        }
    }, [visible, userId, location, loading, error]);

    // Fetch old formatted address when location is available
    useEffect(() => {
        if (location && visible) {
            // console.log('📍 GPSLocationCard: Location updated, fetching address');
            fetchOldAddress();
        }
    }, [location, visible]);

    // Re-fetch address when refresh is completed and location is available
    useEffect(() => {
        if (location && !refreshing && !addressLoading) {
            // console.log('📍 GPSLocationCard: Refresh completed, updating address');
            fetchOldAddress();
        }
    }, [location, refreshing]);

    const fetchOldAddress = async () => {
        if (!location) return;

        setAddressLoading(true);
        try {
            const address = await reverseGeocodingService.getOldFormattedAddress(
                location.latitude,
                location.longitude
            );
            setOldAddress(address);
        } catch (error) {
            // console.error('📍 Error fetching old address:', error);
            setOldAddress(null);
        } finally {
            setAddressLoading(false);
        }
    };

    const handleRefresh = async () => {
        // console.log('🔄 GPSLocationCard: Refresh button clicked');
        // console.log('🔄 GPSLocationCard: Current location:', location);
        // console.log('🔄 GPSLocationCard: Current error:', error);

        setRefreshing(true);

        try {
            // Clear old address first
            setOldAddress(null);

            // Call refetch from useUserLocation hook
            await refetch();

            // console.log('🔄 GPSLocationCard: Refetch completed');
        } catch (error) {
            // console.error('🔄 GPSLocationCard: Refresh error:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const handleRetry = async () => {
        // console.log('🔄 GPSLocationCard: Retry button clicked');
        // console.log('🔄 GPSLocationCard: Current error:', error);

        setRefreshing(true);

        try {
            // Clear old address and error state
            setOldAddress(null);

            // Call refetch from useUserLocation hook
            await refetch();

            // console.log('🔄 GPSLocationCard: Retry completed');
        } catch (error) {
            // console.error('🔄 GPSLocationCard: Retry error:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const handleOpenMap = async () => {
        if (!location) {
            // console.log('📍 GPSLocationCard: No location data for map');
            Alert.alert('Error', 'No location data available to show on map');
            return;
        }

        // console.log('🗺️ GPSLocationCard: Opening map for location:', location.latitude, location.longitude);

        // Create map URL with the customer's location
        const mapUrl = `https://www.google.com/maps?q=${location.latitude},${location.longitude}&z=15`;
        // console.log('🗺️ Map URL:', mapUrl);

        try {
            // console.log('🗺️ Attempting to open URL with Linking...');

            // Check if we can open URLs
            const canOpen = await Linking.canOpenURL(mapUrl);
            // console.log('🗺️ Can open URL:', canOpen);

            if (canOpen) {
                // console.log('🗺️ Opening URL now...');
                await Linking.openURL(mapUrl);
                // console.log('🗺️ URL opened successfully');
            } else {
                // console.log('🗺️ Cannot open URL, trying alternative...');
                // Try a simpler Google Maps URL
                const simpleUrl = `https://maps.google.com/?q=${location.latitude},${location.longitude}`;
                // console.log('🗺️ Trying simple URL:', simpleUrl);
                await Linking.openURL(simpleUrl);
                // console.log('🗺️ Simple URL opened successfully');
            }
        } catch (error) {
            // console.error('🗺️ Error opening map:', error);
            // console.error('🗺️ Error details:', JSON.stringify(error, null, 2));

            Alert.alert(
                'Map Error',
                `Unable to open map application.\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}\n\nURL: ${mapUrl}`,
                [
                    {
                        text: 'Copy URL', onPress: () => {
                            // In a real app, you might want to copy to clipboard
                            // console.log('🗺️ URL to copy:', mapUrl);
                        }
                    },
                    { text: 'OK' }
                ]
            );
        }
    };

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={gpsLocationCardStyles.modalOverlay}>
                <View style={gpsLocationCardStyles.modalContent}>
                    {/* Header */}
                    <View style={gpsLocationCardStyles.header}>
                        <View style={gpsLocationCardStyles.headerLeft}>
                            <MaterialIcons name="location-on" size={24} color={colors.primary} />
                            <Text style={gpsLocationCardStyles.headerTitle}>Customer GPS Location</Text>
                        </View>
                        <Pressable onPress={onClose} style={gpsLocationCardStyles.closeButton}>
                            <MaterialIcons name="close" size={24} color="#6b7280" />
                        </Pressable>
                    </View>

                    {loading ? (
                        <View style={gpsLocationCardStyles.loadingContainer}>
                            <ActivityIndicator size="large" color={colors.primary} />
                            <Text style={gpsLocationCardStyles.loadingText}>Loading GPS data...</Text>
                        </View>
                    ) : error || !location ? (
                        <View style={gpsLocationCardStyles.errorContainer}>
                            <MaterialIcons name="location-off" size={48} color="#ef4444" />
                            <Text style={gpsLocationCardStyles.errorText}>No GPS data available</Text>
                            <Pressable
                                onPress={handleRetry}
                                style={[
                                    gpsLocationCardStyles.retryButton,
                                    refreshing && gpsLocationCardStyles.retryButtonDisabled
                                ]}
                                disabled={refreshing}
                            >
                                {refreshing ? (
                                    <ActivityIndicator size="small" color={colors.primary} />
                                ) : (
                                    <MaterialIcons name="refresh" size={16} color={colors.primary} />
                                )}
                                <Text style={gpsLocationCardStyles.retryText}>
                                    {refreshing ? 'Loading...' : 'Retry'}
                                </Text>
                            </Pressable>
                        </View>
                    ) : (
                        <View style={gpsLocationCardStyles.content}>
                            {/* Old Formatted Address */}
                            <View style={gpsLocationCardStyles.infoRow}>
                                <MaterialIcons name="place" size={20} color={colors.primary} />
                                <View style={gpsLocationCardStyles.infoContent}>
                                    <Text style={gpsLocationCardStyles.infoLabel}>Address</Text>
                                    {addressLoading ? (
                                        <View style={gpsLocationCardStyles.addressLoading}>
                                            <ActivityIndicator size="small" color={colors.primary} />
                                            <Text style={gpsLocationCardStyles.addressLoadingText}>Getting address...</Text>
                                        </View>
                                    ) : (
                                        <Text style={gpsLocationCardStyles.infoValue} numberOfLines={5}>
                                            {oldAddress || `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`}
                                        </Text>
                                    )}
                                </View>
                            </View>

                            {/* Speed */}
                            <View style={gpsLocationCardStyles.infoRow}>
                                <MaterialIcons name="speed" size={20} color="#f59e0b" />
                                <View style={gpsLocationCardStyles.infoContent}>
                                    <Text style={gpsLocationCardStyles.infoLabel}>Speed</Text>
                                    <Text style={gpsLocationCardStyles.infoValue}>{location.speed} km/h</Text>
                                </View>
                            </View>

                            {/* Time Ago */}
                            <View style={gpsLocationCardStyles.infoRow}>
                                <MaterialIcons name="access-time" size={20} color="#10b981" />
                                <View style={gpsLocationCardStyles.infoContent}>
                                    <Text style={gpsLocationCardStyles.infoLabel}>Last Update</Text>
                                    <Text style={gpsLocationCardStyles.infoValue}>{timeAgo}</Text>
                                </View>
                            </View>

                            {/* Device ID */}
                            <View style={gpsLocationCardStyles.infoRow}>
                                <MaterialIcons name="devices" size={20} color="#6366f1" />
                                <View style={gpsLocationCardStyles.infoContent}>
                                    <Text style={gpsLocationCardStyles.infoLabel}>Device ID</Text>
                                    <Text style={gpsLocationCardStyles.infoValue}>{location.deviceId}</Text>
                                </View>
                            </View>

                            {/* Coordinates (Additional Info) */}
                            <View style={gpsLocationCardStyles.infoRow}>
                                <MaterialIcons name="my-location" size={20} color="#6b7280" />
                                <View style={gpsLocationCardStyles.infoContent}>
                                    <Text style={gpsLocationCardStyles.infoLabel}>Coordinates</Text>
                                    <Text style={gpsLocationCardStyles.infoValueSmall}>
                                        {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Footer */}
                    <View style={gpsLocationCardStyles.footer}>
                        <Pressable
                            onPress={handleRefresh}
                            style={[
                                gpsLocationCardStyles.refreshButton,
                                refreshing && gpsLocationCardStyles.refreshButtonDisabled
                            ]}
                            disabled={refreshing}
                        >
                            {refreshing ? (
                                <ActivityIndicator size="small" color={colors.primary} />
                            ) : (
                                <MaterialIcons name="refresh" size={16} color={colors.primary} />
                            )}
                            <Text style={gpsLocationCardStyles.refreshText}>
                                {refreshing ? 'Loading...' : 'Refresh'}
                            </Text>
                        </Pressable>

                        {/* Open Map Button */}
                        {location && (
                            <Pressable
                                onPress={handleOpenMap}
                                style={gpsLocationCardStyles.mapButton}
                            >
                                <MaterialIcons name="map" size={16} color={colors.primary} />
                                <Text style={gpsLocationCardStyles.mapText}>Open Map</Text>
                            </Pressable>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
}