import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../styles/staffScreen.styles';

export default function StaffEmptyState() {
    return (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No payments found</Text>
        </View>
    );
}