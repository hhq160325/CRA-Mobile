import React from 'react';
import { View, Text } from 'react-native';
import { colors } from '../../../theme/colors';
import { scale } from '../../../theme/scale';
import PaymentSearchBar from './PaymentSearchBar';
import { styles } from '../styles/paymentHistoryHeader.styles';

interface PaymentHistoryHeaderProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

export default function PaymentHistoryHeader({
    searchQuery,
    onSearchChange,
}: PaymentHistoryHeaderProps) {
    return (
        <View style={styles.headerSection}>
            <View style={styles.titleRow}>
                <Text style={styles.headerTitle}>Payment History</Text>
            </View>
            <PaymentSearchBar
                searchQuery={searchQuery}
                onSearchChange={onSearchChange}
            />
        </View>
    );
}