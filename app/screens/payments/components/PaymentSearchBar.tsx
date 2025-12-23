import React from 'react';
import { View, TextInput } from 'react-native';
import { colors } from '../../../theme/colors';
import { styles } from '../styles/paymentSearchBar.styles';

interface PaymentSearchBarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

export default function PaymentSearchBar({ searchQuery, onSearchChange }: PaymentSearchBarProps) {
    return (
        <View style={styles.searchContainer}>
            <TextInput
                placeholder="Search by order code, booking number..."
                value={searchQuery}
                onChangeText={onSearchChange}
                style={styles.searchInput}
                placeholderTextColor={colors.placeholder}
            />
        </View>
    );
}