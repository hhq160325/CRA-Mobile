import React from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../theme/colors';
import { scale } from '../../../theme/scale';
import PaymentSearchBar from './PaymentSearchBar';
import { styles } from '../styles/paymentHistoryHeader.styles';

interface PaymentHistoryHeaderProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onRefreshStatuses?: () => void;
    refreshing?: boolean;
}

export default function PaymentHistoryHeader({
    searchQuery,
    onSearchChange,
    onRefreshStatuses,
    refreshing = false
}: PaymentHistoryHeaderProps) {
    return (
        <View style={styles.headerSection}>
            <View style={styles.titleRow}>
                <Text style={styles.headerTitle}>Payment History</Text>
                {onRefreshStatuses && (
                    <Pressable
                        onPress={onRefreshStatuses}
                        disabled={refreshing}
                        style={[
                            styles.refreshButton,
                            refreshing && styles.refreshButtonDisabled
                        ]}>
                        {refreshing ? (
                            <ActivityIndicator size="small" color={colors.primary} />
                        ) : (
                            <MaterialIcons
                                name="refresh"
                                size={scale(20)}
                                color={colors.primary}
                            />
                        )}
                    </Pressable>
                )}
            </View>
            <PaymentSearchBar
                searchQuery={searchQuery}
                onSearchChange={onSearchChange}
            />
        </View>
    );
}