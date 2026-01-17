import React from 'react';
import { View, Text, ActivityIndicator, FlatList } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../theme/colors';
import { scale, verticalScale } from '../../../theme/scale';
import type { CarTravelLog } from '../../../../lib/api/services/carTravelLog.service';

interface TravelLogsSectionProps {
    travelLogs: CarTravelLog[];
    loading: boolean;
}

export default function TravelLogsSection({ travelLogs, loading }: TravelLogsSectionProps) {
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

    const renderTravelLogItem = ({ item, index }: { item: CarTravelLog; index: number }) => {
        const dateTime = formatDateTime(item.travelDate);

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
                        <Text style={styles.tollBoothText}>Toll Booth #{item.tollBoothId}</Text>
                    </View>
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

    if (travelLogs.length === 0) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <MaterialIcons name="route" size={24} color={colors.morentBlue} />
                    <Text style={styles.title}>Travel Logs</Text>
                </View>
                <View style={styles.emptyContainer}>
                    <MaterialIcons name="route" size={48} color={colors.placeholder} />
                    <Text style={styles.emptyText}>No travel logs found</Text>
                    <Text style={styles.emptySubtext}>No toll booth charges recorded for this trip</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <MaterialIcons name="route" size={24} color={colors.morentBlue} />
                <Text style={styles.title}>Travel Logs</Text>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{travelLogs.length}</Text>
                </View>
            </View>

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
    },
    tollBoothText: {
        fontSize: scale(12),
        color: colors.placeholder,
        marginLeft: scale(4),
    },
    separator: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: verticalScale(8),
        marginLeft: scale(44),
    },
};