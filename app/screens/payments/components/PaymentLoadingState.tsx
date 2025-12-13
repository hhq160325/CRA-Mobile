import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { colors } from '../../../theme/colors';
import { styles } from '../styles/paymentLoadingState.styles';

export default function PaymentLoadingState() {
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading payment history...</Text>
        </View>
    );
}