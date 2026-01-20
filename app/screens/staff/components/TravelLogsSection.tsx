import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, FlatList, TouchableOpacity, Alert, Dimensions } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../theme/colors';
import { scale, verticalScale } from '../../../theme/scale';
import { carTravelLogService, getAllTollBooths, createRandomTravelLog } from '../../../../lib/api/services/carTravelLog.service';
import type { CarTravelLog, TollBooth, CreateTravelLogRequest } from '../../../../lib/api/services/carTravelLog.service';

interface TravelLogsSectionProps {
    travelLogs: CarTravelLog[];
    loading: boolean;
    carId?: string;
    bookingId?: string;
    onTravelLogsUpdated?: () => void;
}

const { width } = Dimensions.get('window');

export default function TravelLogsSection({
    travelLogs,
    loading,
    carId,
    bookingId,
    onTravelLogsUpdated
}: TravelLogsSectionProps) {
    const [tollBooths, setTollBooths] = useState<TollBooth[]>([]);
    const [tollBoothsLoading, setTollBoothsLoading] = useState(false);
    const [trackingLoading, setTrackingLoading] = useState(false);

    // Debug logging
    console.log('TravelLogsSection: received travel logs:', travelLogs.map(log => `ID: ${log.tollBoothId}, Amount: ${log.chargeAmount}`));

    useEffect(() => {
        loadTollBooths();
    }, []);

    // Helper function to get toll booth name
    const getTollBoothName = (tollBoothId: number): string => {
        const tollBooth = tollBooths.find(booth => booth.id === tollBoothId);
        if (tollBooth) {
            return tollBooth.name;
        }

        // Fallback to mock data if not found in loaded toll booths
        const mockTollBooths = [
            { id: 1, name: "Trạm thu phí xa lộ Hà Nội" },
            { id: 2, name: "Trạm Thu phí Long Phước" },
            { id: 3, name: "Trạm Thu Phí Cầu Ông Bố" },
            { id: 4, name: "Trạm Thu phí Nguyễn Văn Linh" }
        ];

        const mockTollBooth = mockTollBooths.find(booth => booth.id === tollBoothId);
        return mockTollBooth ? mockTollBooth.name : `Toll Booth #${tollBoothId}`;
    };

    const loadTollBooths = async () => {
        setTollBoothsLoading(true);
        try {
            // Try the service object first, fallback to individual function
            const result = carTravelLogService?.getAllTollBooths
                ? await carTravelLogService.getAllTollBooths()
                : await getAllTollBooths();

            if (result.data) {
                // Use the toll booths as-is (they now have real coordinates)
                setTollBooths(result.data);
                console.log('Toll booths loaded:', result.data.map(booth => `ID: ${booth.id}, Name: ${booth.name}`));
            } else if (result.error) {
                console.error('Error loading toll booths:', result.error);
                Alert.alert('Error', 'Failed to load toll booths');
            }
        } catch (error) {
            console.error('Exception loading toll booths:', error);
            Alert.alert('Error', 'Failed to load toll booths');
        } finally {
            setTollBoothsLoading(false);
        }
    };

    const handleTrackingTravelLog = async () => {
        if (!carId || !bookingId) {
            Alert.alert('Error', 'Car ID and Booking ID are required');
            return;
        }

        setTrackingLoading(true);
        try {
            const request: CreateTravelLogRequest = {
                carId,
                bookingId,
                numOfToll: 2, // Default as specified
            };

            // Try the service object first, fallback to individual function
            const result = carTravelLogService?.createRandomTravelLog
                ? await carTravelLogService.createRandomTravelLog(request)
                : await createRandomTravelLog(request);

            if (result.data) {
                Alert.alert('Success', 'Travel log tracking created successfully');
                // Refresh travel logs
                if (onTravelLogsUpdated) {
                    onTravelLogsUpdated();
                }
            } else if (result.error) {
                console.error('Error creating travel log:', result.error);
                Alert.alert(
                    'API Error',
                    'The server is currently experiencing issues. Please try again later or contact support if the problem persists.'
                );
            }
        } catch (error) {
            console.error('Exception creating travel log:', error);
            Alert.alert(
                'Network Error',
                'Unable to connect to the server. Please check your internet connection and try again.'
            );
        } finally {
            setTrackingLoading(false);
        }
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            }),
            time: date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
            }),
        };
    };

    const formatAmount = (amount: number) => {
        return amount.toLocaleString('vi-VN') + ' VND';
    };

    const getTotalAmount = () => {
        return travelLogs.reduce((total, log) => total + log.chargeAmount, 0);
    };

    const renderTollBoothMapItem = ({ item }: { item: TollBooth }) => (
        <View style={styles.mapItem}>
            <View style={styles.mapMarker}>
                <MaterialIcons name="toll" size={16} color={colors.white} />
            </View>
            <View style={styles.mapItemInfo}>
                <Text style={styles.mapItemName}>{item.name}</Text>
                <Text style={styles.mapItemLocation}>{item.location}</Text>
                <Text style={styles.mapItemCharge}>
                    {item.chargeAmount.toLocaleString('vi-VN')} VND
                </Text>
                <Text style={styles.mapItemCoords}>
                    {item.latitude?.toFixed(4)}, {item.longitude?.toFixed(4)}
                </Text>
            </View>
        </View>
    );

    const renderTravelLogItem = ({ item, index }: { item: CarTravelLog; index: number }) => {
        const dateTime = formatDateTime(item.travelDate);
        const tollBooth = tollBooths.find(booth => booth.id === item.tollBoothId);
        const tollBoothName = getTollBoothName(item.tollBoothId);

        // Debug logging
        console.log(`Travel log ${index + 1}: tollBoothId=${item.tollBoothId}, resolved name: ${tollBoothName}`);

        return (
            <View style={styles.logItem}>
                <View style={styles.logHeader}>
                    <View style={styles.logIndex}>
                        <Text style={styles.logIndexText}>{index + 1}</Text>
                    </View>
                    <View style={styles.logMainInfo}>
                        <Text style={styles.logDate}>{dateTime.date}</Text>
                        <Text style={styles.logTime}>{dateTime.time}</Text>
                    </View>
                    <View style={styles.logAmount}>
                        <Text style={styles.logAmountText}>{formatAmount(item.chargeAmount)}</Text>
                    </View>
                </View>
                <View style={styles.logDetails}>
                    <View style={styles.tollBoothInfo}>
                        <MaterialIcons name="toll" size={16} color={colors.morentBlue} />
                        <Text style={styles.tollBoothText}>
                            {tollBoothName}
                        </Text>
                    </View>
                    {tollBooth && (
                        <>
                            <Text style={styles.tollBoothLocation}>{tollBooth.location}</Text>
                            <Text style={styles.tollBoothCharge}>
                                Standard Rate: {tollBooth.chargeAmount.toLocaleString('vi-VN')} VND
                            </Text>
                        </>
                    )}
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <MaterialIcons name="route" size={24} color={colors.morentBlue} />
                    <Text style={styles.title}>Travel Logs</Text>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={colors.morentBlue} />
                    <Text style={styles.loadingText}>Loading travel logs...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <MaterialIcons name="route" size={24} color={colors.morentBlue} />
                <Text style={styles.title}>Travel Logs</Text>
                {travelLogs.length > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{travelLogs.length}</Text>
                    </View>
                )}
            </View>

            {/* Tracking Button */}
            <TouchableOpacity
                style={[styles.trackingButton, trackingLoading && styles.trackingButtonDisabled]}
                onPress={handleTrackingTravelLog}
                disabled={trackingLoading || !carId || !bookingId}
            >
                {trackingLoading ? (
                    <ActivityIndicator size="small" color={colors.white} />
                ) : (
                    <MaterialIcons name="gps-fixed" size={20} color={colors.white} />
                )}
                <Text style={styles.trackingButtonText}>
                    {trackingLoading ? 'Creating...' : 'Tracking Travel Log'}
                </Text>
            </TouchableOpacity>

            {/* Toll Booths Map */}
            <View style={styles.mapSection}>
                <View style={styles.mapHeader}>
                    <MaterialIcons name="map" size={20} color={colors.morentBlue} />
                    <Text style={styles.mapTitle}>Toll Booths Map</Text>
                    {tollBooths.length > 0 && (
                        <View style={styles.mapBadge}>
                            <Text style={styles.mapBadgeText}>{tollBooths.length}</Text>
                        </View>
                    )}
                </View>

                {tollBoothsLoading ? (
                    <View style={styles.mapLoadingContainer}>
                        <ActivityIndicator size="small" color={colors.morentBlue} />
                        <Text style={styles.loadingText}>Loading toll booths...</Text>
                    </View>
                ) : tollBooths.length > 0 ? (
                    <FlatList
                        data={tollBooths}
                        renderItem={renderTollBoothMapItem}
                        keyExtractor={(item) => item.id.toString()}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.mapList}
                        ItemSeparatorComponent={() => <View style={styles.mapItemSeparator} />}
                    />
                ) : (
                    <View style={styles.mapEmptyContainer}>
                        <MaterialIcons name="map" size={32} color={colors.placeholder} />
                        <Text style={styles.emptyText}>No toll booths available</Text>
                    </View>
                )}
            </View>

            {/* Travel Logs */}
            {travelLogs.length > 0 ? (
                <>
                    {/* Summary */}
                    <View style={styles.summary}>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Total Charges</Text>
                            <Text style={styles.summaryValue}>{formatAmount(getTotalAmount())}</Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Toll Booths</Text>
                            <Text style={styles.summaryValue}>{travelLogs.length} locations</Text>
                        </View>
                    </View>

                    {/* Travel Logs List */}
                    <FlatList
                        data={travelLogs}
                        renderItem={renderTravelLogItem}
                        keyExtractor={(item, index) => `${item.carId}-${item.bookingId}-${index}`}
                        showsVerticalScrollIndicator={false}
                        scrollEnabled={false}
                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                    />
                </>
            ) : (
                <View style={styles.emptyContainer}>
                    <MaterialIcons name="route" size={48} color={colors.placeholder} />
                    <Text style={styles.emptyText}>No travel logs found</Text>
                    <Text style={styles.emptySubtext}>Click "Tracking Travel Log" to create travel logs</Text>
                </View>
            )}
        </View>
    );
}

