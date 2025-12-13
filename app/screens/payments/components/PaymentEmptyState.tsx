import React from 'react';
import { View, Text } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../theme/colors';
import { scale } from '../../../theme/scale';
import { styles } from '../styles/paymentEmptyState.styles';

interface PaymentEmptyStateProps {
    searchQuery: string;
}

export default function PaymentEmptyState({ searchQuery }: PaymentEmptyStateProps) {
    return (
        <View style={styles.emptyContainer}>
            <MaterialIcons
                name={searchQuery ? "search-off" : "receipt-long"}
                size={scale(48)}
                color={colors.placeholder}
            />
            <Text style={styles.emptyText}>
                {searchQuery
                    ? `No payments found for "${searchQuery}"`
                    : "No payment history found"
                }
            </Text>
            {searchQuery && (
                <Text style={styles.emptySubText}>
                    Try searching for order code or booking number
                </Text>
            )}
        </View>
    );
}