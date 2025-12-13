import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../styles/staffScreen.styles';

interface StaffErrorStateProps {
    error: string;
}

export default function StaffErrorState({ error }: StaffErrorStateProps) {
    return (
        <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Error loading bookings</Text>
            <Text style={styles.errorMessage}>{error}</Text>
        </View>
    );
}