const styles = {
    container: {
        backgroundColor: colors.white,
        borderRadius: scale(12),
        padding: scale(16),
        marginBottom: verticalScale(16),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    header: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        marginBottom: verticalScale(16),
    },
    title: {
        fontSize: scale(18),
        fontWeight: '600' as const,
        color: colors.primary,
        marginLeft: scale(8),
        flex: 1,
    },
    badge: {
        backgroundColor: colors.morentBlue,
        borderRadius: scale(12),
        paddingHorizontal: scale(8),
        paddingVertical: scale(4),
        minWidth: scale(24),
        alignItems: 'center' as const,
    },
    badgeText: {
        color: colors.white,
        fontSize: scale(12),
        fontWeight: '600' as const,
    },
    trackingButton: {
        backgroundColor: colors.morentBlue,
        borderRadius: scale(8),
        paddingVertical: verticalScale(12),
        paddingHorizontal: scale(16),
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        marginBottom: verticalScale(16),
    },
    trackingButtonDisabled: {
        backgroundColor: colors.placeholder,
    },
    trackingButtonText: {
        color: colors.white,
        fontSize: scale(14),
        fontWeight: '600' as const,
        marginLeft: scale(8),
    },
    mapSection: {
        marginBottom: verticalScale(16),
    },
    mapHeader: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        marginBottom: verticalScale(12),
    },
    mapTitle: {
        fontSize: scale(16),
        fontWeight: '600' as const,
        color: colors.primary,
        marginLeft: scale(8),
        flex: 1,
    },
    mapBadge: {
        backgroundColor: colors.success,
        borderRadius: scale(10),
        paddingHorizontal: scale(6),
        paddingVertical: scale(2),
        minWidth: scale(20),
        alignItems: 'center' as const,
    },
    mapBadgeText: {
        color: colors.white,
        fontSize: scale(10),
        fontWeight: '600' as const,
    },
    mapList: {
        paddingHorizontal: scale(4),
    },
    mapItem: {
        backgroundColor: colors.lightGray,
        borderRadius: scale(8),
        padding: scale(12),
        width: width * 0.6,
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
    },
    mapMarker: {
        width: scale(32),
        height: scale(32),
        borderRadius: scale(16),
        backgroundColor: colors.morentBlue,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        marginRight: scale(12),
    },
    mapItemInfo: {
        flex: 1,
    },
    mapItemName: {
        fontSize: scale(14),
        fontWeight: '600' as const,
        color: colors.primary,
        marginBottom: verticalScale(2),
    },
    mapItemLocation: {
        fontSize: scale(12),
        color: colors.placeholder,
        marginBottom: verticalScale(2),
    },
    mapItemCharge: {
        fontSize: scale(12),
        color: colors.morentBlue,
        fontWeight: '600' as const,
        marginBottom: verticalScale(2),
    },
    mapItemCoords: {
        fontSize: scale(10),
        color: colors.morentBlue,
        fontFamily: 'monospace',
    },
    mapItemSeparator: {
        width: scale(8),
    },
    mapLoadingContainer: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        paddingVertical: verticalScale(20),
    },
    mapEmptyContainer: {
        alignItems: 'center' as const,
        paddingVertical: verticalScale(20),
    },
    loadingContainer: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        paddingVertical: verticalScale(20),
    },
    loadingText: {
        marginLeft: scale(8),
        color: colors.placeholder,
        fontSize: scale(14),
    },
    emptyContainer: {
        alignItems: 'center' as const,
        paddingVertical: verticalScale(32),
    },
    emptyText: {
        fontSize: scale(16),
        fontWeight: '500' as const,
        color: colors.placeholder,
        marginTop: verticalScale(12),
    },
    emptySubtext: {
        fontSize: scale(14),
        color: colors.placeholder,
        marginTop: verticalScale(4),
        textAlign: 'center' as const,
    },
    summary: {
        flexDirection: 'row' as const,
        backgroundColor: colors.lightGray,
        borderRadius: scale(8),
        padding: scale(12),
        marginBottom: verticalScale(16),
    },
    summaryItem: {
        flex: 1,
        alignItems: 'center' as const,
    },
    summaryLabel: {
        fontSize: scale(12),
        color: colors.placeholder,
        marginBottom: verticalScale(4),
    },
    summaryValue: {
        fontSize: scale(14),
        fontWeight: '600' as const,
        color: colors.primary,
    },
    logItem: {
        paddingVertical: verticalScale(12),
    },
    logHeader: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        marginBottom: verticalScale(8),
    },
    logIndex: {
        width: scale(32),
        height: scale(32),
        borderRadius: scale(16),
        backgroundColor: colors.morentBlue,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        marginRight: scale(12),
    },
    logIndexText: {
        color: colors.white,
        fontSize: scale(14),
        fontWeight: '600' as const,
    },
    logMainInfo: {
        flex: 1,
    },
    logDate: {
        fontSize: scale(14),
        fontWeight: '500' as const,
        color: colors.primary,
    },
    logTime: {
        fontSize: scale(12),
        color: colors.placeholder,
        marginTop: verticalScale(2),
    },
    logAmount: {
        alignItems: 'flex-end' as const,
    },
    logAmountText: {
        fontSize: scale(16),
        fontWeight: '600' as const,
        color: colors.morentBlue,
    },
    logDetails: {
        marginLeft: scale(44),
    },
    tollBoothInfo: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        marginBottom: verticalScale(2),
    },
    tollBoothText: {
        fontSize: scale(12),
        color: colors.placeholder,
        marginLeft: scale(4),
        fontWeight: '500' as const,
    },
    tollBoothLocation: {
        fontSize: scale(11),
        color: colors.placeholder,
        marginLeft: scale(20),
        fontStyle: 'italic' as const,
    },
    tollBoothCharge: {
        fontSize: scale(11),
        color: colors.morentBlue,
        marginLeft: scale(20),
        fontWeight: '500' as const,
    },
    separator: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: verticalScale(8),
        marginLeft: scale(44),
    },
};