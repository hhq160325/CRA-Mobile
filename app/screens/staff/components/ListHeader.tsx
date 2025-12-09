import React from 'react';
import { View, TextInput, Pressable, Text } from 'react-native';
import { styles } from '../staff.screen.styles';

type PaymentStatus = 'all' | 'successfully' | 'pending' | 'cancelled';

interface ListHeaderProps {
    searchQuery: string;
    onSearchChange: (text: string) => void;
    statusFilter: PaymentStatus;
    onStatusChange: (status: PaymentStatus) => void;
}

export const ListHeader: React.FC<ListHeaderProps> = ({
    searchQuery,
    onSearchChange,
    statusFilter,
    onStatusChange,
}) => {
    const statusOptions: PaymentStatus[] = [
        'all',
        'successfully',
        'pending',
        'cancelled',
    ];

    const getStatusLabel = (status: PaymentStatus): string => {
        switch (status) {
            case 'all':
                return 'All';
            case 'successfully':
                return 'Success';
            case 'pending':
                return 'Pending';
            case 'cancelled':
                return 'Cancelled';
            default:
                return status;
        }
    };

    return (
        <>
            {/* Search Bar */}
            <View style={styles.searchBar}>
                <TextInput
                    placeholder="Search by car, customer, booking number, or ID..."
                    value={searchQuery}
                    onChangeText={onSearchChange}
                    style={styles.searchInput}
                />
            </View>

            {/* Status Filter Tabs */}
            <View style={styles.filterContainer}>
                {statusOptions.map(status => (
                    <Pressable
                        key={status}
                        onPress={() => onStatusChange(status)}
                        style={[
                            styles.filterButton,
                            statusFilter === status
                                ? styles.filterButtonActive
                                : styles.filterButtonInactive,
                        ]}>
                        <Text
                            style={[
                                styles.filterText,
                                statusFilter === status
                                    ? styles.filterTextActive
                                    : styles.filterTextInactive,
                            ]}>
                            {getStatusLabel(status)}
                        </Text>
                    </Pressable>
                ))}
            </View>
        </>
    );
};
