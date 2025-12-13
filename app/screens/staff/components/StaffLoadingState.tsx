import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { colors } from '../../../theme/colors';
import { styles } from '../styles/staffScreen.styles';

export default function StaffLoadingState() {
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading bookings...</Text>
        </View>
    );
}