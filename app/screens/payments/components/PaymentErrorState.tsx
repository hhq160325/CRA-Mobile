import React from 'react';
import { View, Text } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { scale } from '../../../theme/scale';
import { styles } from '../styles/paymentErrorState.styles';

interface PaymentErrorStateProps {
    error: string;
}

export default function PaymentErrorState({ error }: PaymentErrorStateProps) {
    return (
        <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={scale(48)} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
        </View>
    );
}